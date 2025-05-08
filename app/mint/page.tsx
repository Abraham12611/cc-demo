'use client';

import React, { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { WebIrys } from '@irys/sdk';
import { PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { Metaplex } from "@metaplex-foundation/js";
import { walletAdapterIdentity } from "@metaplex-foundation/js";
import { UploadCloud, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface AssetMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
}

export default function MintPage() {
  const { publicKey, signTransaction, wallet } = useWallet();
  const { connection } = useConnection();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [licenceTemplate, setLicenceTemplate] = useState<string>('0x01');
  const [royaltySplits, setRoyaltySplits] = useState([{ address: '', percentage: 100 }]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [mintStatus, setMintStatus] = useState<string>('');
  const [bundlrInstance, setBundlrInstance] = useState<WebIrys | null>(null);
  const [isBundlrReady, setIsBundlrReady] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const initializeBundlr = useCallback(async () => {
    if (!wallet || !wallet.adapter.connected || !publicKey || !connection) {
        console.log("InitializeBundlr pre-conditions not met:", {
            hasWallet: !!wallet,
            adapterConnected: wallet?.adapter.connected,
            hasPublicKey: !!publicKey,
            hasConnection: !!connection
        });
        return;
    }
    setIsBundlrReady(false);
    setBundlrInstance(null);
    setMintStatus('Initializing Irys for minting...');
    const network = "https://devnet.irys.xyz";
    const providerUrl = connection.rpcEndpoint;
    const token = "solana";
    if (!wallet.adapter) {
        console.error("Wallet adapter is not available.");
        setMintStatus('Error: Wallet adapter not available.');
        return;
    }
    try {
        const webIrys = new WebIrys({
            url: network,
            token,
            wallet: { name: "solana", provider: wallet.adapter },
            config: { providerUrl, timeout: 60000 }
        });
        await webIrys.ready();
        await new Promise(resolve => setTimeout(resolve, 200));
        if (webIrys.address) {
           setBundlrInstance(webIrys);
           setIsBundlrReady(true);
           setMintStatus('Irys ready for minting.');
        } else {
           throw new Error("Irys address undefined after ready().");
        }
    } catch (error) {
        console.error("Error during Irys initialization:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        setMintStatus(`Error initializing Irys: ${errorMessage}`);
        setIsBundlrReady(false);
    }
  }, [wallet, connection, publicKey]);

  React.useEffect(() => {
      if (wallet?.adapter.connected && publicKey && !isBundlrReady && !bundlrInstance) {
          initializeBundlr();
      }
      if (!wallet?.adapter.connected && (bundlrInstance || isBundlrReady)) {
          setBundlrInstance(null);
          setIsBundlrReady(false);
          setMintStatus('');
      }
  }, [wallet?.adapter.connected, publicKey, isBundlrReady, initializeBundlr, bundlrInstance]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(selectedFile));
      }
    } else {
      setFile(null);
      setPreviewUrl(null);
    }
  };

  const uploadFileData = async (fileToUpload: File): Promise<string> => {
    if (!bundlrInstance || !isBundlrReady || !publicKey) throw new Error("Irys not ready or wallet not connected");
    const fileBuffer = await fileToUpload.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);
    setMintStatus(`Estimating upload cost for ${fileToUpload.name}...`);
    const price = await bundlrInstance.getPrice(buffer.length);
    setMintStatus(`Upload cost: ${bundlrInstance.utils.fromAtomic(price)} SOL`);

    setMintStatus("Checking Irys balance...");
    const balance = await bundlrInstance.getLoadedBalance();

    if (price.isGreaterThan(balance)) {
        setMintStatus(`Funding Irys node with ${bundlrInstance.utils.fromAtomic(price)} SOL...`);
        try {
            if (publicKey) {
                const solBalance = await connection.getBalance(publicKey);
                console.log(`Current SOL balance: ${solBalance / 1e9} SOL`);
                if (solBalance === 0) {
                  throw new Error("Your Solana wallet has no SOL. Please fund your wallet with devnet SOL first.");
                }
            } else {
                throw new Error("Wallet public key is null, cannot check balance.");
            }

            let fundTxResponse;
            let retries = 0;
            const maxRetries = 3;

            while (retries < maxRetries) {
                try {
                    fundTxResponse = await bundlrInstance.fund(price);
                    console.log('Funding transaction response:', fundTxResponse);
                    setMintStatus("Funding transaction sent. Waiting for confirmation...");
                    break;
                } catch (e) {
                    retries++;
                    console.log(`Funding attempt ${retries} failed:`, e);
                    if (retries >= maxRetries) throw e;

                    const backoffTime = Math.pow(2, retries) * 1000;
                    setMintStatus(`Funding attempt failed, retrying in ${backoffTime/1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, backoffTime));
                }
            }

            setMintStatus("Funding transaction sent. Waiting for confirmation (approx 15s)...");
            await new Promise(resolve => setTimeout(resolve, 15000));

            const newBalance = await bundlrInstance.getLoadedBalance();
            if (newBalance.isLessThan(price)) {
                throw new Error("Funding transaction may not have been confirmed. Please check your wallet and try again.");
            }

            setMintStatus("Funding confirmed. Proceeding with upload...");
        } catch (fundError) {
             console.error("Irys funding failed:", fundError);
             throw new Error(`Irys funding failed: ${fundError instanceof Error ? fundError.message : String(fundError)}`);
        }
    } else {
        setMintStatus("Sufficient balance. Starting upload...");
    }

    setMintStatus(`Uploading ${fileToUpload.name}...`);
    const uploadResponse = await bundlrInstance.upload(buffer, {
        tags: [
            { name: "Content-Type", value: fileToUpload.type },
            { name: "App-Name", value: "CreatorClaim" },
            { name: "Uploader", value: publicKey.toString() }
        ]
    });
    setMintStatus(`File uploaded! Arweave TX: ${uploadResponse.id}`);
    return uploadResponse.id;
  };

  const uploadMetadata = async (metadataObject: AssetMetadata): Promise<string> => {
    if (!bundlrInstance || !isBundlrReady || !publicKey) throw new Error("Irys not ready or wallet not connected");
    const metadataString = JSON.stringify(metadataObject);
    const buffer = Buffer.from(metadataString, 'utf8');
    const tags = [
        { name: "Content-Type", value: "application/json" },
        { name: "App-Name", value: "CreatorClaim" },
        { name: "Version", value: "0.1.0" },
        { name: "Title", value: metadataObject.name },
        { name: "Uploader", value: publicKey.toString() }
    ];
    setMintStatus("Estimating metadata upload cost...");
    const price = await bundlrInstance.getPrice(buffer.length);
    setMintStatus(`Metadata upload cost: ${bundlrInstance.utils.fromAtomic(price)} SOL`);

    setMintStatus("Checking Irys balance for metadata...");
    const balance = await bundlrInstance.getLoadedBalance();
    if (price.isGreaterThan(balance)) {
        setMintStatus(`Funding Irys for metadata: ${bundlrInstance.utils.fromAtomic(price)} SOL...`);
         try {
            const fundTxResponse = await bundlrInstance.fund(price);
            console.log('Metadata Funding transaction response:', fundTxResponse);
            setMintStatus("Metadata Funding transaction sent. Waiting for confirmation (approx 10s)...");
            await new Promise(resolve => setTimeout(resolve, 10000));
            setMintStatus("Metadata Funding confirmation delay complete. Uploading metadata...");
        } catch (fundError) {
             console.error("Metadata Irys funding failed:", fundError);
             throw new Error(`Metadata Irys funding failed: ${fundError instanceof Error ? fundError.message : String(fundError)}`);
        }
    } else {
        setMintStatus("Sufficient balance. Uploading metadata...");
    }

    setMintStatus("Uploading metadata JSON...");
    const uploadResponse = await bundlrInstance.upload(buffer, { tags });
    setMintStatus(`Metadata uploaded! Arweave TX: ${uploadResponse.id}`);
    return uploadResponse.id;
  }

  const verifyMetadataAccess = async (uri: string): Promise<boolean> => {
    try {
      setMintStatus(`Verifying metadata accessibility at ${uri}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }
      return true;
    } catch (error) {
      console.warn(`Metadata not yet accessible: ${error}`);
      return false;
    }
  };

  const mintNftOnSolana = async (metadataUri: string, name: string): Promise<string> => {
    if (!wallet || !publicKey || !connection) {
      throw new Error("Wallet not connected");
    }

    try {
      setMintStatus("Creating Certificate on Solana using Metaplex...");

      const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(wallet.adapter));

      const { nft } = await metaplex.nfts().create({
        uri: metadataUri,
        name: name,
        sellerFeeBasisPoints: 0,
      });

      console.log("Certificate created with address:", nft.address.toString());
      return nft.address.toString();
    } catch (error) {
      console.error('Solana minting failed:', error);
      throw new Error(`Solana minting failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const saveToLocalStorage = (record: any) => {
    try {
      console.log("Saving mint record to localStorage:", record);
      const existingRecords = JSON.parse(localStorage.getItem('mintRecords') || '[]');
      console.log("Existing records in localStorage:", existingRecords.length);

      localStorage.setItem('mintRecords', JSON.stringify([...existingRecords, record]));

      const verifyRecords = JSON.parse(localStorage.getItem('mintRecords') || '[]');
      console.log("Updated localStorage records count:", verifyRecords.length);

      return true;
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
      return false;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || !publicKey || !bundlrInstance || !signTransaction || !isBundlrReady) {
      setMintStatus('Error: File, connected wallet, and ready Irys instance required.');
      return;
    }
    setIsProcessing(true);
    setMintStatus('Starting mint process...');
    try {
      const fileTxId = await uploadFileData(file);
      const fileUri = `https://arweave.net/${fileTxId}`;
      const metadata: AssetMetadata = {
          name: title,
          description: description,
          image: fileUri,
          attributes: [{ trait_type: "Licence Template", value: licenceTemplate }],
      };
      const metadataTxId = await uploadMetadata(metadata);
      const metadataUri = `https://arweave.net/${metadataTxId}`;
      await verifyMetadataAccess(metadataUri);
      const nftAddress = await mintNftOnSolana(metadataUri, title);
      setMintStatus(`Certificate successfully minted! Solana Address: ${nftAddress}`);
      saveToLocalStorage({ title, imageUri: fileUri, metadataUri, nftAddress, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Processing failed:', error);
      setMintStatus(`Processing failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight-navy flex flex-col items-center justify-center p-4 sm:p-6 text-neon-text">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold text-pure-white mb-10 text-center">Mint New Certificate</h1>

        {!publicKey ? (
          <div className="bg-black/50 p-8 rounded-xl shadow-2xl text-center">
            <AlertTriangle size={48} className="mx-auto mb-4 text-amber-400" />
            <p className="text-xl text-amber-400">Please connect your Solana wallet to mint.</p>
          </div>
        ) : !isBundlrReady ? (
          <div className="bg-black/50 p-8 rounded-xl shadow-2xl text-center">
            <Loader2 size={48} className="mx-auto mb-4 text-neon-lilac animate-spin" />
            <p className="text-xl text-neon-lilac">{mintStatus || 'Initializing Irys for minting...'}</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-8 bg-black/40 p-6 sm:p-10 rounded-xl shadow-2xl border border-neon-lilac/20"
          >
            <div>
              <label htmlFor="file-upload" className="block text-lg font-medium text-pure-white mb-2">
                Upload Asset
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neon-lilac/30 border-dashed rounded-lg bg-midnight-navy/30 hover:border-neon-lilac/50 transition-colors">
                <div className="space-y-1 text-center">
                  {previewUrl ? (
                    <Image src={previewUrl} alt="Preview" width={128} height={128} className="mx-auto h-32 w-32 object-contain rounded-md mb-2" />
                  ) : (
                    <UploadCloud className="mx-auto h-12 w-12 text-neon-text/50" />
                  )}
                  <div className="flex text-sm text-neon-text/70">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-electric-cyan hover:text-electric-cyan/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-midnight-navy focus-within:ring-electric-cyan"
                    >
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" required onChange={handleFileChange} className="sr-only" disabled={isProcessing} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-neon-text/50">PNG, JPG, GIF, MP3, MP4 up to 10MB</p>
                  {file && <p className="text-sm text-electric-cyan mt-2">Selected: {file.name}</p>}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="title" className="block text-lg font-medium text-pure-white mb-2">Title</label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full bg-midnight-navy/50 border border-neon-lilac/30 rounded-lg shadow-sm py-3 px-4 text-pure-white focus:outline-none focus:ring-2 focus:ring-neon-lilac focus:border-transparent sm:text-sm disabled:opacity-50 placeholder-neon-text/40"
                placeholder="e.g., Sunset Over Mountains"
                disabled={isProcessing}
              />
            </div>

            <div>
               <label htmlFor="description" className="block text-lg font-medium text-pure-white mb-2">Description <span className="text-neon-text/60 text-sm">(Optional)</span></label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full bg-midnight-navy/50 border border-neon-lilac/30 rounded-lg shadow-sm py-3 px-4 text-pure-white focus:outline-none focus:ring-2 focus:ring-neon-lilac focus:border-transparent sm:text-sm disabled:opacity-50 placeholder-neon-text/40"
                placeholder="Brief description of the asset, its story, or any special attributes..."
                disabled={isProcessing}
              />
            </div>

            <div>
              <label htmlFor="licence" className="block text-lg font-medium text-pure-white mb-2">Licence Template</label>
              <select
                id="licence"
                name="licence"
                value={licenceTemplate}
                onChange={(e) => setLicenceTemplate(e.target.value)}
                className="block w-full bg-midnight-navy/50 border border-neon-lilac/30 rounded-lg shadow-sm py-3 px-4 text-pure-white focus:outline-none focus:ring-2 focus:ring-neon-lilac focus:border-transparent sm:text-sm disabled:opacity-50"
                disabled={isProcessing}
              >
                <option value="0x01">Standard Non-Exclusive Commercial</option>
                <option value="0x02">Editorial-Only</option>
                <option value="0x03">Exclusive Buy-Out</option>
              </select>
            </div>

            <div>
              <label className="block text-lg font-medium text-pure-white mb-2">Royalty Splits</label>
              <div className="p-4 border border-dashed border-neon-lilac/30 rounded-lg text-center bg-midnight-navy/30">
                <p className="text-neon-text/70 text-sm">(Royalty split UI coming soon - currently defaults to 100% for connected wallet)</p>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isProcessing || !publicKey || !isBundlrReady || !file}
                className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-midnight-navy bg-electric-cyan hover:bg-electric-cyan/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-electric-cyan disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
              >
                {isProcessing ? (
                  <><Loader2 className="animate-spin mr-2 h-5 w-5" />Processing...</>
                ) : 'Upload & Mint Certificate'}
              </button>
            </div>

            {mintStatus && !mintStatus.startsWith('Initializing') && !mintStatus.startsWith('Irys ready') && (
              <div className={`mt-6 p-4 rounded-md text-sm text-center
                ${mintStatus.toLowerCase().includes('error') || mintStatus.toLowerCase().includes('failed')
                  ? 'bg-red-900/30 border border-red-500/50 text-red-300'
                  : 'bg-green-900/30 border border-green-500/50 text-green-300'}
              `}>
                {mintStatus.toLowerCase().includes('error') || mintStatus.toLowerCase().includes('failed') ?
                  <AlertTriangle className="inline mr-2 h-5 w-5" /> :
                  <CheckCircle className="inline mr-2 h-5 w-5" />
                }
                {mintStatus}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}


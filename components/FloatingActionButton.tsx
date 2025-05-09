'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  href: string;
  text?: string;
  icon?: React.ReactNode;
}

export default function FloatingActionButton({
  href,
  text = 'Create Certificate',
  icon = <Plus size={24} />
}: FloatingActionButtonProps) {
  return (
    <Link href={href} className="floating-action-btn">
      <span className="hidden sm:inline mr-2">{text}</span>
      {icon}
    </Link>
  );
}
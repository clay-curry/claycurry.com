"use client"

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Logo from '@/app/_components/Logo';

interface NavLogoProps {
  href: string;
  title: string;
}

function NavLogo({ href, title }: NavLogoProps) {
  const isActive = usePathname() === href;

  return (
    <Link
      href={href}
      className={clsx('flex h-9 items-center gap-2 rounded-xl px-2')}
      aria-label={title}
    >
      <Logo active={isActive} />
    </Link>
  );
}

export default NavLogo;

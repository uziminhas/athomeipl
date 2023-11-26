'use client';

import Link from 'next/link';
import Bars3Icon from '@heroicons/react/24/outline/Bars3Icon';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/core/ui/Dropdown';

import NAVIGATION_CONFIG from '../navigation.config';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import useSignOut from '~/core/hooks/use-sign-out';

const MobileAppNavigation: React.FC = () => {
  const Links = NAVIGATION_CONFIG.items.map((item) => {
    return (
      <DropdownMenuItem key={item.path}>
        <Link
          href={item.path}
          className={'flex h-full w-full items-center space-x-4'}
        >
          <item.Icon className={'h-6'} />

          <span>{item.label}</span>
        </Link>
      </DropdownMenuItem>
    );
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Bars3Icon className={'h-8'} />
      </DropdownMenuTrigger>

      <DropdownMenuContent sideOffset={10} className={'rounded-none w-screen'}>
        {Links}
        <DropdownMenuSeparator />
        <SignOutDropdownItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MobileAppNavigation;

function SignOutDropdownItem() {
  const signOut = useSignOut();

  return (
    <DropdownMenuItem
      className={'flex w-full items-center space-x-4 h-12'}
      onClick={signOut}
    >
      <ArrowLeftOnRectangleIcon className={'h-5'} />
      <span>Sign out</span>
    </DropdownMenuItem>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useContext } from 'react';

import classNames from 'clsx';
import { cva } from 'cva';

import { NavigationMenuContext } from './NavigationMenuContext';
import isRouteActive from '~/core/generic/is-route-active';

interface Link {
  path: string;
  label?: string;
}

const NavigationMenuItem: React.FCC<{
  link: Link;
  depth?: number;
  disabled?: boolean;
  shallow?: boolean;
  className?: string;
}> = ({ link, disabled, shallow, depth, ...props }) => {
  const pathName = usePathname() ?? '';
  const active = isRouteActive(link.path, pathName, depth ?? 3);
  const menuProps = useContext(NavigationMenuContext);
  const label = link.label;

  const itemClassName = getNavigationMenuItemClassBuilder()({
    active,
    ...menuProps,
  });

  const className = classNames(itemClassName, props.className);

  return (
    <li className={className}>
      <Link href={link.path}>{label}</Link>
    </li>
  );
};

export default NavigationMenuItem;

function getNavigationMenuItemClassBuilder() {
  return cva(
    [
      `flex items-center justify-center font-medium lg:justify-start rounded-lg text-sm transition colors transform active:translate-y-[2px]`,
      '[&>*]:p-1 [&>*]:lg:px-2.5 [&>*]:w-full [&>*]:h-full [&>*]:flex [&>*]:items-center',
    ],
    {
      compoundVariants: [
        // not active - shared
        {
          active: false,
          className: `active:text-current text-gray-600 dark:text-gray-300
        hover:text-current dark:hover:text-white`,
        },
        // active - shared
        {
          active: true,
          className: `text-gray-800 dark:text-white`,
        },
        // active - pill
        {
          active: true,
          pill: true,
          className: `bg-gray-50 text-gray-600 dark:bg-primary-300/10`,
        },
        // not active - pill
        {
          active: false,
          pill: true,
          className: `hover:bg-gray-50 active:bg-gray-100 text-gray-500 dark:text-gray-300 dark:hover:bg-background dark:active:bg-dark-900/90`,
        },
        // not active - bordered
        {
          active: false,
          bordered: true,
          className: `hover:bg-gray-50 active:bg-gray-100 dark:active:bg-dark-800 dark:hover:bg-dark/90 rounded-lg border-transparent`,
        },
        // active - bordered
        {
          active: true,
          bordered: true,
          className: `top-[0.4rem] border-b-[0.25rem] rounded-none border-primary bg-transparent pb-[0.8rem] text-primary-700 dark:text-white`,
        },
        // active - secondary
        {
          active: true,
          secondary: true,
          className: `bg-transparent font-medium`,
        },
      ],
      variants: {
        active: {
          true: ``,
        },
        pill: {
          true: `[&>*]:py-2`,
        },
        bordered: {
          true: `relative h-10`,
        },
        secondary: {
          true: ``,
        },
      },
    },
  );
}

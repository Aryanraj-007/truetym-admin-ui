'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ellipsis, LogOut } from 'lucide-react';

import { getMenuList } from '@/lib/menu-list';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CollapseMenuButton } from '@/components/common/CollapseMenuButton';

interface MenuProps {
  isOpen: boolean | undefined;
}

const renderMenuItem = (isOpen?: boolean, groupLabel?: string) => {
  if (isOpen && groupLabel) {
    return (
      <p className="text-muted-foreground max-w-[248px] truncate px-4 pb-2 text-sm font-medium">
        {groupLabel}
      </p>
    );
  }

  if (!isOpen && groupLabel) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger className="w-full">
            <div className="flex w-full items-center justify-center">
              <Ellipsis data-testid="ellipsis" className="size-5" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{groupLabel}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <p className="pb-2" />;
};

/* eslint no-nested-ternary: "off" */
export function Menu({ isOpen }: Readonly<MenuProps>) {
  const pathname = usePathname();
  const menuList = getMenuList(pathname);
  return (
    <nav className="mt-8 size-full">
      <ul className="flex min-h-[calc(100vh-48px-36px-16px-32px)] flex-col items-start space-y-1 px-2 lg:min-h-[calc(100vh-32px-40px-32px)]">
        {menuList.map(({ groupLabel, menus }) => (
          <li className={cn('w-full', groupLabel ? 'pt-5' : '')} key={groupLabel}>
            {renderMenuItem(isOpen, groupLabel)}
            {menus.map(({ href, label, icon: Icon, active, submenus }) =>
              submenus.length === 0 ? (
                <div className="w-full" key={label}>
                  <TooltipProvider disableHoverableContent>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={active ? 'secondary' : 'ghost'}
                          className={cn(
                            'mb-1 h-10 w-full justify-start text-white',
                            active ? 'bg-[#4318FF]' : '',
                            'hover:bg-[#4318FF]',
                          )}
                          asChild
                        >
                          <Link href={href}>
                            <span className={cn(isOpen === false ? '' : 'mr-4')}>
                              <Icon size={18} />
                            </span>
                            <p
                              className={cn(
                                'max-w-[200px] truncate',
                                isOpen === false
                                  ? '-translate-x-96 opacity-0'
                                  : 'translate-x-0 text-white opacity-100',
                              )}
                            >
                              {label}
                            </p>
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      {isOpen === false && <TooltipContent side="right">{label}</TooltipContent>}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ) : (
                <div className="w-full" key={label}>
                  <CollapseMenuButton
                    icon={Icon}
                    label={label}
                    active={active}
                    submenus={submenus}
                    isOpen={isOpen}
                  />
                </div>
              ),
            )}
          </li>
        ))}
        <li className="flex w-full grow items-end">
          <TooltipProvider disableHoverableContent>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {}}
                  className="mt-5 h-10 w-full justify-center bg-black text-white hover:bg-[#9074CB]"
                >
                  <span className={cn(isOpen === false ? '' : 'mr-4')}>
                    <LogOut size={18} />
                  </span>
                  <p
                    className={cn(
                      'whitespace-nowrap',
                      isOpen === false ? 'hidden opacity-0' : 'opacity-100',
                    )}
                  >
                    Logout
                  </p>
                </Button>
              </TooltipTrigger>
              {isOpen === false && <TooltipContent side="right">Sign out</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        </li>
      </ul>
    </nav>
  );
}

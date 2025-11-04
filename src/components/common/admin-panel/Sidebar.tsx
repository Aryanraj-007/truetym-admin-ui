'use client';

import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar } from '@/store/slices/appSlice';

import { cn } from '@/lib/utils';
import { Menu } from '@/components/common/admin-panel/Menu';
import { SidebarToggle } from '@/components/common/admin-panel/SidebarToggle';

export function Sidebar() {
  const { isSidebarOpen } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();

  const handleSidebarToggle = () => {
    dispatch(toggleSidebar());
  };

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-20 h-screen -translate-x-full bg-[#242424] transition-[width] duration-300 ease-in-out lg:translate-x-0',
        !isSidebarOpen ? 'w-[90px]' : 'w-72',
      )}
    >
      <SidebarToggle isOpen={isSidebarOpen} setIsOpen={handleSidebarToggle} />
      <div className="relative flex h-full flex-col overflow-y-auto px-3 py-4 shadow-md dark:shadow-zinc-800">
        <Link
          className="flex items-center justify-center gap-2 border-b-2 border-white pb-2"
          href="/dashboard"
        >
          {/* <Image
            className={cn(
              'transition-[transform,opacity,display] duration-300 ease-in-out',
              !isSidebarOpen ? 'hidden -translate-x-96 opacity-0' : 'translate-x-0 opacity-100',
            )}
            alt="CollegeHai"
            src={mainLogo}
            width={150} // Adjusted width
            height={50}
          /> */}
          <h1
            className={cn(
              'text-lg font-bold whitespace-nowrap text-white transition-[transform,opacity,display] duration-300 ease-in-out',
              !isSidebarOpen ? 'hidden -translate-x-96 opacity-0' : 'translate-x-0 opacity-100',
            )}
          >
            TrueTym
          </h1>
        </Link>

        <Menu isOpen={isSidebarOpen} />
      </div>
    </aside>
  );
}

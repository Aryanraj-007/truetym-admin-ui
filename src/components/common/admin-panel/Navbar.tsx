import { BellIcon, Newspaper, Plus, Settings } from 'lucide-react';

import { ModeToggle } from '@/components/ui/mode-toggle';
import { SheetMenu } from '@/components/common/admin-panel/SheetMenu';
import { UserNav } from '@/components/common/admin-panel/UserNav';
import SearchBar from '@/components/common/SearchBar';

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: Readonly<NavbarProps>) {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary sticky top-0 z-10 w-full shadow backdrop-blur">
      <div className="mx-4 flex h-14 items-center sm:mx-8">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <SheetMenu />
          <h1 className="font-bold">{title}</h1>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4">
          <SearchBar />
          <div className="flex items-center space-x-2">
            <BellIcon className="size-5 cursor-pointer text-gray-500" data-testid="bell-icon" />
            <Settings className="size-5 cursor-pointer text-gray-500" data-testid="settings-icon" />
            <Plus className="size-5 cursor-pointer text-gray-500" data-testid="plus-icon" />
            <Newspaper className="size-5 cursor-pointer text-gray-500" data-testid="news-icon" />
          </div>
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}

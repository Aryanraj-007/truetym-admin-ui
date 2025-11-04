import Link from 'next/link';
import { MenuIcon, PanelsTopLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from '@/components/common/admin-panel/Menu';

export function SheetMenu() {
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full flex-col px-3 sm:w-72" side="left">
        <SheetHeader>
          <Button className="flex items-center justify-center pt-1 pb-2" variant="link" asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              <PanelsTopLeft className="mr-1 size-6" />
              <SheetTitle className="text-lg font-bold">Brand</SheetTitle>
            </Link>
          </Button>
        </SheetHeader>
        <Menu isOpen />
      </SheetContent>
    </Sheet>
  );
}

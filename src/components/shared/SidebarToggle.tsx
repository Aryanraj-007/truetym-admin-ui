import { ChevronLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarToggleProps {
  isOpen: boolean | undefined;
  setIsOpen: () => void;
}

export function SidebarToggle({ isOpen, setIsOpen }: Readonly<SidebarToggleProps>) {
  return (
    <div className="invisible absolute top-[12px] right-[-16px] z-20 lg:visible">
      <Button onClick={setIsOpen} className="size-8 rounded-md" variant="outline" size="icon">
        <ChevronLeft
          className={cn(
            'size-4 transition-transform duration-700 ease-in-out',
            isOpen === false ? 'rotate-180' : 'rotate-0',
          )}
        />
      </Button>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  Headphones,
  LayoutDashboard,
  Megaphone,
  Package,
  Settings,
  Sliders,
  TrendingDown,
  TrendingUp,
  Users,
  UsersRound,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Organisation', href: '/dashboard/customers' },
  { icon: Sliders, label: 'Feature Management', href: '/features' },
  { icon: Package, label: 'Plan Management', href: '/dashboard/plan' }, // lowercase
  { icon: TrendingDown, label: 'Offboarding', href: '/offboarding' },
  { icon: Megaphone, label: 'Marketing', href: '/dashboard/marketing' },
  { icon: FileText, label: 'Financials', href: '/dashboard/financials' },
  { icon: Package, label: 'Product Usage', href: '/dashboard/product-usage' },
  { icon: Headphones, label: 'Support', href: '/dashboard/support' },
  { icon: TrendingUp, label: 'Forecasting', href: '/dashboard/forecasting' },
  { icon: UsersRound, label: 'Team', href: '/dashboard/team' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 flex h-screen w-70 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="border-b border-gray-200 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 text-lg font-semibold text-white">
            T
          </div>
          <div>
            <h1 className="text-base font-semibold">TrueTym</h1>
            <p className="text-xs text-gray-500">Business Admin</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all ${
                isActive
                  ? 'mr-0 ml-2 rounded-l-lg bg-teal-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-teal-600'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
              <span className="font-medium">{item.label}</span>

              {/* Active indicator arrow */}
              {isActive && <div className="absolute top-0 right-0 bottom-0 w-1 bg-teal-600"></div>}
            </Link>
          );
        })}
      </nav>

      {/* Help Section */}
      <div className="border-t border-gray-200 p-4">
        <div className="rounded-lg bg-teal-50 p-3">
          <p className="text-xs font-semibold text-teal-900">Need Help?</p>
          <p className="mt-1 text-xs text-teal-700">Check our documentation</p>
        </div>
      </div>
    </aside>
  );
}

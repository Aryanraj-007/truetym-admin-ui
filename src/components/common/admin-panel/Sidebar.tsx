'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  CreditCard, 
  TrendingDown, 
  Megaphone, 
  FileText, 
  Package, 
  Headphones, 
  TrendingUp, 
  UsersRound, 
  Settings 
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Customers', href: '/dashboard/customers' },
  { icon: DollarSign, label: 'Feature Management', href: '/Feature' },

  { icon: CreditCard, label: 'Plan Management', href: '/dashboard/Plan' },
  { icon: TrendingDown, label: 'Churn & Retention', href: '/dashboard/churn' },
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
    <aside className="w-[280px] bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 h-screen">
      {/* Logo */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold text-lg">
            T
          </div>
          <div>
            <h1 className="font-semibold text-base">TrueTym</h1>
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
              className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all relative ${
                isActive 
                  ? 'bg-teal-600 text-white rounded-l-lg ml-2 mr-0' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-teal-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
              <span className="font-medium">{item.label}</span>
              
              {/* Active indicator arrow */}
              {isActive && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-teal-600"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Help Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-teal-50 rounded-lg p-3">
          <p className="text-xs font-semibold text-teal-900">Need Help?</p>
          <p className="text-xs text-teal-700 mt-1">Check our documentation</p>
        </div>
      </div>
    </aside>
  );
}

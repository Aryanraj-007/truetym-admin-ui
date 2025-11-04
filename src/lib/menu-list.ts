// eslint-disable-next-line import/named
import {
  AlarmClock,
  BarChart,
  Calendar,
  CreditCard,
  FileText,
  GraduationCap,
  HelpCircle,
  LayoutGrid,
  MessageSquare,
  Phone,
  User,
  UserCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: '',
      menus: [
        {
          href: '/dashboard',
          label: 'Dashboard',
          active: pathname.includes('/dashboard'),
          icon: LayoutGrid,
          submenus: [],
        },
        {
          href: '/payments',
          label: 'Payments and finances',
          active: pathname.includes('/payments'),
          // active: pathname === '/onboarding',
          icon: CreditCard,
          submenus: [],
        },
        {
          href: '/insights',
          label: 'Insights and analytics',
          active: pathname.includes('/insights'),
          // active: pathname === '/onboarding',
          icon: BarChart,
          submenus: [],
        },

        {
          href: '/messages',
          label: 'Messages',
          active: pathname.includes('/messages'),
          // active: pathname === '/onboarding',
          icon: MessageSquare,
          submenus: [],
        },
        {
          href: '/userprofilesettings',
          label: 'User profile and settings',
          active: pathname.includes('/userprofilesettings'),
          // active: pathname === '/onboarding',
          icon: User,
          submenus: [],
        },
        {
          href: '/appointments',
          label: 'Appointments',
          active: pathname.includes('/appointments'),
          // active: pathname === '/onboarding',
          icon: Calendar,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: 'Management',

      menus: [
        {
          href: 'leads',
          label: 'Leads',
          active: pathname.includes('/leads'),
          icon: UserCheck,
          submenus: [],
        },
        {
          href: '/calls',
          label: 'Calls',
          active: pathname.includes('/calls'),
          icon: Phone,
          submenus: [],
        },
        {
          href: '/followups',
          label: 'Follow Ups',
          active: pathname.includes('/followups'),
          icon: AlarmClock,
          submenus: [],
        },
        {
          href: '/documents',
          label: 'Documents',
          active: pathname.includes('/documents'),
          icon: FileText,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: 'Upskilling',
      menus: [
        {
          href: '/support',
          label: 'Help and Support',
          active: pathname.includes('/support'),
          icon: HelpCircle,
          submenus: [],
        },
        {
          href: '/training',
          label: 'Training',
          active: pathname.includes('/training'),
          icon: GraduationCap,
          submenus: [],
        },
      ],
    },
  ];
}

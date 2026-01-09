// 'use client';

// import { Bell } from 'lucide-react';
// import SearchBar from './SearchBar';
// import UserNav from './UserNav';

// export default function Navbar() {
//   return (
//     <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
//       <SearchBar/>

//       <div className="flex items-center gap-4">
//         <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
//           <Bell className="w-5 h-5 text-gray-600" />
//           <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
//         </button>
//         <UserNav />
//       </div>
//     </header>
//   );
// }
'use client';

import { Bell } from 'lucide-react';

import SearchBar from '@/components/common/admin-panel/SearchBar';
import UserNav from '@/components/common/admin-panel/UserNav';

export default function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <SearchBar />

      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 transition-colors hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        <UserNav />
      </div>
    </header>
  );
}

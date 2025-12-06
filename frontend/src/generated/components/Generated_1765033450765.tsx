import React from 'react';
import { Search, Filter, ChevronDown, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

// Types
interface User {
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Pending' | 'Inactive';
}

// Sample Data
const users: User[] = [
  { name: 'Alex Johnson', email: 'alex.j@example.com', role: 'Admin', status: 'Active' },
  { name: 'Maria Rodriguez', email: 'maria.r@example.com', role: 'Editor', status: 'Pending' },
  { name: 'David Kim', email: 'david.k@example.com', role: 'Viewer', status: 'Active' },
  { name: 'Sarah Chen', email: 'sarah.c@example.com', role: 'Editor', status: 'Inactive' },
  { name: 'Chris Lee', email: 'chris.l@example.com', role: 'Viewer', status: 'Active' },
];

// Components
const StatusBadge = ({ status }: { status: User['status'] }) => {
  const getStyles = (s: string) => {
    switch (s) {
      case 'Active':
        return 'bg-[#86efac]/60 text-[#14532d]'; // Soft green
      case 'Pending':
        return 'bg-[#fcd34d]/60 text-[#78350f]'; // Soft amber
      case 'Inactive':
        return 'bg-[#fca5a5]/60 text-[#7f1d1d]'; // Soft red
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStyles(status)}`}>
      {status}
    </span>
  );
};

export default function UserTable() {
  return (
    <div className="min-h-screen bg-[#f4f4f0] p-8 flex justify-center font-sans text-gray-900">
      <div className="w-full max-w-5xl space-y-6">
        
        {/* Header Section */}
        <div className="flex justify-between items-center px-1">
          <h1 className="text-3xl font-semibold tracking-tight text-[#1a1a1a]">Users</h1>
          <div className="flex gap-5 text-gray-500">
            <button className="hover:text-gray-900 transition-colors p-1">
              <Search className="w-6 h-6" strokeWidth={2} />
            </button>
            <button className="hover:text-gray-900 transition-colors p-1">
              <Filter className="w-6 h-6" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-gray-300/80 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#e5e5e5]/50 border-b border-gray-200 text-gray-600">
                <th className="py-4 px-6 text-[15px] font-medium">Name</th>
                <th className="py-4 px-6 text-[15px] font-medium">Email</th>
                <th className="py-4 px-6 text-[15px] font-medium">Role</th>
                <th className="py-4 px-6 text-[15px] font-medium">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900 group">
                    Status 
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="py-5 px-6 text-[15px] font-medium text-gray-900">{user.name}</td>
                  <td className="py-5 px-6 text-[15px] text-gray-600">{user.email}</td>
                  <td className="py-5 px-6 text-[15px] text-gray-900">{user.role}</td>
                  <td className="py-5 px-6">
                    <StatusBadge status={user.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Section */}
        <div className="flex justify-between items-center px-1 pt-2">
          <span className="text-gray-500 text-[15px] font-medium">Showing 1-5 of 15</span>
          
          <div className="flex items-center gap-6">
            {/* Pagination Controls */}
            <div className="flex items-center gap-3 text-gray-600 font-medium select-none">
              <button className="p-1 hover:text-gray-900 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="w-6 h-6 flex items-center justify-center text-gray-900 font-bold">1</button>
              <button className="w-6 h-6 flex items-center justify-center hover:text-gray-900 transition-colors">2</button>
              <button className="w-6 h-6 flex items-center justify-center hover:text-gray-900 transition-colors">3</button>
              <button className="p-1 hover:text-gray-900 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Floating Action Button */}
            <button className="ml-2 w-12 h-12 bg-[#e5e5e5] hover:bg-[#d4d4d4] text-gray-800 rounded-2xl shadow-md flex items-center justify-center transition-all active:scale-95">
              <Plus className="w-6 h-6" strokeWidth={2.5} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

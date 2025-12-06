import React from 'react';
import { 
  Bell, 
  ChevronDown, 
  Check, 
  MoreHorizontal, 
  ArrowRight, 
  Gauge, 
  LayoutGrid, 
  Users, 
  Search,
  Menu
} from 'lucide-react';

const TransformationProjectUI = () => {
  return (
    <div className="min-h-screen bg-[#0c0c0e] text-gray-300 font-sans selection:bg-blue-500/30">
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-[#0c0c0e]">
        <div className="flex items-center gap-4">
          {/* JIVS Logo Placeholder */}
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs">
            jivs
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Bell size={20} />
          </button>
          
          <div className="flex items-center gap-2 text-sm font-medium text-gray-300 cursor-pointer hover:text-white">
            <span className="w-5 h-5 flex items-center justify-center border border-gray-600 rounded text-[10px]">H</span>
            <span>Seeburg AG</span>
            <ChevronDown size={16} />
          </div>

          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold border-2 border-[#0c0c0e] ring-1 ring-gray-700">
            RK
          </div>
          
          <ChevronDown size={16} className="text-gray-500 cursor-pointer" />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Project Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-900/40 border border-blue-700/50 rounded flex flex-col items-center justify-center text-blue-400">
              <span className="text-sm font-bold leading-none">NBH</span>
              <span className="text-[6px] uppercase leading-none mt-0.5 text-blue-300/70">New Build History</span>
            </div>
            <h1 className="text-2xl font-light text-white">
              S/4 Transformation <span className="text-gray-500 font-light">Project</span>
            </h1>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium border border-gray-700 rounded hover:bg-gray-800 transition-colors uppercase tracking-wide text-gray-400">
              <LayoutGrid size={14} />
              View Scope
            </button>
            <button className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium border border-gray-700 rounded hover:bg-gray-800 transition-colors uppercase tracking-wide text-gray-400">
              Collaborators
            </button>
          </div>
        </div>

        {/* Stepper / Tabs */}
        <div className="border-b border-gray-800 mb-10">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <TabItem label="Project Scope" status="completed" />
            <TabItem label="History Analysis" status="active" />
            <TabItem label="JIVS IMP Deployment" status="pending" />
            <TabItem label="Implementation" status="pending" />
            <TabItem label="Acceptance Testing" status="pending" />
            <TabItem label="Finalize Project" status="pending" />
          </div>
        </div>

        {/* Section Title */}
        <div className="mb-8">
          <h2 className="text-xl font-light text-gray-200">History Analysis</h2>
        </div>

        {/* Data Table */}
        <div className="bg-[#111114] border border-gray-800 rounded-lg overflow-hidden mb-8">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-1">System</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-6"></div> {/* Progress bar space */}
            <div className="col-span-2">Performance</div>
            <div className="col-span-2">Actions</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-800">
            <TableRow system="P01" />
            <TableRow system="P02" />
            <TableRow system="P03" />
          </div>
        </div>

        {/* Bottom Action Button */}
        <div className="flex justify-end">
          <button className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-3 px-6 rounded shadow-lg shadow-red-900/20 flex items-center gap-2 transition-all uppercase tracking-wide">
            Open JIVS IMP Deployment
            <ArrowRight size={16} />
          </button>
        </div>

      </main>
    </div>
  );
};

// Helper Components

const TabItem = ({ label, status }: { label: string; status: 'completed' | 'active' | 'pending' }) => {
  const isActive = status === 'active';
  const isCompleted = status === 'completed';
  
  return (
    <div className={`
      relative px-6 py-4 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-2 whitespace-nowrap
      ${isActive ? 'text-white border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-300 border-b-2 border-transparent'}
    `}>
      {(isCompleted || isActive) && (
        <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center">
           <Check size={10} className="text-white" />
        </div>
      )}
      {label}
    </div>
  );
};

const TableRow = ({ system }: { system: string }) => {
  return (
    <div className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-white/[0.02] transition-colors group">
      <div className="col-span-1 text-sm font-medium text-gray-300">{system}</div>
      
      <div className="col-span-1 text-sm text-gray-400">Done</div>
      
      <div className="col-span-6 pr-8">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full w-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]"></div>
          </div>
          <span className="text-xs text-gray-500 font-mono">100/100</span>
        </div>
      </div>
      
      <div className="col-span-2">
        <button className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
          <Gauge size={14} />
          Details
        </button>
      </div>
      
      <div className="col-span-2 flex items-center gap-3">
        <button className="px-4 py-1.5 border border-gray-600 rounded text-[10px] font-bold text-gray-300 uppercase tracking-wider hover:bg-gray-800 hover:border-gray-500 transition-all">
          Open Analysis
        </button>
        <button className="text-gray-500 hover:text-white">
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
};

export default TransformationProjectUI;
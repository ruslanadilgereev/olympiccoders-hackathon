import React from 'react';
import { 
  Bell, 
  ChevronDown, 
  CheckCircle2, 
  MoreHorizontal, 
  ArrowRight, 
  Gauge, 
  Search,
  LayoutGrid,
  Users
} from 'lucide-react';

const TransformationProject = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-sans selection:bg-blue-500/30">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-[#0f1012]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs">
            jivs
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Bell size={20} />
          </button>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <LayoutGrid size={18} className="text-gray-500" />
            <span>Seeburg AG</span>
            <ChevronDown size={16} className="text-gray-500" />
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
            RK
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Project Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1e293b] rounded border border-gray-700 flex flex-col items-center justify-center text-[10px] font-bold text-blue-400 leading-tight">
              <span>NBH</span>
              <span className="text-[8px] text-gray-500">NEW BUILD</span>
              <span className="text-[8px] text-gray-500">HISTORY</span>
            </div>
            <h1 className="text-2xl font-light text-white tracking-wide">
              <span className="font-semibold">S/4</span> Transformation Project
            </h1>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-1.5 text-xs font-medium border border-gray-700 rounded hover:bg-gray-800 transition-colors flex items-center gap-2 uppercase tracking-wider">
              <Search size={12} /> View Scope
            </button>
            <button className="px-4 py-1.5 text-xs font-medium border border-gray-700 rounded hover:bg-gray-800 transition-colors flex items-center gap-2 uppercase tracking-wider">
              <Users size={12} /> Collaborators
            </button>
          </div>
        </div>

        {/* Workflow Tabs */}
        <div className="grid grid-cols-6 border border-gray-800 bg-[#111214] rounded-sm mb-12 text-[10px] font-bold tracking-wider uppercase">
          <div className="flex items-center justify-center gap-2 py-4 border-r border-gray-800 text-gray-400">
            <CheckCircle2 size={14} className="text-gray-500" />
            Project Scope
          </div>
          <div className="relative flex items-center justify-center gap-2 py-4 border-r border-gray-800 bg-[#1a1b1e] text-white">
            <CheckCircle2 size={14} className="text-white" />
            History Analysis
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600"></div>
          </div>
          <div className="flex items-center justify-center py-4 border-r border-gray-800 text-gray-500">
            JIVS IMP Deployment
          </div>
          <div className="flex items-center justify-center py-4 border-r border-gray-800 text-gray-500">
            Implementation
          </div>
          <div className="flex items-center justify-center py-4 border-r border-gray-800 text-gray-500">
            Acceptance Testing
          </div>
          <div className="flex items-center justify-center py-4 text-gray-500">
            Finalize Project
          </div>
        </div>

        {/* Section Title */}
        <h2 className="text-xl font-light text-gray-200 mb-6">History Analysis</h2>

        {/* Analysis Table */}
        <div className="bg-[#111214] border border-gray-800 rounded-sm overflow-hidden mb-8">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-6 py-4 border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <div className="col-span-1">System</div>
            <div className="col-span-6">Status</div>
            <div className="col-span-2">Performance</div>
            <div className="col-span-3">Actions</div>
          </div>

          {/* Table Rows */}
          {[1, 2, 3].map((item) => (
            <div key={item} className="grid grid-cols-12 px-6 py-5 border-b border-gray-800/50 items-center hover:bg-[#16171a] transition-colors group">
              <div className="col-span-1 text-sm text-gray-300 font-medium">
                PO{item}
              </div>
              <div className="col-span-6 pr-12">
                <div className="flex items-center gap-8">
                  <span className="text-sm text-gray-300 w-12">Done</span>
                  <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 w-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">100/100</span>
                </div>
              </div>
              <div className="col-span-2">
                <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <Gauge size={16} />
                  Details
                </button>
              </div>
              <div className="col-span-3 flex items-center gap-4">
                <button className="px-4 py-1.5 border border-gray-600 rounded text-[10px] font-bold tracking-wider uppercase hover:bg-gray-800 hover:border-gray-500 transition-all text-gray-300">
                  Open Analysis
                </button>
                <button className="text-gray-500 hover:text-white">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Action */}
        <div className="flex justify-end">
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded text-xs font-bold tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all">
            Open JIVS IMP Deployment <ArrowRight size={14} />
          </button>
        </div>

      </main>
    </div>
  );
};

export default TransformationProject;
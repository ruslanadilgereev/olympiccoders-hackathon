import React, { useState } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Check, 
  MoreHorizontal, 
  ArrowRight, 
  Gauge, 
  LayoutGrid, 
  Users,
  Search
} from 'lucide-react';

const TransformationProjectDashboard = () => {
  const [activeTab, setActiveTab] = useState('HISTORY ANALYSIS');

  const steps = [
    { name: 'PROJECT SCOPE', status: 'completed' },
    { name: 'HISTORY ANALYSIS', status: 'active' },
    { name: 'JIVS IMP DEPLOYMENT', status: 'pending' },
    { name: 'IMPLEMENTATION', status: 'pending' },
    { name: 'ACCEPTANCE TESTING', status: 'pending' },
    { name: 'FINALIZE PROJECT', status: 'pending' },
  ];

  const systems = [
    { id: 'P01', status: 'Done', progress: 100, total: 100 },
    { id: 'P02', status: 'Done', progress: 100, total: 100 },
    { id: 'P03', status: 'Done', progress: 100, total: 100 },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-300 font-sans selection:bg-blue-500/30">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#09090b]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs">
            jivs
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Bell size={20} />
          </button>
          
          <div className="flex items-center gap-2 text-sm font-medium text-gray-300 cursor-pointer hover:text-white">
            <span>Seeburg AG</span>
            <ChevronDown size={16} />
          </div>

          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold border-2 border-[#09090b] ring-2 ring-purple-600/20">
            RK
          </div>
          
          <button className="text-gray-400 hover:text-white">
            <ChevronDown size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Project Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1e293b] rounded flex flex-col items-center justify-center border border-blue-900/50">
              <span className="text-blue-400 font-bold text-sm">NBH</span>
              <span className="text-[0.5rem] text-blue-300/70 uppercase">New Build History</span>
            </div>
            <h1 className="text-3xl font-light text-gray-100">
              S/4 Transformation <span className="font-normal text-gray-400">Project</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium border border-gray-700 rounded hover:bg-gray-800 transition-colors uppercase tracking-wide">
              <LayoutGrid size={14} />
              View Scope
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium border border-gray-700 rounded hover:bg-gray-800 transition-colors uppercase tracking-wide">
              <Users size={14} />
              Collaborators
            </button>
          </div>
        </div>

        {/* Workflow Tabs */}
        <div className="grid grid-cols-6 border-b border-gray-800 mb-12">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`
                relative py-4 px-2 flex items-center justify-center gap-2 text-[0.65rem] font-bold tracking-wider uppercase cursor-pointer transition-all
                ${step.status === 'active' 
                  ? 'text-white bg-[#161618] border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-[#161618]/50'}
              `}
            >
              {step.status === 'completed' && <Check size={12} className="text-gray-400" />}
              {step.status === 'active' && <div className="w-3 h-3 rounded-full bg-blue-600 flex items-center justify-center"><Check size={8} className="text-white" /></div>}
              {step.name}
            </div>
          ))}
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-normal text-gray-200 tracking-wide">History Analysis</h2>

          {/* Table Container */}
          <div className="bg-[#111113] border border-gray-800/50 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <div className="col-span-1">System</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-5"></div>
              <div className="col-span-2">Performance</div>
              <div className="col-span-3">Actions</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-800/50">
              {systems.map((sys) => (
                <div key={sys.id} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-[#161618] transition-colors group">
                  <div className="col-span-1 text-sm text-gray-300 font-medium">{sys.id}</div>
                  <div className="col-span-1 text-sm text-gray-300">{sys.status}</div>
                  
                  {/* Progress Bar Column */}
                  <div className="col-span-5 flex items-center gap-4 pr-8">
                    <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                        style={{ width: `${(sys.progress / sys.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">{sys.progress}/{sys.total}</span>
                  </div>

                  {/* Performance Column */}
                  <div className="col-span-2">
                    <button className="flex items-center gap-2 text-xs text-gray-300 hover:text-white transition-colors">
                      <Gauge size={14} />
                      <span>Details</span>
                    </button>
                  </div>

                  {/* Actions Column */}
                  <div className="col-span-3 flex items-center gap-3">
                    <button className="px-4 py-1.5 text-[10px] font-bold border border-gray-600 rounded text-gray-300 hover:border-gray-400 hover:text-white transition-all uppercase tracking-widest">
                      Open Analysis
                    </button>
                    <button className="p-1 text-gray-500 hover:text-white transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action Button */}
          <div className="flex justify-end pt-8">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-900/20">
              Open Jivs Imp Deployment
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TransformationProjectDashboard;
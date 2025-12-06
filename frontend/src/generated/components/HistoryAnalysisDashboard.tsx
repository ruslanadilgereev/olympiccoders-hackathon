import React from 'react';
import { 
  Bell, 
  ChevronDown, 
  Check, 
  MoreHorizontal, 
  ArrowRight, 
  Gauge, 
  Eye, 
  Users,
  Search
} from 'lucide-react';

const HistoryAnalysisDashboard = () => {
  const steps = [
    { name: "PROJECT SCOPE", status: "completed" },
    { name: "HISTORY ANALYSIS", status: "active" },
    { name: "JIVS IMP DEPLOYMENT", status: "pending" },
    { name: "IMPLEMENTATION", status: "pending" },
    { name: "ACCEPTANCE TESTING", status: "pending" },
    { name: "FINALIZE PROJECT", status: "pending" },
  ];

  const systems = [
    { id: "P01", status: "Done", progress: 100 },
    { id: "P02", status: "Done", progress: 100 },
    { id: "P03", status: "Done", progress: 100 },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-blue-500/30">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#09090b]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-red-900/20">
            jivs
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Bell size={18} />
          </button>
          
          <div className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
            <span className="font-medium">Seeburg AG</span>
            <ChevronDown size={14} />
          </div>
          
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white border border-purple-400/30">
            RK
          </div>
          
          <button className="text-gray-400 hover:text-white">
            <ChevronDown size={14} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-8 py-8 max-w-[1600px] mx-auto">
        
        {/* Project Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1e293b] rounded flex flex-col items-center justify-center text-[10px] font-bold text-blue-400 border border-blue-900/30">
              <span className="text-sm">NBH</span>
              <span className="text-[6px] text-gray-500 leading-tight">NEW BUILD HISTORY</span>
            </div>
            <h1 className="text-2xl font-light text-gray-200 tracking-wide">
              S/4 Transformation Project
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-400 border border-gray-700 rounded hover:bg-white/5 transition-colors uppercase tracking-wider">
              <Eye size={14} />
              View Scope
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-400 border border-gray-700 rounded hover:bg-white/5 transition-colors uppercase tracking-wider">
              <Users size={14} />
              Collaborators
            </button>
          </div>
        </div>

        {/* Stepper Navigation */}
        <div className="w-full overflow-x-auto mb-12">
          <div className="flex min-w-max border-b border-gray-800">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`
                  flex items-center gap-2 px-8 py-4 text-[10px] font-bold tracking-widest uppercase cursor-pointer transition-all border-b-2
                  ${step.status === 'active' 
                    ? 'text-white border-blue-600 bg-white/5' 
                    : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'}
                `}
              >
                {(step.status === 'completed' || step.status === 'active') && (
                  <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center">
                    <Check size={10} className="text-white" />
                  </div>
                )}
                {step.name}
              </div>
            ))}
          </div>
        </div>

        {/* Section Title */}
        <div className="mb-8">
          <h2 className="text-xl font-light text-gray-200 tracking-wide">History Analysis</h2>
        </div>

        {/* Data Table */}
        <div className="w-full bg-[#0f0f12] border border-gray-800/50 rounded-sm overflow-hidden mb-8">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-800 bg-[#131316]">
            <div className="col-span-1 text-xs font-medium text-gray-400 uppercase tracking-wider">System</div>
            <div className="col-span-1 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</div>
            <div className="col-span-6"></div>
            <div className="col-span-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Performance</div>
            <div className="col-span-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</div>
          </div>

          {systems.map((system, idx) => (
            <div 
              key={idx} 
              className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-gray-800/50 items-center hover:bg-white/[0.02] transition-colors"
            >
              <div className="col-span-1 text-sm text-gray-300 font-medium">{system.id}</div>
              <div className="col-span-1 text-sm text-gray-300">{system.status}</div>
              
              {/* Progress Bar */}
              <div className="col-span-6 flex items-center gap-4 pr-8">
                <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                    style={{ width: `${system.progress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 font-mono">100/100</span>
              </div>

              <div className="col-span-2">
                <button className="flex items-center gap-2 text-xs text-gray-300 hover:text-white transition-colors">
                  <Gauge size={14} />
                  Details
                </button>
              </div>

              <div className="col-span-2 flex items-center gap-3">
                <button className="px-4 py-1.5 text-[10px] font-bold text-white border border-gray-600 rounded hover:bg-white/10 transition-colors uppercase tracking-wider">
                  Open Analysis
                </button>
                <button className="text-gray-500 hover:text-white">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Action */}
        <div className="flex justify-end mt-8">
          <button className="group flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow-lg shadow-blue-900/20 transition-all uppercase tracking-wider">
            Open JIVS IMP Deployment
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </main>
    </div>
  );
};

export default HistoryAnalysisDashboard;
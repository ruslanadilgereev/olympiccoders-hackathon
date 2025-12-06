import React, { useState } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Plus, 
  ArrowRight, 
  Check, 
  Settings, 
  User,
  Search,
  MoreHorizontal
} from 'lucide-react';

const ProjectDashboard = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('PROJECT SCOPE');

  // Mock data for systems
  const inScopeSystems = [
    { id: 'P01', version: 'SAP ECC 6.0' },
    { id: 'P02', version: 'SAP ECC 6.0' },
    { id: 'P03', version: 'SAP ECC 6.0' },
  ];

  const availableSystems = [
    { id: 'P04', version: 'SAP ECC 6.0' },
    { id: 'P05', version: 'SAP ECC 6.0' },
    { id: 'P06', version: 'SAP ECC 6.0' },
    { id: 'P07', version: 'SAP ECC 6.0' },
    { id: 'P08', version: 'SAP ECC 6.0' },
    { id: 'P09', version: 'SAP ECC 6.0' },
  ];

  const workflowSteps = [
    { label: 'PROJECT SCOPE', active: true, completed: true },
    { label: 'HISTORY ANALYSIS', active: false, completed: false },
    { label: 'JIVS IMP DEPLOYMENT', active: false, completed: false },
    { label: 'IMPLEMENTATION', active: false, completed: false },
    { label: 'ACCEPTANCE TESTING', active: false, completed: false },
    { label: 'FINALIZE PROJECT', active: false, completed: false },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 font-sans selection:bg-green-500/30">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-green-600 bg-[#0c0c0e]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
            jivs
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="text-zinc-400 hover:text-white">
            <Bell size={20} />
          </button>
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-300 cursor-pointer">
            <span>Seeburg AG</span>
            <ChevronDown size={16} />
          </div>
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold border border-green-500">
            RK
          </div>
        </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto">
        {/* Project Header */}
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-900/50 border border-green-500 rounded flex flex-col items-center justify-center text-blue-400">
              <span className="text-xl font-bold leading-none">NBH</span>
              <span className="text-[0.5rem] uppercase leading-none mt-1 opacity-70">New Build History</span>
            </div>
            <h1 className="text-3xl font-light text-white tracking-wide">S/4 Transformation Project</h1>
          </div>
          
          <div className="flex gap-3">
            <button className="px-4 py-2 text-xs font-medium border border-green-500 rounded text-zinc-400 hover:text-white hover:border-green-400 transition-colors uppercase tracking-wider">
              View Scope
            </button>
            <button className="px-4 py-2 text-xs font-medium border border-green-500 rounded text-zinc-400 hover:text-white hover:border-green-400 transition-colors uppercase tracking-wider">
              Collaborators
            </button>
          </div>
        </div>

        {/* Workflow Tabs */}
        <div className="grid grid-cols-6 gap-1 mb-12">
          {workflowSteps.map((step, idx) => (
            <div 
              key={idx}
              className={`
                relative flex items-center justify-center py-4 px-2 border border-green-500 text-[10px] font-bold tracking-wider cursor-pointer transition-all
                ${step.active ? 'bg-[#1c1c21] text-white' : 'bg-[#0c0c0e] text-zinc-500 hover:bg-[#131316]'}
              `}
            >
              {step.active && <Check size={14} className="mr-2 text-white" />}
              {step.label}
            </div>
          ))}
        </div>

        {/* Main Content Title */}
        <h2 className="text-2xl font-light text-zinc-400 mb-8">Project Scope</h2>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column: Systems Lists */}
          <div className="col-span-12 lg:col-span-7 space-y-10">
            
            {/* In Scope Section */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-normal text-zinc-200">In Scope</h3>
                <button className="flex items-center gap-2 text-xs text-zinc-500 border border-green-500 px-3 py-1 rounded hover:text-zinc-300">
                  <ArrowRight size={12} className="rotate-180" /> VIEW SCOPE
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {inScopeSystems.map((sys) => (
                  <div key={sys.id} className="bg-[#131316] border border-green-500 p-4 rounded flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[10px] text-zinc-500 uppercase">System ID</div>
                        <div className="text-lg font-medium text-white">{sys.id}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase">Version</div>
                      <div className="text-sm text-zinc-300">{sys.version}</div>
                    </div>
                    <button className="w-full py-1.5 mt-2 text-[10px] font-bold bg-[#1c1c21] border border-green-500 text-zinc-400 hover:text-white hover:border-red-500 hover:text-red-400 transition-colors rounded uppercase">
                      Remove System
                    </button>
                  </div>
                ))}
                
                {/* Add New Placeholder */}
                <div className="border border-dashed border-green-500/50 rounded flex items-center justify-center min-h-[160px] cursor-pointer hover:bg-green-900/5 transition-colors group">
                  <div className="w-8 h-8 rounded-full border border-zinc-600 flex items-center justify-center group-hover:border-green-500">
                    <Plus size={16} className="text-zinc-500 group-hover:text-green-500" />
                  </div>
                </div>
              </div>
            </section>

            {/* Available Systems Section */}
            <section>
              <h3 className="text-lg font-normal text-zinc-200 mb-4">Available Systems</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {availableSystems.map((sys) => (
                  <div key={sys.id} className="bg-[#131316] border border-green-500 p-4 rounded flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[10px] text-zinc-500 uppercase">System ID</div>
                        <div className="text-lg font-medium text-white">{sys.id}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase">Version</div>
                      <div className="text-sm text-zinc-300">{sys.version}</div>
                    </div>
                    <button className="w-full py-1.5 mt-2 text-[10px] font-bold bg-blue-600/10 border border-green-500 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors rounded uppercase">
                      Add System
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Add New Systems Form */}
          <div className="col-span-12 lg:col-span-5">
            <div className="bg-[#131316] border border-green-500 rounded p-6 h-full relative">
              <h3 className="text-xl font-light text-zinc-200 mb-8">Add New Systems</h3>
              
              <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                {/* System ID */}
                <div className="col-span-1">
                  <label className="block text-[10px] text-zinc-500 uppercase mb-1.5">System ID</label>
                  <input 
                    type="text" 
                    defaultValue="P10" 
                    className="w-full bg-[#0c0c0e] border border-green-500 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* Default IMP Content */}
                <div className="col-span-1">
                  <label className="block text-[10px] text-zinc-500 uppercase mb-1.5">Default IMP Content</label>
                  <div className="relative">
                    <select className="w-full bg-[#0c0c0e] border border-green-500 rounded px-3 py-2 text-sm text-zinc-500 appearance-none focus:outline-none focus:ring-1 focus:ring-green-500">
                      <option>Select</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                {/* Type */}
                <div className="col-span-1">
                  <label className="block text-[10px] text-zinc-500 uppercase mb-1.5">Type</label>
                  <div className="relative">
                    <select className="w-full bg-[#0c0c0e] border border-green-500 rounded px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-green-500">
                      <option>SAP</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                {/* SAP System Owner */}
                <div className="col-span-1">
                  <label className="block text-[10px] text-zinc-500 uppercase mb-1.5">SAP System Owner</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      defaultValue="owner@mail.ch"
                      className="w-full bg-[#0c0c0e] border border-green-500 rounded px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:ring-1 focus:ring-green-500 pl-8"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </div>
                  </div>
                </div>

                {/* Version */}
                <div className="col-span-1">
                  <label className="block text-[10px] text-zinc-500 uppercase mb-1.5">Version</label>
                  <div className="relative">
                    <select className="w-full bg-[#0c0c0e] border border-green-500 rounded px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-green-500">
                      <option>ECC 6.0</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                {/* Location */}
                <div className="col-span-1">
                  <label className="block text-[10px] text-zinc-500 uppercase mb-1.5">Location</label>
                  <input 
                    type="text" 
                    defaultValue="Kreuzlingen"
                    className="w-full bg-[#0c0c0e] border border-green-500 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* SAP Base Admin */}
                <div className="col-span-1">
                  <label className="block text-[10px] text-zinc-500 uppercase mb-1.5">SAP Base Admin</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      defaultValue="Admin@mail.ch"
                      className="w-full bg-[#0c0c0e] border border-green-500 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500 pl-8"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="absolute bottom-6 right-6">
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 px-6 rounded border border-green-500 flex items-center gap-2 transition-colors uppercase tracking-wider">
                  Add System <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDashboard;
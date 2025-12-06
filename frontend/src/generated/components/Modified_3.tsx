import React, { useState } from 'react';
import { 
  Bell, 
  ChevronDown, 
  User, 
  Plus, 
  Mail, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  LayoutGrid, 
  Settings,
  Search,
  X
} from 'lucide-react';

// Mock Data
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

const ProjectScopeDashboard = () => {
  const [activeTab, setActiveTab] = useState('PROJECT SCOPE');

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-green-500/30">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-[#0c0c0e]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-xs">
            jivs
          </div>
        </div>
        <div className="flex items-center gap-6 text-zinc-400">
          <Bell className="w-5 h-5 hover:text-white cursor-pointer" />
          <div className="flex items-center gap-2 hover:text-white cursor-pointer">
            <span className="text-sm font-medium">Seeburg AG</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white font-bold">
              RK
            </div>
            <ChevronDown className="w-4 h-4 cursor-pointer" />
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="p-8 max-w-[1600px] mx-auto">
        
        {/* Project Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-800 rounded flex flex-col items-center justify-center text-[10px] font-bold text-blue-400 border border-slate-700">
              <span>NBH</span>
              <span className="text-[8px] text-slate-500">NEW BUILD</span>
            </div>
            <h1 className="text-2xl font-light tracking-wide text-white">
              S/4 Transformation Project
            </h1>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-1.5 text-xs font-medium border border-green-500/50 rounded hover:bg-zinc-800 transition-colors text-zinc-400">
              VIEW SCOPE
            </button>
            <button className="px-4 py-1.5 text-xs font-medium border border-green-500/50 rounded hover:bg-zinc-800 transition-colors text-zinc-400">
              COLLABORATORS
            </button>
          </div>
        </div>

        {/* Process Tabs */}
        <div className="grid grid-cols-6 gap-1 mb-10 border-b border-zinc-800 pb-1">
          {[
            'PROJECT SCOPE',
            'HISTORY ANALYSIS',
            'JIVS IMP DEPLOYMENT',
            'IMPLEMENTATION',
            'ACCEPTANCE TESTING',
            'FINALIZE PROJECT'
          ].map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                relative py-3 px-2 text-[10px] font-bold tracking-wider uppercase transition-all
                flex items-center justify-center gap-2
                ${activeTab === tab 
                  ? 'bg-[#1c1c22] text-white border-t-2 border-green-500' 
                  : 'bg-[#121215] text-zinc-500 hover:bg-[#18181b] border-t-2 border-transparent'}
              `}
            >
              {activeTab === tab && <CheckCircle2 className="w-3 h-3 text-green-500" />}
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-12">
          {/* Left Column: Scope & Available Systems */}
          <div className="col-span-12 lg:col-span-7">
            <h2 className="text-xl font-light text-zinc-300 mb-8">Project Scope</h2>

            {/* In Scope Section */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-normal text-zinc-200">In Scope</h3>
                <button className="flex items-center gap-2 px-3 py-1 text-xs border border-zinc-700 rounded text-zinc-400 hover:text-white">
                  <LayoutGrid className="w-3 h-3" /> VIEW SCOPE
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {inScopeSystems.map((sys) => (
                  <div key={sys.id} className="bg-[#131316] border border-green-500/50 p-4 rounded-sm hover:border-green-400 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider">System ID</div>
                        <div className="text-sm font-bold text-white">{sys.id}</div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Version</div>
                      <div className="text-xs text-zinc-300">{sys.version}</div>
                    </div>
                    <button className="w-full py-1.5 text-[10px] font-bold bg-zinc-900 text-zinc-400 hover:bg-red-900/30 hover:text-red-400 rounded transition-colors uppercase">
                      Remove System
                    </button>
                  </div>
                ))}
                
                {/* Add New Placeholder */}
                <button className="border border-dashed border-zinc-700 bg-transparent rounded-sm flex items-center justify-center hover:border-green-500 hover:bg-zinc-900/50 transition-all group h-full min-h-[140px]">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-green-900/30 transition-colors">
                    <Plus className="w-4 h-4 text-zinc-400 group-hover:text-green-400" />
                  </div>
                </button>
              </div>
            </div>

            {/* Available Systems Section */}
            <div>
              <h3 className="text-lg font-normal text-zinc-200 mb-4">Available Systems</h3>
              <div className="grid grid-cols-3 gap-4">
                {availableSystems.map((sys) => (
                  <div key={sys.id} className="bg-[#131316] border border-green-500/50 p-4 rounded-sm hover:border-green-400 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider">System ID</div>
                        <div className="text-sm font-bold text-white">{sys.id}</div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Version</div>
                      <div className="text-xs text-zinc-300">{sys.version}</div>
                    </div>
                    <button className="w-full py-1.5 text-[10px] font-bold bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded transition-colors uppercase">
                      Add System
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Add New Systems Form */}
          <div className="col-span-12 lg:col-span-5 pl-0 lg:pl-8 border-l border-zinc-800/50">
            <h2 className="text-xl font-light text-zinc-300 mb-8">Add New Systems</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-500">System ID</label>
                  <input 
                    type="text" 
                    defaultValue="P10" 
                    className="w-full bg-[#0c0c0e] border border-green-500 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-500">Default IMP Content</label>
                  <div className="relative">
                    <select className="w-full bg-[#0c0c0e] border border-green-500 rounded px-3 py-2 text-sm text-zinc-400 appearance-none focus:outline-none focus:ring-1 focus:ring-green-500">
                      <option>Select</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-500">Type</label>
                  <div className="relative">
                    <select className="w-full bg-[#0c0c0e] border border-green-500 rounded px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-green-500">
                      <option>SAP</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-500">SAP System Owner</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      defaultValue="owner@mail.ch" 
                      className="w-full bg-[#0c0c0e] border border-green-500 rounded px-3 py-2 pl-9 text-sm text-zinc-400 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-500">Version</label>
                  <div className="relative">
                    <select className="w-full bg-[#0c0c0e] border border-green-500 rounded px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-green-500">
                      <option>ECC 6.0</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-500">Location</label>
                  <input 
                    type="text" 
                    defaultValue="Kreuzlingen" 
                    className="w-full bg-[#0c0c0e] border border-green-500 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-500">SAP Base Admin</label>
                <div className="relative">
                  <input 
                    type="text" 
                    defaultValue="Admin@mail.ch" 
                    className="w-full bg-[#0c0c0e] border border-green-500 rounded px-3 py-2 pl-9 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                </div>
              </div>

              <div className="pt-12 flex justify-end">
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 px-6 rounded flex items-center gap-2 transition-colors">
                  ADD SYSTEM <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectScopeDashboard;
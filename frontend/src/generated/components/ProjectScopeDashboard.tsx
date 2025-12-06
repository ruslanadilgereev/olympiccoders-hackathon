import React from 'react';
import { 
  Bell, 
  ChevronDown, 
  CheckCircle, 
  Plus, 
  Mail, 
  ArrowRight 
} from 'lucide-react';

// Mock Data for Systems
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

export default function ProjectScopeDashboard() {
  return (
    <div className="min-h-screen bg-[#0B0C0E] text-white font-sans selection:bg-green-500/30">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-green-600/50">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-[#D32F2F] flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-red-900/20">
             jivs
           </div>
        </div>
        <div className="flex items-center gap-6 text-gray-400 text-sm">
          <Bell className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
          <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
            <span className="font-medium">Seeburg AG</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center text-xs text-white font-bold">
            RK
          </div>
        </div>
      </header>

      {/* Project Header Area */}
      <div className="px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-5">
            <div className="bg-[#162032] border border-green-600/30 p-2 rounded text-center min-w-[60px] shadow-sm">
              <div className="text-blue-400 font-bold text-lg leading-none">NBH</div>
              <div className="text-[9px] text-gray-400 leading-none mt-1 font-medium">NEW BUILD HISTORY</div>
            </div>
            <h1 className="text-3xl font-light text-gray-200 tracking-tight">S/4 Transformation Project</h1>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2 text-[10px] font-semibold border border-green-600 text-gray-400 hover:text-white hover:bg-green-900/10 transition-colors uppercase tracking-widest">
              View Scope
            </button>
            <button className="px-5 py-2 text-[10px] font-semibold border border-green-600 text-gray-400 hover:text-white hover:bg-green-900/10 transition-colors uppercase tracking-widest">
              Collaborators
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-green-600/30 mb-10 overflow-x-auto no-scrollbar">
          {[
            { name: 'PROJECT SCOPE', active: true, icon: true },
            { name: 'HISTORY ANALYSIS', active: false },
            { name: 'JIVS IMP DEPLOYMENT', active: false },
            { name: 'IMPLEMENTATION', active: false },
            { name: 'ACCEPTANCE TESTING', active: false },
            { name: 'FINALIZE PROJECT', active: false },
          ].map((tab, idx) => (
            <div 
              key={idx}
              className={`
                flex items-center gap-2 px-8 py-4 text-[10px] font-bold tracking-widest cursor-pointer border-r border-green-600/20 transition-all whitespace-nowrap
                ${tab.active 
                  ? 'bg-[#151618] text-white border-t-2 border-t-white relative after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-[#151618]' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-[#1A1B1E]/50'}
              `}
            >
              {tab.icon && <CheckCircle className="w-3 h-3 text-white" fill="currentColor" />}
              {tab.name}
            </div>
          ))}
        </div>

        {/* Main Content Title */}
        <h2 className="text-2xl font-light text-gray-200 mb-8 tracking-wide">Project Scope</h2>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left Column: Systems Management */}
          <div className="xl:col-span-7 space-y-10">
            
            {/* In Scope Section */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-light text-gray-200">In Scope</h3>
                <button className="flex items-center gap-2 px-3 py-1.5 border border-green-600 text-[10px] font-medium text-gray-400 uppercase hover:bg-green-900/10 transition-colors tracking-wider">
                  <ArrowRight className="w-3 h-3 rotate-180" /> View Scope
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {inScopeSystems.map((sys) => (
                  <div key={sys.id} className="bg-[#151618] p-4 border border-green-600/30 flex flex-col justify-between min-h-[140px] hover:border-green-500/50 transition-colors">
                    <div>
                      <div className="text-[10px] text-gray-500 mb-1">System ID:</div>
                      <div className="text-sm font-bold text-white mb-3">{sys.id}</div>
                      <div className="text-[10px] text-gray-500">Version:</div>
                      <div className="text-[11px] text-gray-400">{sys.version}</div>
                    </div>
                    <button className="mt-4 w-full py-1.5 text-[9px] font-bold border border-green-600 text-gray-300 hover:bg-red-900/20 hover:border-red-500 hover:text-red-400 transition-all uppercase tracking-wide">
                      Remove System
                    </button>
                  </div>
                ))}
                {/* Add Placeholder Card */}
                <div className="bg-[#151618] border border-dashed border-green-600/40 flex items-center justify-center min-h-[140px] cursor-pointer hover:bg-[#1A1B1E] hover:border-green-500 transition-all group">
                  <div className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center group-hover:bg-green-600 transition-colors shadow-lg">
                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Available Systems Section */}
            <div>
              <h3 className="text-lg font-light text-gray-200 mb-5">Available Systems</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {availableSystems.map((sys) => (
                  <div key={sys.id} className="bg-[#151618] p-4 border border-green-600/30 flex flex-col justify-between min-h-[140px] hover:border-green-500/50 transition-colors">
                    <div>
                      <div className="text-[10px] text-gray-500 mb-1">System ID:</div>
                      <div className="text-sm font-bold text-white mb-3">{sys.id}</div>
                      <div className="text-[10px] text-gray-500">Version:</div>
                      <div className="text-[11px] text-gray-400">{sys.version}</div>
                    </div>
                    <button className="mt-4 w-full py-1.5 text-[9px] font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors uppercase tracking-wide shadow-lg shadow-blue-900/20">
                      Add System
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Add New Systems Form */}
          <div className="xl:col-span-5">
            <div className="bg-[#121315] p-8 border border-green-600/30 h-full relative min-h-[600px]">
              <h3 className="text-xl font-light text-gray-200 mb-10">Add New Systems</h3>
              
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-2">
                  <label className="text-[11px] text-gray-500 block">System ID</label>
                  <input 
                    type="text" 
                    defaultValue="P10" 
                    className="w-full bg-[#0B0C0E] border border-green-600/50 text-sm text-white px-4 py-2.5 focus:outline-none focus:border-green-400 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] text-gray-500 block">Default IMP Content</label>
                  <div className="relative">
                    <select className="w-full bg-[#0B0C0E] border border-green-600/50 text-sm text-gray-400 px-4 py-2.5 appearance-none focus:outline-none focus:border-green-400 transition-colors">
                      <option>Select</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-2">
                  <label className="text-[11px] text-blue-500 block">Type</label>
                  <div className="relative">
                    <select className="w-full bg-[#0B0C0E] border-b border-green-500 text-sm text-white px-4 py-2.5 appearance-none focus:outline-none">
                      <option>SAP</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] text-gray-500 block">SAP System Owner</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      defaultValue="owner@mail.ch" 
                      className="w-full bg-[#0B0C0E] border border-green-600/50 text-sm text-gray-400 px-4 py-2.5 pl-10 focus:outline-none focus:border-green-400 transition-colors"
                    />
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-2">
                  <label className="text-[11px] text-gray-500 block">Version</label>
                  <div className="relative">
                    <select className="w-full bg-[#0B0C0E] border border-green-600/50 text-sm text-white px-4 py-2.5 appearance-none focus:outline-none focus:border-green-400 transition-colors">
                      <option>ECC 6.0</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] text-gray-500 block">Location</label>
                  <input 
                    type="text" 
                    defaultValue="Kreuzlingen" 
                    className="w-full bg-[#0B0C0E] border border-green-600/50 text-sm text-white px-4 py-2.5 focus:outline-none focus:border-green-400 transition-colors"
                  />
                </div>
              </div>

              <div className="mb-12">
                <div className="space-y-2">
                  <label className="text-[11px] text-gray-500 block">SAP Base Admin</label>
                  <div className="relative w-full md:w-1/2">
                    <input 
                      type="text" 
                      defaultValue="Admin@mail.ch" 
                      className="w-full bg-[#0B0C0E] border border-green-600/50 text-sm text-white px-4 py-2.5 pl-10 focus:outline-none focus:border-green-400 transition-colors"
                    />
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-8 right-8">
                <button className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold py-3 px-8 flex items-center gap-2 transition-colors uppercase tracking-widest shadow-lg shadow-blue-900/30">
                  Add System <ArrowRight className="w-3 h-3" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

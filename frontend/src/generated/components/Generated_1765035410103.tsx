import React, { useState } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Plus, 
  ArrowRight, 
  Mail, 
  Check, 
  LayoutGrid, 
  Settings,
  User
} from 'lucide-react';

const ProjectScopeDashboard = () => {
  // State for form inputs (visual only)
  const [systemId, setSystemId] = useState('P10');
  
  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white font-sans selection:bg-red-500/30">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-red-600 bg-[#0c0c0e]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-xs border border-red-400">
            jvs
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
          <div className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <LayoutGrid className="w-4 h-4" />
            <span>Seeburg AG</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-medium border border-red-600">
            RK
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </header>

      {/* Main Content Wrapper */}
      <main className="p-8 max-w-[1600px] mx-auto">
        
        {/* Project Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1e293b] rounded border border-red-600 flex flex-col items-center justify-center text-[10px] font-bold text-blue-400">
              <span>NBH</span>
              <span className="text-[8px] text-gray-500">NEW BUILD</span>
            </div>
            <h1 className="text-2xl font-light tracking-wide">S/4 Transformation Project</h1>
          </div>
          
          <div className="flex gap-3">
            <button className="px-4 py-2 text-xs font-medium border border-red-600 text-gray-400 hover:text-white uppercase tracking-wider">
              View Scope
            </button>
            <button className="px-4 py-2 text-xs font-medium border border-red-600 text-gray-400 hover:text-white uppercase tracking-wider">
              Collaborators
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border border-red-600 bg-[#131316] mb-10 overflow-x-auto">
          {[ 
            { name: 'PROJECT SCOPE', active: true, icon: true },
            { name: 'HISTORY ANALYSIS', active: false },
            { name: 'JIVS IMP DEPLOYMENT', active: false },
            { name: 'IMPLEMENTATION', active: false },
            { name: 'ACCEPTANCE TESTING', active: false },
            { name: 'FINALIZE PROJECT', active: false }
          ].map((tab, idx) => (
            <div 
              key={idx} 
              className={`
                flex-1 min-w-max px-4 py-4 text-[10px] font-bold tracking-widest uppercase text-center cursor-pointer border-r border-red-600 last:border-r-0 transition-colors
                ${tab.active ? 'bg-[#1e1e24] text-white' : 'text-gray-500 hover:text-gray-300'}
              `}
            >
              <div className="flex items-center justify-center gap-2">
                {tab.icon && <div className="w-3 h-3 rounded-full bg-white flex items-center justify-center"><Check className="w-2 h-2 text-black" /></div>}
                {tab.name}
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* Left Column: Scope & Available Systems */}
          <div className="col-span-12 lg:col-span-8">
            <h2 className="text-xl font-light mb-6 text-gray-200">Project Scope</h2>

            {/* In Scope Section */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-normal text-gray-300">In Scope</h3>
                <button className="px-3 py-1 text-[10px] border border-red-600 text-gray-400 uppercase">View Scope</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* System Card P01 */}
                <SystemCard id="P01" version="SAP ECC 6.0" action="REMOVE SYSTEM" />
                {/* System Card P02 */}
                <SystemCard id="P02" version="SAP ECC 6.0" action="REMOVE SYSTEM" />
                {/* System Card P03 */}
                <SystemCard id="P03" version="SAP ECC 6.0" action="REMOVE SYSTEM" />
                
                {/* Add Placeholder */}
                <div className="h-32 border border-dashed border-red-600 rounded bg-[#131316]/50 flex items-center justify-center cursor-pointer hover:bg-[#131316]">
                  <Plus className="w-6 h-6 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Available Systems Section */}
            <div>
              <h3 className="text-lg font-normal text-gray-300 mb-4">Available Systems</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['P04', 'P05', 'P06', 'P07', 'P08', 'P09'].map((id) => (
                  <SystemCard 
                    key={id} 
                    id={id} 
                    version="SAP ECC 6.0" 
                    action="ADD SYSTEM" 
                    isAdd 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Add New Systems Form */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-[#131316] border border-red-600 p-6 rounded-sm h-full relative">
              <h3 className="text-lg font-normal text-gray-300 mb-8">Add New Systems</h3>

              <div className="space-y-6">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase">System ID</label>
                    <input 
                      type="text" 
                      value={systemId} 
                      onChange={(e) => setSystemId(e.target.value)}
                      className="w-full bg-transparent border-b border-red-600 py-2 text-sm focus:outline-none text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase">Default IMP Content</label>
                    <div className="relative">
                      <select className="w-full bg-transparent border-b border-red-600 py-2 text-sm focus:outline-none text-gray-400 appearance-none">
                        <option>Select</option>
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-0 top-3 text-gray-500" />
                    </div>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-blue-500 uppercase">Type</label>
                    <div className="relative">
                      <select className="w-full bg-transparent border-b border-blue-500 py-2 text-sm focus:outline-none text-white appearance-none">
                        <option>SAP</option>
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-0 top-3 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase">SAP System Owner</label>
                    <div className="flex items-center border-b border-red-600 py-2">
                      <Mail className="w-3 h-3 text-gray-500 mr-2" />
                      <input 
                        type="text" 
                        value="owner@mail.ch"
                        readOnly
                        className="w-full bg-transparent text-sm focus:outline-none text-gray-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase">Version</label>
                    <div className="relative">
                      <select className="w-full bg-transparent border-b border-red-600 py-2 text-sm focus:outline-none text-white appearance-none">
                        <option>ECC 6.0</option>
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-0 top-3 text-gray-500" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase">Location</label>
                    <input 
                      type="text" 
                      value="Kreuzlingen"
                      readOnly
                      className="w-full bg-transparent border-b border-red-600 py-2 text-sm focus:outline-none text-white"
                    />
                  </div>
                </div>

                {/* Row 4 */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase">SAP Base Admin</label>
                  <div className="flex items-center border-b border-red-600 py-2">
                    <Mail className="w-3 h-3 text-gray-500 mr-2" />
                    <input 
                      type="text" 
                      value="Admin@mail.ch"
                      readOnly
                      className="w-full bg-transparent text-sm focus:outline-none text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Add Button */}
              <div className="absolute bottom-6 right-6">
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 px-6 rounded flex items-center gap-2 border border-red-600 shadow-lg shadow-blue-900/20">
                  ADD SYSTEM
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

// Reusable System Card Component
const SystemCard = ({ id, version, action, isAdd = false }: { id: string, version: string, action: string, isAdd?: boolean }) => (
  <div className="bg-[#131316] p-4 rounded border border-red-600 flex flex-col justify-between h-32">
    <div>
      <div className="text-[10px] text-gray-500 uppercase mb-1">System ID:</div>
      <div className="text-sm font-medium text-white mb-2">{id}</div>
      <div className="text-[10px] text-gray-500 uppercase mb-1">Version:</div>
      <div className="text-xs text-gray-300">{version}</div>
    </div>
    <button 
      className={`
        w-full py-1.5 text-[9px] font-bold uppercase tracking-wider rounded mt-2 transition-colors border border-red-600
        ${isAdd 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'bg-transparent text-gray-400 hover:text-white hover:bg-red-900/20'}
      `}
    >
      {action}
    </button>
  </div>
);

export default ProjectScopeDashboard;
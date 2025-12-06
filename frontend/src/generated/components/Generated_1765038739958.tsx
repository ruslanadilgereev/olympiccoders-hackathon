import React, { useState } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Check, 
  Plus, 
  Mail, 
  ArrowRight, 
  LayoutGrid, 
  Settings, 
  User,
  Search,
  MoreHorizontal
} from 'lucide-react';

const ProjectScopeUI = () => {
  // State for tabs to demonstrate interactivity
  const [activeTab, setActiveTab] = useState('PROJECT SCOPE');

  const tabs = [
    { name: 'PROJECT SCOPE', status: 'active' },
    { name: 'HISTORY ANALYSIS', status: 'pending' },
    { name: 'JIVS IMP DEPLOYMENT', status: 'pending' },
    { name: 'IMPLEMENTATION', status: 'pending' },
    { name: 'ACCEPTANCE TESTING', status: 'pending' },
    { name: 'FINALIZE PROJECT', status: 'pending' }
  ];

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

  // Helper class for the requested green borders
  const borderClass = "border border-green-500";

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-gray-300 font-sans selection:bg-green-500/30">
      {/* Header */}
      <header className={`flex items-center justify-between px-6 py-4 bg-[#0B0C0E] ${borderClass} border-t-0 border-x-0`}>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
              jivs
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm font-medium text-gray-300">Seeburg AG</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
            RK
          </div>
        </div>
      </header>

      {/* Main Content Wrapper */}
      <main className="p-8 max-w-[1600px] mx-auto">
        
        {/* Project Title Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 bg-[#1E293B] flex flex-col items-center justify-center rounded ${borderClass}`}>
              <span className="text-blue-400 font-bold text-sm">NBH</span>
              <span className="text-[0.5rem] text-gray-500 leading-none">NEW BUILD HISTORY</span>
            </div>
            <h1 className="text-2xl font-light text-white tracking-wide">S/4 Transformation Project</h1>
          </div>
          
          <div className="flex gap-3">
            <button className={`px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider hover:text-white transition-colors ${borderClass} rounded`}>
              <LayoutGrid className="w-3 h-3 inline-block mr-2" />
              View Scope
            </button>
            <button className={`px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider hover:text-white transition-colors ${borderClass} rounded`}>
              Collaborators
            </button>
          </div>
        </div>

        {/* Progress Tabs */}
        <div className="flex items-center w-full mb-10 overflow-x-auto">
          {tabs.map((tab, index) => (
            <div 
              key={index} 
              className={`flex-1 min-w-[140px] flex items-center justify-center py-3 px-2 text-[10px] font-bold tracking-wider uppercase border-r last:border-r-0 ${borderClass} ${
                tab.status === 'active' 
                  ? 'bg-[#1E1F23] text-white' 
                  : 'bg-[#0F1012] text-gray-500'
              }`}
            >
              {tab.status === 'active' && <Check className="w-3 h-3 mr-2 text-white" />}
              {tab.name}
            </div>
          ))}
        </div>

        <h2 className="text-xl text-gray-300 mb-6 font-light">Project Scope</h2>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column: Systems Lists */}
          <div className="col-span-12 lg:col-span-7">
            
            {/* In Scope Section */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-light text-white">In Scope</h3>
                <button className={`flex items-center gap-2 px-3 py-1.5 text-[10px] text-gray-400 uppercase tracking-wider ${borderClass} rounded hover:bg-white/5`}>
                  <LayoutGrid className="w-3 h-3" />
                  View Scope
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {inScopeSystems.map((sys) => (
                  <div key={sys.id} className={`bg-[#131417] p-4 rounded flex flex-col gap-4 ${borderClass}`}>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">System ID:</div>
                      <div className="text-white font-medium">{sys.id}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Version:</div>
                      <div className="text-gray-300 text-sm">{sys.version}</div>
                    </div>
                    <button className={`mt-auto w-full py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider hover:text-white hover:bg-red-500/10 transition-colors ${borderClass} rounded`}>
                      Remove System
                    </button>
                  </div>
                ))}
                
                {/* Add Placeholder */}
                <button className={`border-dashed ${borderClass} bg-transparent rounded flex items-center justify-center min-h-[160px] hover:bg-white/5 transition-colors group`}>
                  <div className="w-8 h-8 rounded-full bg-[#1E1F23] flex items-center justify-center group-hover:bg-[#2A2B30]">
                    <Plus className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              </div>
            </div>

            {/* Available Systems Section */}
            <div>
              <h3 className="text-lg font-light text-white mb-4">Available Systems</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {availableSystems.map((sys) => (
                  <div key={sys.id} className={`bg-[#131417] p-4 rounded flex flex-col gap-4 ${borderClass}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">System ID:</div>
                        <div className="text-white font-medium">{sys.id}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Version:</div>
                      <div className="text-gray-300 text-sm">{sys.version}</div>
                    </div>
                    <button className={`mt-auto w-full py-1.5 text-[10px] font-bold text-blue-400 uppercase tracking-wider hover:text-white hover:bg-blue-600 transition-colors ${borderClass} border-blue-900/50 rounded bg-blue-900/10`}>
                      Add System
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Add New Systems Form */}
          <div className="col-span-12 lg:col-span-5">
            <div className={`bg-[#131417] p-6 rounded h-full ${borderClass}`}>
              <h3 className="text-xl font-light text-white mb-8">Add New Systems</h3>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">System ID</label>
                  <input 
                    type="text" 
                    defaultValue="P10" 
                    className={`w-full bg-[#0B0C0E] text-white text-sm px-3 py-2.5 rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${borderClass}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">Default IMP Content</label>
                  <div className="relative">
                    <select className={`w-full bg-[#0B0C0E] text-gray-400 text-sm px-3 py-2.5 rounded appearance-none focus:outline-none focus:ring-1 focus:ring-green-500 ${borderClass}`}>
                      <option>Select</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-1.5">
                  <label className="text-xs text-blue-500">Type</label>
                  <div className="relative">
                    <select className={`w-full bg-[#0B0C0E] text-white text-sm px-3 py-2.5 rounded appearance-none focus:outline-none focus:ring-1 focus:ring-green-500 ${borderClass}`}>
                      <option>SAP</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">SAP System Owner</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="owner@mail.ch" 
                      className={`w-full bg-[#0B0C0E] text-white text-sm px-3 py-2.5 pl-9 rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${borderClass}`}
                    />
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">Version</label>
                  <div className="relative">
                    <select className={`w-full bg-[#0B0C0E] text-white text-sm px-3 py-2.5 rounded appearance-none focus:outline-none focus:ring-1 focus:ring-green-500 ${borderClass}`}>
                      <option>ECC 6.0</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">Location</label>
                  <input 
                    type="text" 
                    defaultValue="Kreuzlingen" 
                    className={`w-full bg-[#0B0C0E] text-white text-sm px-3 py-2.5 rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${borderClass}`}
                  />
                </div>
              </div>

              <div className="mb-12">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">SAP Base Admin</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      defaultValue="Admin@mail.ch" 
                      className={`w-full bg-[#0B0C0E] text-white text-sm px-3 py-2.5 pl-9 rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${borderClass}`}
                    />
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className={`bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 px-6 rounded uppercase tracking-wider flex items-center gap-2 transition-colors ${borderClass} border-blue-500`}>
                  Add System
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

export default ProjectScopeUI;

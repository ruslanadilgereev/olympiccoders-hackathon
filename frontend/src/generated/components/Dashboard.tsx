import React, { useState } from 'react';
import { Bell, ChevronDown, Plus, ArrowRight, LayoutGrid, Mail } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Project Scope');

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

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-300 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#0f1115] border-b border-green-500">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#d92828] flex items-center justify-center text-white font-bold text-sm border border-green-500 shadow-[0_0_10px_rgba(0,255,0,0.2)]">
            jivs
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
          <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
            <LayoutGrid className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium">Seeburg AG</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          <div className="w-9 h-9 rounded-full bg-[#8b5cf6] flex items-center justify-center text-xs text-white font-bold border border-green-500">
            RK
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 cursor-pointer" />
        </div>
      </header>

      <main className="p-8 max-w-[1800px] mx-auto">
        {/* Project Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#1e2330] rounded border border-green-500 flex flex-col items-center justify-center text-blue-400 leading-none shadow-sm">
              <span className="text-lg font-bold">NBH</span>
              <span className="text-[7px] text-gray-500 mt-0.5 font-medium tracking-tighter">NEW BUILD HISTORY</span>
            </div>
            <h1 className="text-3xl text-white font-light tracking-wide">
              S/4 Transformation Project
            </h1>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest border border-green-500 text-gray-400 hover:text-white hover:bg-green-500/10 transition-all">
              View Scope
            </button>
            <button className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest border border-green-500 text-gray-400 hover:text-white hover:bg-green-500/10 transition-all">
              Collaborators
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-green-500 mb-10 overflow-x-auto scrollbar-hide">
          {[
            'Project Scope',
            'History Analysis',
            'JIVS IMP Deployment',
            'Implementation',
            'Acceptance Testing',
            'Finalize Project'
          ].map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-8 py-4 text-[10px] font-bold uppercase tracking-widest border-r border-green-500 transition-all whitespace-nowrap
                ${index === 0 ? 'border-l' : ''}
                ${activeTab === tab 
                  ? 'bg-[#1c1f26] text-white border-t border-t-green-500 relative' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-[#16181d]'
                }
              `}
            >
              <div className="flex items-center gap-3">
                {activeTab === tab && (
                  <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-black" />
                  </div>
                )}
                {tab}
              </div>
            </button>
          ))}
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          
          {/* Left Column */}
          <div className="xl:col-span-7 space-y-10">
            <h2 className="text-2xl text-white font-light tracking-wide">Project Scope</h2>
            
            {/* In Scope Section */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg text-gray-200 font-light">In Scope</h3>
                <button className="px-4 py-1.5 text-[10px] border border-green-500 text-gray-400 font-bold uppercase tracking-widest hover:bg-green-500/10 transition-colors">
                  View Scope
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {inScopeSystems.map((sys) => (
                  <div key={sys.id} className="bg-[#16181d] border border-green-500 p-5 flex flex-col justify-between min-h-[160px] group hover:border-green-400 transition-colors">
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">System ID:</div>
                      <div className="text-xl text-white font-medium mb-4">{sys.id}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Version:</div>
                      <div className="text-xs text-gray-300">{sys.version}</div>
                    </div>
                    <button className="mt-4 w-full py-2 text-[9px] font-bold uppercase tracking-widest bg-[#0f1115] text-gray-400 border border-green-500 hover:bg-red-900/20 hover:text-red-400 hover:border-red-500 transition-all">
                      Remove System
                    </button>
                  </div>
                ))}
                
                {/* Add Button Card */}
                <div className="bg-[#16181d]/50 border border-dashed border-green-500 p-5 flex items-center justify-center min-h-[160px] cursor-pointer hover:bg-[#16181d] transition-colors group">
                  <div className="w-10 h-10 rounded-full border border-green-500 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:border-green-400 transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Available Systems Section */}
            <div>
              <h3 className="text-lg text-gray-200 font-light mb-5">Available Systems</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {availableSystems.map((sys) => (
                  <div key={sys.id} className="bg-[#16181d] border border-green-500 p-5 flex flex-col justify-between min-h-[160px] hover:border-green-400 transition-colors">
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">System ID:</div>
                      <div className="text-xl text-white font-medium mb-4">{sys.id}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Version:</div>
                      <div className="text-xs text-gray-300">{sys.version}</div>
                    </div>
                    <button className="mt-4 w-full py-2 text-[9px] font-bold uppercase tracking-widest bg-[#2563eb]/10 text-[#3b82f6] border border-green-500 hover:bg-[#2563eb] hover:text-white transition-all">
                      Add System
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="xl:col-span-5 xl:pl-12 xl:border-l border-green-500 relative">
            {/* Right edge blue accent line simulation */}
            <div className="absolute -right-8 top-0 bottom-0 w-[2px] bg-blue-600 hidden xl:block opacity-50"></div>

            <h2 className="text-2xl text-white font-light tracking-wide mb-10">Add New Systems</h2>
            
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] text-gray-500 uppercase tracking-wider">System ID</label>
                  <input 
                    type="text" 
                    defaultValue="P10" 
                    className="w-full bg-[#16181d] border border-green-500 text-white px-4 py-3 text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] text-gray-500 uppercase tracking-wider">Default IMP Content</label>
                  <div className="relative">
                    <select className="w-full bg-[#16181d] border border-green-500 text-gray-400 px-4 py-3 text-sm appearance-none focus:outline-none focus:border-green-400 transition-all">
                      <option>Select</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] text-blue-400 uppercase tracking-wider font-medium">Type</label>
                  <div className="relative">
                    <select className="w-full bg-[#16181d] border border-green-500 text-white px-4 py-3 text-sm appearance-none focus:outline-none focus:border-green-400 transition-all">
                      <option>SAP</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] text-gray-500 uppercase tracking-wider">SAP System Owner</label>
                  <div className="flex items-center bg-[#16181d] border border-green-500 px-4 py-3 transition-all focus-within:border-green-400">
                    <Mail className="w-4 h-4 text-gray-500 mr-3" />
                    <input 
                      type="text" 
                      placeholder="owner@mail.ch" 
                      className="bg-transparent text-white text-sm w-full focus:outline-none placeholder-gray-600"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] text-gray-500 uppercase tracking-wider">Version</label>
                  <div className="relative">
                    <select className="w-full bg-[#16181d] border border-green-500 text-white px-4 py-3 text-sm appearance-none focus:outline-none focus:border-green-400 transition-all">
                      <option>ECC 6.0</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] text-gray-500 uppercase tracking-wider">Location</label>
                  <input 
                    type="text" 
                    defaultValue="Kreuzlingen" 
                    className="w-full bg-[#16181d] border border-green-500 text-white px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2 w-1/2 pr-4">
                <label className="text-[11px] text-gray-500 uppercase tracking-wider">SAP Base Admin</label>
                <div className="flex items-center bg-[#16181d] border border-green-500 px-4 py-3 transition-all focus-within:border-green-400">
                  <Mail className="w-4 h-4 text-gray-500 mr-3" />
                  <input 
                    type="text" 
                    defaultValue="Admin@mail.ch" 
                    className="bg-transparent text-white text-sm w-full focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-24 flex justify-end">
              <button className="bg-[#2563eb] hover:bg-blue-700 text-white px-8 py-4 text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 border border-green-500 shadow-lg shadow-blue-900/20 transition-all">
                Add System
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
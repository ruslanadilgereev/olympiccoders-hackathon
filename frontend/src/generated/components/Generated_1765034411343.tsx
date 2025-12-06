import React, { useState } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Plus, 
  ArrowRight, 
  Check, 
  Search, 
  Settings, 
  User,
  Monitor,
  X
} from 'lucide-react';

// Utility for the requested red border style
const borderStyle = "border border-red-600";
const borderBottomStyle = "border-b border-red-600";
const borderTopStyle = "border-t border-red-600";

export default function ProjectScopeUI() {
  const [activeTab, setActiveTab] = useState("Project Scope");

  const tabs = [
    { name: "Project Scope", active: true, icon: true },
    { name: "History Analysis", active: false },
    { name: "JIVS IMP Deployment", active: false },
    { name: "Implementation", active: false },
    { name: "Acceptance Testing", active: false },
    { name: "Finalize Project", active: false },
  ];

  const inScopeSystems = [
    { id: "P01", version: "SAP ECC 6.0" },
    { id: "P02", version: "SAP ECC 6.0" },
    { id: "P03", version: "SAP ECC 6.0" },
  ];

  const availableSystems = [
    { id: "P04", version: "SAP ECC 6.0" },
    { id: "P05", version: "SAP ECC 6.0" },
    { id: "P06", version: "SAP ECC 6.0" },
    { id: "P07", version: "SAP ECC 6.0" },
    { id: "P08", version: "SAP ECC 6.0" },
    { id: "P09", version: "SAP ECC 6.0" },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 font-sans selection:bg-red-900 selection:text-white overflow-x-hidden">
      {/* Top Navigation Bar */}
      <header className={`h-14 flex items-center justify-between px-6 bg-[#09090b] ${borderBottomStyle}`}>
        <div className="flex items-center gap-8">
          {/* Logo Placeholder */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
              jivs
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Bell className="w-5 h-5 text-zinc-400 hover:text-white cursor-pointer" />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded ${borderStyle} bg-zinc-900/50`}>
            <span className="text-sm font-medium text-zinc-300">Seeburg AG</span>
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white font-medium">
            RK
          </div>
        </div>
      </header>

      {/* Project Header */}
      <div className={`px-8 py-8 ${borderBottomStyle}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 bg-[#1c2333] rounded flex flex-col items-center justify-center text-blue-400 ${borderStyle}`}>
              <span className="text-sm font-bold leading-none">NBH</span>
              <span className="text-[0.4rem] text-blue-500/70 leading-none mt-0.5">NEW BUILD HISTORY</span>
            </div>
            <h1 className="text-2xl font-light text-white tracking-wide">S/4 Transformation Project</h1>
          </div>
          
          <div className="flex gap-3">
            <button className={`px-4 py-2 text-xs font-medium uppercase tracking-wider text-zinc-400 hover:text-white transition-colors ${borderStyle} rounded`}>
              View Scope
            </button>
            <button className={`px-4 py-2 text-xs font-medium uppercase tracking-wider text-zinc-400 hover:text-white transition-colors ${borderStyle} rounded`}>
              Collaborators
            </button>
          </div>
        </div>

        {/* Stepper / Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {tabs.map((tab, idx) => (
            <div 
              key={idx} 
              className={`
                flex items-center gap-2 px-6 py-3 min-w-max
                ${tab.active 
                  ? `bg-[#1c1c21] text-white ${borderStyle}` 
                  : `bg-transparent text-zinc-500 ${borderStyle} border-opacity-30`}
                first:rounded-l last:rounded-r
              `}
            >
              {tab.icon && <div className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center"><Check className="w-3 h-3" /></div>}
              <span className="text-xs font-bold uppercase tracking-wide">{tab.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 min-h-[calc(100vh-240px)]">
        
        {/* Left Panel: Scope Management */}
        <div className={`col-span-7 p-8 ${borderStyle} border-l-0 border-y-0`}>
          <h2 className="text-xl font-light text-zinc-400 mb-8">Project Scope</h2>

          {/* In Scope Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-normal text-zinc-200">In Scope</h3>
              <button className={`flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-500 ${borderStyle} rounded`}>
                <ArrowRight className="w-3 h-3 rotate-180" /> VIEW SCOPE
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {inScopeSystems.map((sys) => (
                <div key={sys.id} className={`bg-[#121214] p-4 rounded ${borderStyle} group hover:border-red-400 transition-colors`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">System ID:</div>
                      <div className="text-sm font-bold text-white">{sys.id}</div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-xs text-zinc-500 mb-1">Version:</div>
                    <div className="text-xs text-zinc-300">{sys.version}</div>
                  </div>
                  <button className={`w-full py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-red-900/20 ${borderStyle} rounded transition-colors`}>
                    Remove System
                  </button>
                </div>
              ))}
              
              {/* Add Placeholder */}
              <div className={`border-dashed ${borderStyle} rounded flex items-center justify-center min-h-[140px] cursor-pointer hover:bg-zinc-900/50 transition-colors`}>
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Available Systems Section */}
          <div>
            <h3 className="text-lg font-normal text-zinc-200 mb-4">Available Systems</h3>
            <div className="grid grid-cols-3 gap-4">
              {availableSystems.map((sys) => (
                <div key={sys.id} className={`bg-[#121214] p-4 rounded ${borderStyle}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">System ID:</div>
                      <div className="text-sm font-bold text-white">{sys.id}</div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-xs text-zinc-500 mb-1">Version:</div>
                    <div className="text-xs text-zinc-300">{sys.version}</div>
                  </div>
                  <button className={`w-full py-1.5 text-[10px] font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 ${borderStyle} rounded transition-colors`}>
                    Add System
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Add New Systems Form */}
        <div className="col-span-5 p-8 bg-[#0c0c0e]">
          <h2 className="text-xl font-light text-zinc-400 mb-8">Add New Systems</h2>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-zinc-500">System ID</label>
                <input 
                  type="text" 
                  defaultValue="P10" 
                  className={`w-full bg-transparent ${borderStyle} rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-400`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500">Default IMP Content</label>
                <div className="relative">
                  <select className={`w-full bg-transparent ${borderStyle} rounded px-3 py-2 text-sm text-zinc-500 appearance-none focus:outline-none focus:border-red-400`}>
                    <option>Select</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-zinc-500">Type</label>
                <div className="relative">
                  <select className={`w-full bg-transparent ${borderStyle} rounded px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:border-red-400`}>
                    <option>SAP</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500">SAP System Owner</label>
                <div className="relative">
                  <input 
                    type="text" 
                    defaultValue="owner@mail.ch" 
                    className={`w-full bg-transparent ${borderStyle} rounded px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-red-400`}
                  />
                  <Mail className="absolute right-3 top-2.5 w-4 h-4 text-zinc-600" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-zinc-500">Version</label>
                <div className="relative">
                  <select className={`w-full bg-transparent ${borderStyle} rounded px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:border-red-400`}>
                    <option>ECC 6.0</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500">Location</label>
                <div className="relative">
                  <input 
                    type="text" 
                    defaultValue="Kreuzlingen" 
                    className={`w-full bg-transparent ${borderStyle} rounded px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-red-400`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-zinc-500">SAP Base Admin</label>
              <div className="relative">
                <input 
                  type="text" 
                  defaultValue="Admin@mail.ch" 
                  className={`w-full bg-transparent ${borderStyle} rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-400`}
                />
                <Mail className="absolute right-3 top-2.5 w-4 h-4 text-zinc-600" />
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-end">
            <button className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${borderStyle}`}>
              Add System <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Check, 
  Plus, 
  ArrowRight, 
  Mail, 
  User, 
  MapPin, 
  Search,
  Monitor,
  Settings
} from 'lucide-react';

// Types for our data
interface SystemCardProps {
  id: string;
  version: string;
  type: 'in-scope' | 'available';
}

const ProjectScopeUI = () => {
  // Mock data matching the screenshot
  const inScopeSystems: SystemCardProps[] = [
    { id: 'P01', version: 'SAP ECC 6.0', type: 'in-scope' },
    { id: 'P02', version: 'SAP ECC 6.0', type: 'in-scope' },
    { id: 'P03', version: 'SAP ECC 6.0', type: 'in-scope' },
  ];

  const availableSystems: SystemCardProps[] = [
    { id: 'P04', version: 'SAP ECC 6.0', type: 'available' },
    { id: 'P05', version: 'SAP ECC 6.0', type: 'available' },
    { id: 'P06', version: 'SAP ECC 6.0', type: 'available' },
    { id: 'P07', version: 'SAP ECC 6.0', type: 'available' },
    { id: 'P08', version: 'SAP ECC 6.0', type: 'available' },
    { id: 'P09', version: 'SAP ECC 6.0', type: 'available' },
  ];

  return (
    <div className="min-h-screen bg-[#0f1012] text-gray-300 font-sans selection:bg-red-500/30">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-red-600 bg-[#0f1012]">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm border border-red-400">
            jivs
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm font-medium text-gray-300">Seeburg AG</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white font-medium border border-red-600">
            RK
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500 cursor-pointer" />
        </div>
      </header>

      {/* Project Header */}
      <div className="px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-[#1e293b] text-blue-400 px-3 py-2 rounded text-xs font-bold border border-red-600 flex flex-col items-center justify-center leading-tight">
              <span>NBH</span>
              <span className="text-[0.6rem] text-gray-500">NEW BUILD HISTORY</span>
            </div>
            <h1 className="text-2xl font-light text-white tracking-wide">S/4 Transformation Project</h1>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-xs font-medium border border-red-600 text-gray-400 hover:text-white hover:border-red-400 transition-colors uppercase tracking-wider">
              View Scope
            </button>
            <button className="px-4 py-2 text-xs font-medium border border-red-600 text-gray-400 hover:text-white hover:border-red-400 transition-colors uppercase tracking-wider">
              Collaborators
            </button>
          </div>
        </div>

        {/* Stepper Navigation */}
        <div className="flex items-center w-full border border-red-600 bg-[#131315] mb-10">
          {[ 
            { name: 'PROJECT SCOPE', active: true },
            { name: 'HISTORY ANALYSIS', active: false },
            { name: 'JIVS IMP DEPLOYMENT', active: false },
            { name: 'IMPLEMENTATION', active: false },
            { name: 'ACCEPTANCE TESTING', active: false },
            { name: 'FINALIZE PROJECT', active: false }
          ].map((step, idx) => (
            <div 
              key={idx} 
              className={`flex-1 flex items-center justify-center py-4 text-[10px] font-bold tracking-wider border-r border-red-600 last:border-r-0 ${step.active ? 'bg-[#1c1c1f] text-white' : 'text-gray-500'}`}
            >
              {step.active && <Check className="w-3 h-3 mr-2 text-white" />}
              {step.name}
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-12">
          
          {/* Left Column: Scope & Available Systems */}
          <div className="col-span-7">
            <h2 className="text-xl text-gray-300 mb-6 font-light">Project Scope</h2>

            {/* In Scope Section */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg text-gray-200 font-normal">In Scope</h3>
                <button className="flex items-center gap-2 px-3 py-1.5 text-xs border border-red-600 text-gray-400 hover:text-white uppercase tracking-wider">
                  <ArrowRight className="w-3 h-3 rotate-180" />
                  View Scope
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {inScopeSystems.map((sys) => (
                  <div key={sys.id} className="bg-[#18181b] p-4 border border-red-600 flex flex-col justify-between h-32">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">System ID:</div>
                      <div className="text-white font-medium">{sys.id}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 mb-2">Version:<br/><span className="text-gray-300">{sys.version}</span></div>
                      <button className="w-full py-1 text-[10px] font-bold bg-transparent border border-red-600 text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-colors uppercase">
                        Remove System
                      </button>
                    </div>
                  </div>
                ))}
                {/* Add Placeholder */}
                <div className="border border-dashed border-red-600 bg-[#18181b]/50 flex items-center justify-center h-32 cursor-pointer hover:bg-[#18181b] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center text-gray-400">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Available Systems Section */}
            <div>
              <h3 className="text-lg text-gray-200 font-normal mb-4">Available Systems</h3>
              <div className="grid grid-cols-3 gap-4">
                {availableSystems.map((sys) => (
                  <div key={sys.id} className="bg-[#18181b] p-4 border border-red-600 flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">System ID:</div>
                        <div className="text-white font-medium">{sys.id}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 mb-2">Version:<br/><span className="text-gray-300">{sys.version}</span></div>
                      <button className="w-full py-1 text-[10px] font-bold bg-blue-600/10 border border-red-600 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors uppercase">
                        Add System
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Add New Systems Form */}
          <div className="col-span-5 pl-4">
            <h2 className="text-xl text-gray-300 mb-6 font-light">Add New Systems</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* System ID */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-500">System ID</label>
                  <input 
                    type="text" 
                    defaultValue="P10" 
                    className="w-full bg-[#18181b] border border-red-600 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-400"
                  />
                </div>

                {/* Default IMP Content */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Default IMP Content</label>
                  <div className="relative">
                    <select className="w-full bg-[#18181b] border border-red-600 text-gray-400 px-3 py-2 text-sm appearance-none focus:outline-none focus:border-red-400">
                      <option>Select</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Type & Owner */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs text-blue-400">Type</label>
                  <div className="relative">
                    <select className="w-full bg-[#18181b] border border-red-600 text-white px-3 py-2 text-sm appearance-none focus:outline-none focus:border-red-400">
                      <option>SAP</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-500">SAP System Owner</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      placeholder="owner@mail.ch" 
                      className="w-full bg-[#18181b] border border-red-600 text-gray-400 px-3 py-2 pl-9 text-sm focus:outline-none focus:border-red-400"
                    />
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Version & Location */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Version</label>
                  <div className="relative">
                    <select className="w-full bg-[#18181b] border border-red-600 text-white px-3 py-2 text-sm appearance-none focus:outline-none focus:border-red-400">
                      <option>ECC 6.0</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Location</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      defaultValue="Kreuzlingen" 
                      className="w-full bg-[#18181b] border border-red-600 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-400"
                    />
                  </div>
                </div>
              </div>

              {/* Admin */}
              <div className="space-y-2">
                <label className="text-xs text-gray-500">SAP Base Admin</label>
                <div className="relative">
                  <input 
                    type="email" 
                    defaultValue="Admin@mail.ch" 
                    className="w-full bg-[#18181b] border border-red-600 text-white px-3 py-2 pl-9 text-sm focus:outline-none focus:border-red-400"
                  />
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-600" />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-12 flex justify-end">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-red-600 transition-colors">
                  Add System
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectScopeUI;
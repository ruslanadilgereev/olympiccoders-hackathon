import React, { useState } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Check, 
  Plus, 
  ArrowRight, 
  LayoutGrid, 
  Users, 
  X, 
  Monitor,
  Search
} from 'lucide-react';

const ProjectScopeDashboard = () => {
  const [activeTab, setActiveTab] = useState('PROJECT SCOPE');

  const steps = [
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

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-gray-300 font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#0b0b0d]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
            jivs
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
          <div className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <Monitor className="w-4 h-4" />
            <span>Seeburg AG</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
            RK
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </header>

      {/* Project Header */}
      <div className="px-8 py-8">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1e293b] rounded flex flex-col items-center justify-center text-blue-400 border border-blue-900/30">
              <span className="text-lg font-bold leading-none">NBH</span>
              <span className="text-[0.5rem] text-gray-500 uppercase">New Build History</span>
            </div>
            <h1 className="text-3xl font-light text-white">S/4 Transformation Project</h1>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded text-xs font-medium hover:bg-gray-800 transition-colors">
              <LayoutGrid className="w-3 h-3" />
              VIEW SCOPE
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded text-xs font-medium hover:bg-gray-800 transition-colors">
              <Users className="w-3 h-3" />
              COLLABORATORS
            </button>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="grid grid-cols-6 border border-gray-800 rounded-sm overflow-hidden mb-10">
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className={`
                relative flex items-center justify-center py-3 px-2 text-[0.65rem] font-bold tracking-wider uppercase cursor-pointer transition-colors
                ${step.status === 'active' ? 'bg-[#1c1c20] text-white' : 'bg-[#0e0e10] text-gray-500 hover:bg-[#161618]'}
                ${idx !== steps.length - 1 ? 'border-r border-gray-800' : ''}
              `}
            >
              {step.status === 'active' && <Check className="w-3 h-3 mr-2 text-white" />}
              {step.name}
              {step.status === 'active' && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600"></div>
              )}
            </div>
          ))}
        </div>

        <h2 className="text-xl text-gray-200 mb-6">Project Scope</h2>

        <div className="grid grid-cols-12 gap-12">
          {/* Left Column: Systems Lists */}
          <div className="col-span-7">
            {/* In Scope Section */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg text-gray-300 font-light">In Scope</h3>
                <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-700 rounded text-[0.65rem] text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
                  <LayoutGrid className="w-3 h-3" />
                  VIEW SCOPE
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {inScopeSystems.map((sys) => (
                  <div key={sys.id} className="bg-[#161618] p-4 rounded border border-gray-800 hover:border-gray-700 transition-colors group">
                    <div className="flex flex-col h-full justify-between gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">System ID:</div>
                        <div className="text-sm font-medium text-white">{sys.id}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Version:</div>
                        <div className="text-xs text-gray-300 mb-3">{sys.version}</div>
                        <button className="w-full py-1.5 border border-gray-700 rounded text-[0.6rem] font-bold tracking-wide text-gray-400 hover:text-red-400 hover:border-red-900/50 transition-colors uppercase">
                          Remove System
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add Placeholder */}
                <div className="border border-dashed border-gray-700 rounded flex items-center justify-center min-h-[140px] cursor-pointer hover:border-gray-500 hover:bg-gray-900/20 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Available Systems Section */}
            <div>
              <h3 className="text-lg text-gray-300 font-light mb-4">Available Systems</h3>
              <div className="grid grid-cols-3 gap-4">
                {availableSystems.map((sys) => (
                  <div key={sys.id} className="bg-[#161618] p-4 rounded border border-gray-800 hover:border-gray-700 transition-colors">
                    <div className="flex flex-col h-full justify-between gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">System ID:</div>
                        <div className="text-sm font-medium text-white">{sys.id}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Version:</div>
                        <div className="text-xs text-gray-300 mb-3">{sys.version}</div>
                        <button className="w-full py-1.5 bg-blue-600/10 border border-blue-600/30 rounded text-[0.6rem] font-bold tracking-wide text-blue-400 hover:bg-blue-600 hover:text-white transition-colors uppercase">
                          Add System
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Add New Systems Form */}
          <div className="col-span-5">
            <div className="bg-[#111113] rounded-lg p-1">
              <h3 className="text-lg text-gray-300 font-light mb-6">Add New Systems</h3>
              
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500">System ID</label>
                    <input 
                      type="text" 
                      defaultValue="P10" 
                      className="w-full bg-[#161618] border border-gray-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500">Default IMP Content</label>
                    <div className="relative">
                      <select className="w-full bg-[#161618] border border-gray-800 rounded px-3 py-2 text-sm text-gray-400 appearance-none focus:outline-none focus:border-blue-500">
                        <option>Select</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs text-blue-500">Type</label>
                    <div className="relative">
                      <select className="w-full bg-[#161618] border-b-2 border-blue-600 rounded-t px-3 py-2 text-sm text-white appearance-none focus:outline-none">
                        <option>SAP</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500">SAP System Owner</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        defaultValue="owner@mail.ch"
                        className="w-full bg-[#161618] border border-gray-800 rounded px-3 py-2 text-sm text-gray-400 focus:outline-none focus:border-blue-500 pl-8"
                      />
                      <div className="absolute left-3 top-2.5 w-4 h-4 text-gray-500">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500">Version</label>
                    <div className="relative">
                      <select className="w-full bg-[#161618] border border-gray-800 rounded px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:border-blue-500">
                        <option>ECC 6.0</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500">Location</label>
                    <input 
                      type="text" 
                      defaultValue="Kreuzlingen" 
                      className="w-full bg-[#161618] border border-gray-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">SAP Base Admin</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      defaultValue="Admin@mail.ch"
                      className="w-1/2 bg-[#161618] border border-gray-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 pl-8"
                    />
                    <div className="absolute left-3 top-2.5 w-4 h-4 text-gray-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                    </div>
                  </div>
                </div>

                <div className="pt-12 flex justify-end">
                  <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded text-xs font-bold tracking-wide transition-colors uppercase">
                    Add System
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectScopeDashboard;
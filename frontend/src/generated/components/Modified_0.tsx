import React from 'react';
import { 
  Bell, 
  ChevronDown, 
  Plus, 
  ArrowRight, 
  Mail, 
  Check, 
  LayoutGrid, 
  Users, 
  Search,
  Settings,
  Monitor
} from 'lucide-react';

// Reusable Input Component with Green Border
const InputGroup = ({ label, value, placeholder, icon: Icon }: { label: string, value?: string, placeholder?: string, icon?: any }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">{label}</label>
    <div className="relative">
      <input 
        type="text" 
        defaultValue={value}
        placeholder={placeholder}
        className="w-full bg-[#121217] border border-green-600 rounded-sm px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-green-500 placeholder-gray-600"
      />
      {Icon && <Icon className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />}
    </div>
  </div>
);

// Reusable Select Component with Green Border
const SelectGroup = ({ label, value, placeholder }: { label: string, value?: string, placeholder?: string }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">{label}</label>
    <div className="relative">
      <select 
        className="w-full bg-[#121217] border border-green-600 rounded-sm px-3 py-2.5 text-sm text-gray-200 appearance-none focus:outline-none focus:ring-1 focus:ring-green-500"
        defaultValue={value || ""}
      >
        {value ? <option>{value}</option> : <option value="" disabled selected>{placeholder}</option>}
        <option>Option 1</option>
        <option>Option 2</option>
      </select>
      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
    </div>
  </div>
);

// System Card Component
const SystemCard = ({ id, version, action, isAdd }: { id: string, version: string, action: string, isAdd?: boolean }) => (
  <div className="bg-[#121217] border border-green-600 p-4 rounded-sm flex flex-col gap-4 min-h-[130px]">
    <div className="flex flex-col">
      <span className="text-[10px] text-gray-500 uppercase">System ID</span>
      <span className="text-base font-medium text-white">{id}</span>
    </div>
    <div className="flex flex-col mb-2">
      <span className="text-[10px] text-gray-500 uppercase">Version</span>
      <span className="text-xs text-gray-300">{version}</span>
    </div>
    <button 
      className={`mt-auto w-full text-[10px] font-bold py-2 px-2 rounded-sm uppercase tracking-wider transition-colors border border-green-600
        ${isAdd 
          ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700' 
          : 'bg-transparent hover:bg-green-900/20 text-gray-300'}`}
    >
      {action}
    </button>
  </div>
);

export default function ProjectScopeUI() {
  const steps = [
    { name: 'PROJECT SCOPE', active: true },
    { name: 'HISTORY ANALYSIS', active: false },
    { name: 'JIVS IMP DEPLOYMENT', active: false },
    { name: 'IMPLEMENTATION', active: false },
    { name: 'ACCEPTANCE TESTING', active: false },
    { name: 'FINALIZE PROJECT', active: false },
  ];

  const inScopeSystems = ['P01', 'P02', 'P03'];
  const availableSystems = ['P04', 'P05', 'P06', 'P07', 'P08', 'P09'];

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-green-500/30">
      {/* Top Header */}
      <header className="flex items-center justify-between py-4 px-8 border-b border-green-600 bg-[#09090b]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center font-bold text-xs shadow-lg shadow-green-900/20">jivs</div>
        </div>
        <div className="flex items-center gap-6">
          <Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
          <div className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
            <Users className="w-4 h-4" />
            <span>Seeburg AG</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold border border-green-600">
            RK
          </div>
        </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto">
        {/* Project Title Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1e293b] border border-green-600 flex flex-col items-center justify-center rounded shadow-sm">
              <span className="text-blue-400 font-bold text-sm">NBH</span>
              <span className="text-[6px] text-gray-400 leading-none mt-0.5">NEW BUILD</span>
              <span className="text-[6px] text-gray-400 leading-none">HISTORY</span>
            </div>
            <h1 className="text-3xl font-light tracking-wide text-gray-100">S/4 Transformation Project</h1>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold tracking-wider border border-green-600 rounded-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
              <LayoutGrid className="w-3 h-3" /> VIEW SCOPE
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold tracking-wider border border-green-600 rounded-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
              COLLABORATORS
            </button>
          </div>
        </div>

        {/* Navigation Steps */}
        <div className="grid grid-cols-6 border border-green-600 rounded-sm overflow-hidden mb-12 bg-[#0f1014]">
          {steps.map((step, idx) => (
            <div 
              key={step.name} 
              className={`
                flex items-center justify-center py-4 px-2 text-[10px] font-bold tracking-wider cursor-pointer border-r border-green-600 last:border-r-0 transition-colors
                ${step.active ? 'bg-[#202025] text-white' : 'text-gray-500 hover:bg-[#18181b] hover:text-gray-300'}
              `}
            >
              {step.active && (
                <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center mr-2">
                  <Check className="w-2 h-2 text-black" />
                </div>
              )}
              {step.name}
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-light mb-8 text-gray-200">Project Scope</h2>

        <div className="grid grid-cols-12 gap-10">
          {/* Left Column: Systems Lists */}
          <div className="col-span-7 flex flex-col gap-10">
            
            {/* In Scope Section */}
            <div>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-light text-gray-200">In Scope</h3>
                <button className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold tracking-wider border border-green-600 rounded-sm text-gray-500 hover:text-white hover:bg-white/5">
                  <LayoutGrid className="w-3 h-3" /> VIEW SCOPE
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {inScopeSystems.map((id) => (
                  <SystemCard key={id} id={id} version="SAP ECC 6.0" action="REMOVE SYSTEM" />
                ))}
                <div className="border border-dashed border-green-600 rounded-sm bg-[#0f1014] flex items-center justify-center min-h-[130px] cursor-pointer hover:bg-[#18181b] transition-colors group">
                  <Plus className="w-6 h-6 text-gray-600 group-hover:text-gray-400" />
                </div>
              </div>
            </div>

            {/* Available Systems Section */}
            <div>
              <h3 className="text-xl font-light text-gray-200 mb-5">Available Systems</h3>
              <div className="grid grid-cols-3 gap-4">
                {availableSystems.map((id) => (
                  <SystemCard key={id} id={id} version="SAP ECC 6.0" action="ADD SYSTEM" isAdd />
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Add New Systems Form */}
          <div className="col-span-5">
            <h3 className="text-xl font-light text-gray-200 mb-5">Add New Systems</h3>
            
            <div className="bg-[#0f1014] border border-green-600 p-8 rounded-sm h-fit">
              <div className="grid grid-cols-2 gap-x-6 gap-y-6 mb-8">
                <InputGroup label="System ID" placeholder="P10" />
                <SelectGroup label="Default IMP Content" placeholder="Select" />
                
                <SelectGroup label="Type" value="SAP" />
                <InputGroup label="SAP System Owner" value="owner@mail.ch" icon={Mail} />
                
                <SelectGroup label="Version" value="ECC 6.0" />
                <InputGroup label="Location" value="Kreuzlingen" />
                
                <div className="col-span-2">
                  <InputGroup label="SAP Base Admin" value="Admin@mail.ch" icon={Mail} />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 px-8 rounded-sm flex items-center gap-2 transition-colors border border-green-600 shadow-lg shadow-blue-900/20">
                  ADD SYSTEM <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
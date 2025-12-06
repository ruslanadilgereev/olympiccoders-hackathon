import React from 'react';
import { 
  Bell, 
  ChevronDown, 
  Plus, 
  ArrowRight, 
  Check, 
  LayoutGrid, 
  Mail, 
  MapPin 
} from 'lucide-react';

const ProjectScopeUI = () => {
  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-blue-500/30 pb-20">
      {/* Top Navigation */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-red-800 bg-[#09090b]">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#d92828] rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-red-900/20">
            jivs
          </div>
        </div>
        <div className="flex items-center gap-8 text-gray-400 text-sm">
          <Bell className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
          <div className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
            <LayoutGrid className="w-5 h-5" />
            <span className="font-medium">Seeburg AG</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <div className="w-9 h-9 bg-[#7c3aed] rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-red-800 cursor-pointer">
            RK
          </div>
        </div>
      </header>

      <main className="px-8 py-10 max-w-[1800px] mx-auto">
        {/* Project Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <div className="bg-[#161b26] border border-red-800 px-4 py-2 rounded flex flex-col items-center justify-center min-w-[60px]">
              <div className="text-blue-500 font-bold text-xl leading-none tracking-tight">NBH</div>
              <div className="text-[8px] text-gray-400 uppercase tracking-wider mt-1">New Build History</div>
            </div>
            <h1 className="text-4xl font-light tracking-wide text-gray-100">
              S/4 Transformation Project
            </h1>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2 text-[10px] font-bold border border-red-800 text-gray-400 hover:text-white hover:border-gray-400 transition-all uppercase tracking-widest rounded-sm">
              View Scope
            </button>
            <button className="px-5 py-2 text-[10px] font-bold border border-red-800 text-gray-400 hover:text-white hover:border-gray-400 transition-all uppercase tracking-widest rounded-sm">
              Collaborators
            </button>
          </div>
        </div>

        {/* Workflow Tabs */}
        <div className="grid grid-cols-6 gap-1 mb-16">
          {[
            { name: 'Project Scope', active: true, icon: true },
            { name: 'History Analysis', active: false },
            { name: 'JIVS IMP Deployment', active: false },
            { name: 'Implementation', active: false },
            { name: 'Acceptance Testing', active: false },
            { name: 'Finalize Project', active: false },
          ].map((tab, idx) => (
            <div
              key={idx}
              className={`
                flex items-center justify-center gap-3 py-4 px-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer border border-red-800 transition-all rounded-sm
                ${tab.active ? 'bg-[#18181b] text-white' : 'bg-[#0c0c0e] text-gray-500 hover:text-gray-300 hover:bg-[#121215]'}
              `}
            >
              {tab.icon && (
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Check className="w-2.5 h-2.5 text-black stroke-[4]" />
                </div>
              )}
              {tab.name}
            </div>
          ))}
        </div>

        <h2 className="text-2xl text-gray-300 mb-8 font-light tracking-wide">Project Scope</h2>

        <div className="grid grid-cols-12 gap-12">
          {/* Left Column: Systems Lists */}
          <div className="col-span-12 xl:col-span-7 space-y-12">
            
            {/* In Scope Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl text-gray-200 font-light tracking-wide">In Scope</h3>
                <button className="flex items-center gap-2 text-[10px] font-bold border border-red-800 px-4 py-2 text-gray-400 uppercase tracking-widest hover:text-white hover:border-gray-500 transition-colors rounded-sm">
                  <ArrowRight className="w-3 h-3 rotate-180" /> View Scope
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <SystemCard id="P01" version="SAP ECC 6.0" type="remove" />
                <SystemCard id="P02" version="SAP ECC 6.0" type="remove" />
                <SystemCard id="P03" version="SAP ECC 6.0" type="remove" />
                
                {/* Add Placeholder */}
                <div className="border border-red-800 border-dashed rounded bg-[#0f0f12]/50 h-[110px] flex items-center justify-center cursor-pointer hover:bg-[#1a1a20] hover:border-red-600 transition-all group">
                  <div className="w-8 h-8 rounded-full bg-[#18181b] flex items-center justify-center group-hover:bg-[#27272a] transition-colors">
                    <Plus className="text-gray-400 w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Available Systems Section */}
            <div>
              <h3 className="text-xl text-gray-200 font-light mb-6 tracking-wide">Available Systems</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <SystemCard id="P04" version="SAP ECC 6.0" type="add" />
                <SystemCard id="P05" version="SAP ECC 6.0" type="add" />
                <SystemCard id="P06" version="SAP ECC 6.0" type="add" />
                <SystemCard id="P07" version="SAP ECC 6.0" type="add" />
                <SystemCard id="P08" version="SAP ECC 6.0" type="add" />
                <SystemCard id="P09" version="SAP ECC 6.0" type="add" />
              </div>
            </div>

          </div>

          {/* Right Column: Add New Systems Form */}
          <div className="col-span-12 xl:col-span-5">
            <div className="bg-[#121215] border border-red-800 p-8 rounded-sm h-full relative">
              <h3 className="text-xl text-gray-200 font-light mb-10 tracking-wide">Add New Systems</h3>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                <InputGroup label="System ID" value="P10" />
                <SelectGroup label="Default IMP Content" placeholder="Select" />
                
                <SelectGroup label="Type" value="SAP" />
                <InputGroup label="SAP System Owner" value="owner@mail.ch" icon={<Mail className="w-3.5 h-3.5" />} />
                
                <SelectGroup label="Version" value="ECC 6.0" />
                <InputGroup label="Location" value="Kreuzlingen" />
                
                <div className="col-span-2">
                   <InputGroup label="SAP Base Admin" value="Admin@mail.ch" icon={<Mail className="w-3.5 h-3.5" />} />
                </div>
              </div>

              <div className="mt-16 flex justify-end">
                <button className="bg-[#3b82f6] hover:bg-blue-600 text-white text-[10px] font-bold py-3 px-8 rounded-sm flex items-center gap-3 transition-all tracking-widest shadow-lg shadow-blue-900/20">
                  ADD SYSTEM <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              
              {/* Blue vertical line decoration on the right edge */}
              <div className="absolute -right-[1px] top-[20%] bottom-[20%] w-[2px] bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper Components

const SystemCard = ({ id, version, type }: { id: string, version: string, type: 'add' | 'remove' }) => (
  <div className="bg-[#121215] border border-red-800 p-5 rounded-sm flex flex-col justify-between h-[110px] group hover:bg-[#18181b] transition-colors relative overflow-hidden">
    <div className="flex justify-between items-start">
      <div>
        <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">System ID</div>
        <div className="text-base font-bold text-gray-200">{id}</div>
      </div>
      <div className="text-right">
        <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">Version</div>
        <div className="text-[10px] text-gray-400 font-medium">{version}</div>
      </div>
    </div>
    
    {type === 'remove' ? (
      <button className="mt-auto w-full py-1.5 bg-[#1a1a20] hover:bg-red-950/50 text-[9px] font-bold text-gray-400 hover:text-red-400 uppercase tracking-widest border border-transparent hover:border-red-800 transition-all rounded-sm">
        Remove System
      </button>
    ) : (
      <button className="mt-auto w-full py-1.5 bg-[#1e293b] hover:bg-blue-600 text-[9px] font-bold text-blue-400 hover:text-white uppercase tracking-widest border border-transparent hover:border-blue-500 transition-all rounded-sm">
        Add System
      </button>
    )}
  </div>
);

const InputGroup = ({ label, value, icon }: { label: string, value?: string, icon?: React.ReactNode }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest pl-1">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{icon}</div>}
      <input 
        type="text" 
        defaultValue={value} 
        className={`w-full bg-[#0c0c0e] border border-red-800 text-gray-300 text-xs font-medium px-4 py-3 rounded-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-gray-700 ${icon ? 'pl-9' : ''}`}
      />
    </div>
  </div>
);

const SelectGroup = ({ label, value, placeholder }: { label: string, value?: string, placeholder?: string }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest pl-1">{label}</label>
    <div className="relative">
      <select 
        className="w-full bg-[#0c0c0e] border border-red-800 text-gray-300 text-xs font-medium px-4 py-3 rounded-sm appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all cursor-pointer"
        defaultValue={value || ""}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {value && <option value={value}>{value}</option>}
        <option value="Option 2">Option 2</option>
        <option value="Option 3">Option 3</option>
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
    </div>
  </div>
);

export default ProjectScopeUI;
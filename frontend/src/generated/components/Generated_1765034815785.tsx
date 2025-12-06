import React, { useState } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Check, 
  Plus, 
  ArrowRight, 
  Search, 
  Settings, 
  MoreHorizontal, 
  X, 
  LayoutGrid, 
  Users, 
  Mail,
  Monitor,
  Globe
} from 'lucide-react';

// Reusable Components to keep code clean

const Button = ({ children, variant = 'primary', className = '', icon: Icon, ...props }: any) => {
  const baseStyle = "px-4 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white border border-transparent",
    outline: "bg-transparent border border-red-500 text-gray-300 hover:bg-white/5",
    ghost: "bg-transparent hover:bg-white/5 text-gray-300",
    danger: "bg-transparent border border-red-500 text-gray-300 hover:bg-red-500/10",
    secondary: "bg-[#2A2D36] hover:bg-[#353842] text-white border border-red-500"
  };

  return (
    <button className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`} {...props}>
      {children}
      {Icon && <Icon size={14} />}
    </button>
  );
};

const InputLabel = ({ label }: { label: string }) => (
  <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
);

const TextInput = ({ label, placeholder, icon: Icon, defaultValue }: any) => (
  <div className="w-full">
    <InputLabel label={label} />
    <div className="relative">
      <input 
        type="text" 
        defaultValue={defaultValue}
        className="w-full bg-[#0f1115] border border-red-500 rounded p-2.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500 placeholder-gray-600"
        placeholder={placeholder}
      />
      {Icon && <Icon className="absolute right-3 top-2.5 text-gray-500" size={16} />}
    </div>
  </div>
);

const SelectInput = ({ label, options, defaultValue }: any) => (
  <div className="w-full">
    <InputLabel label={label} />
    <div className="relative">
      <select 
        className="w-full bg-[#0f1115] border border-red-500 rounded p-2.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500 appearance-none"
        defaultValue={defaultValue}
      >
        {options.map((opt: string) => <option key={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-3 text-gray-500 pointer-events-none" size={14} />
    </div>
  </div>
);

const SystemCard = ({ id, version, type = 'available' }: { id: string, version: string, type?: 'scope' | 'available' }) => (
  <div className="bg-[#16181d] border border-red-500 rounded p-4 flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">System ID</div>
        <div className="text-white font-semibold text-lg">{id}</div>
      </div>
    </div>
    
    <div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Version</div>
      <div className="text-gray-300 text-sm">{version}</div>
    </div>

    <div className="mt-auto">
      {type === 'scope' ? (
        <button className="w-full py-2 text-[10px] font-bold uppercase tracking-wide border border-red-500 rounded text-gray-400 hover:bg-red-500/10 transition-colors">
          Remove System
        </button>
      ) : (
        <button className="w-full py-2 text-[10px] font-bold uppercase tracking-wide bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors">
          Add System
        </button>
      )}
    </div>
  </div>
);

const NavTab = ({ label, active = false, done = false }: any) => (
  <div className={`
    flex-1 py-3 px-4 text-xs font-medium uppercase tracking-wide border border-red-500 flex items-center justify-center gap-2 cursor-pointer transition-all
    ${active ? 'bg-[#1e2128] text-white border-b-blue-500' : 'bg-[#0f1115] text-gray-500 hover:bg-[#16181d]'}
  `}>
    {active && <div className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center"><Check size={10} strokeWidth={4} /></div>}
    {label}
  </div>
);

export default function ProjectScopeDashboard() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-gray-300 font-sans selection:bg-blue-500/30">
      {/* Top Navigation */}
      <nav className="h-16 border-b border-red-500 flex items-center justify-between px-6 bg-[#0f1115]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
            jivs
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <Bell size={18} className="text-gray-400 hover:text-white cursor-pointer" />
          <div className="flex items-center gap-2 text-sm font-medium text-gray-300 cursor-pointer">
            <Users size={16} />
            <span>Seeburg AG</span>
            <ChevronDown size={14} />
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold border border-red-500">
            RK
          </div>
          <ChevronDown size={14} className="text-gray-500" />
        </div>
      </nav>

      {/* Header Section */}
      <header className="py-8 px-8 border-b border-red-500 bg-[#0b0c10]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-[#1e293b] border border-red-500 rounded px-3 py-2 text-center">
              <div className="text-blue-400 font-bold text-xl leading-none">NBH</div>
              <div className="text-[8px] text-gray-500 uppercase mt-1">New Build History</div>
            </div>
            <h1 className="text-2xl font-light text-white tracking-wide">S/4 Transformation Project</h1>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="text-xs uppercase tracking-wider px-6">
              <ArrowRight size={14} className="rotate-180" /> View Scope
            </Button>
            <Button variant="outline" className="text-xs uppercase tracking-wider px-6">
              Collaborators
            </Button>
          </div>
        </div>
      </header>

      {/* Process Tabs */}
      <div className="flex w-full border-b border-red-500 overflow-x-auto">
        <NavTab label="Project Scope" active={true} />
        <NavTab label="History Analysis" />
        <NavTab label="JIVS IMP Deployment" />
        <NavTab label="Implementation" />
        <NavTab label="Acceptance Testing" />
        <NavTab label="Finalize Project" />
      </div>

      {/* Main Content Area */}
      <main className="p-8 grid grid-cols-1 xl:grid-cols-12 gap-12">
        
        {/* Left Column: Systems Lists */}
        <div className="xl:col-span-7 space-y-10">
          
          {/* In Scope Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-gray-200 font-light">Project Scope</h2>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-gray-300">In Scope</h3>
              <Button variant="outline" className="py-1 px-3 text-[10px]">
                <ArrowRight size={12} className="rotate-180" /> VIEW SCOPE
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SystemCard id="P01" version="SAP ECC 6.0" type="scope" />
              <SystemCard id="P02" version="SAP ECC 6.0" type="scope" />
              <SystemCard id="P03" version="SAP ECC 6.0" type="scope" />
              
              {/* Add Placeholder */}
              <div className="border border-dashed border-red-500 rounded bg-[#0f1115]/50 flex flex-col items-center justify-center gap-2 min-h-[160px] cursor-pointer hover:bg-[#0f1115] transition-colors group">
                <div className="w-8 h-8 rounded-full bg-[#1e2128] flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <Plus size={16} className="text-gray-400 group-hover:text-white" />
                </div>
              </div>
            </div>
          </section>

          {/* Available Systems Section */}
          <section>
            <h3 className="text-lg text-gray-300 mb-4">Available Systems</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SystemCard id="P04" version="SAP ECC 6.0" />
              <SystemCard id="P05" version="SAP ECC 6.0" />
              <SystemCard id="P06" version="SAP ECC 6.0" />
              <SystemCard id="P07" version="SAP ECC 6.0" />
              <SystemCard id="P08" version="SAP ECC 6.0" />
              <SystemCard id="P09" version="SAP ECC 6.0" />
            </div>
          </section>
        </div>

        {/* Right Column: Add New Systems Form */}
        <div className="xl:col-span-5">
          <div className="bg-[#16181d] border border-red-500 rounded p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl text-gray-200 font-light">Add New Systems</h2>
            </div>

            <form className="grid grid-cols-2 gap-x-6 gap-y-6">
              <TextInput 
                label="System ID" 
                placeholder="P10" 
                defaultValue="P10"
              />
              
              <SelectInput 
                label="Default IMP Content" 
                options={['Select', 'Content A', 'Content B']} 
                defaultValue="Select"
              />

              <SelectInput 
                label="Type" 
                options={['SAP', 'Oracle', 'Other']} 
                defaultValue="SAP"
              />

              <TextInput 
                label="SAP System Owner" 
                placeholder="owner@mail.ch" 
                icon={Mail}
                defaultValue="owner@mail.ch"
              />

              <SelectInput 
                label="Version" 
                options={['ECC 6.0', 'S/4HANA', 'R/3']} 
                defaultValue="ECC 6.0"
              />

              <TextInput 
                label="Location" 
                placeholder="Kreuzlingen" 
                defaultValue="Kreuzlingen"
              />

              <div className="col-span-2">
                <TextInput 
                  label="SAP Base Admin" 
                  placeholder="Admin@mail.ch" 
                  icon={Mail}
                  defaultValue="Admin@mail.ch"
                />
              </div>

              <div className="col-span-2 flex justify-end mt-8">
                <Button variant="primary" className="w-full sm:w-auto px-8 py-3 text-xs uppercase tracking-widest">
                  Add System <ArrowRight size={14} />
                </Button>
              </div>
            </form>
          </div>
        </div>

      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Check, 
  Plus, 
  ArrowRight, 
  User, 
  Settings, 
  Search, 
  LayoutGrid, 
  Mail,
  Monitor,
  Globe
} from 'lucide-react';

// Utility for the requested red borders
const RED_BORDER = "border border-red-600";
const RED_BORDER_DASHED = "border border-dashed border-red-600";

// Reusable Components

const Button = ({ children, variant = 'primary', className = "", icon: Icon, fullWidth = false }: any) => {
  const baseStyle = `px-4 py-2 text-[10px] font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all ${RED_BORDER}`;
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-transparent hover:bg-white/5 text-gray-300",
    outline: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
    ghost: "bg-transparent text-gray-400 hover:text-white"
  };
  
  return (
    <button className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${fullWidth ? 'w-full' : ''} ${className}`}>
      {children}
      {Icon && <Icon size={14} />}
    </button>
  );
};

const InputField = ({ label, placeholder, value, icon: Icon, type = "text" }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{label}</label>
    <div className="relative group">
      <input 
        type={type} 
        defaultValue={value}
        placeholder={placeholder}
        className={`w-full bg-[#0f0f11] ${RED_BORDER} text-xs text-gray-300 px-3 py-3 focus:outline-none focus:border-red-400 transition-colors placeholder:text-gray-600`}
      />
      {Icon && <Icon className="absolute right-3 top-3 text-gray-500" size={14} />}
    </div>
  </div>
);

const SelectField = ({ label, value, options = [] }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{label}</label>
    <div className="relative">
      <select 
        defaultValue={value}
        className={`w-full bg-[#0f0f11] ${RED_BORDER} text-xs text-gray-300 px-3 py-3 appearance-none focus:outline-none focus:border-red-400`}
      >
        <option disabled={!value}>{value || "Select"}</option>
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" size={14} />
    </div>
  </div>
);

const SystemCard = ({ id, version, type, onAction }: any) => (
  <div className={`bg-[#121214] ${RED_BORDER} p-4 flex flex-col gap-4 relative group hover:bg-[#18181b] transition-colors`}>
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-gray-500 uppercase font-semibold">System ID</span>
      <span className="text-sm font-bold text-gray-200">{id}</span>
    </div>
    
    <div className="flex flex-col gap-1 mb-2">
      <span className="text-[10px] text-gray-500 uppercase font-semibold">Version</span>
      <span className="text-xs text-gray-400">{version}</span>
    </div>

    <button 
      className={`mt-auto w-full py-2 text-[9px] font-bold uppercase tracking-widest ${RED_BORDER} transition-colors
        ${type === 'remove' 
          ? 'bg-transparent text-gray-400 hover:text-white hover:bg-red-900/20' 
          : 'bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white border-blue-900/30 hover:border-blue-500'
        }`}
    >
      {type === 'remove' ? 'Remove System' : 'Add System'}
    </button>
  </div>
);

const NavStep = ({ label, active, completed }: any) => (
  <div className={`flex-1 flex items-center justify-center py-4 px-2 ${RED_BORDER} ${active ? 'bg-[#18181b]' : 'bg-transparent'} cursor-pointer hover:bg-[#18181b]/50 transition-colors`}>
    <div className="flex items-center gap-2">
      {active || completed ? (
        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${active ? 'bg-white text-black' : 'bg-gray-700 text-gray-400'}`}>
          <Check size={10} strokeWidth={4} />
        </div>
      ) : null}
      <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-white' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  </div>
);

export default function ProjectScopeDashboard() {
  const steps = [
    { label: "Project Scope", active: true },
    { label: "History Analysis", active: false },
    { label: "JIVS IMP Deployment", active: false },
    { label: "Implementation", active: false },
    { label: "Acceptance Testing", active: false },
    { label: "Finalize Project", active: false },
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
    <div className="min-h-screen bg-[#050505] text-gray-300 font-sans selection:bg-red-500/30">
      {/* Top Navigation Bar */}
      <header className={`h-16 px-6 flex items-center justify-between bg-[#09090b] ${RED_BORDER}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
            jivs
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Bell className="text-gray-400 hover:text-white cursor-pointer" size={18} />
          <div className="flex items-center gap-2 text-sm font-medium text-gray-300 cursor-pointer hover:text-white">
            <LayoutGrid size={16} />
            <span>Seeburg AG</span>
            <ChevronDown size={14} />
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white border border-white/10">
            RK
          </div>
          <ChevronDown size={14} className="text-gray-500" />
        </div>
      </header>

      {/* Project Header */}
      <div className={`px-8 py-8 flex items-center justify-between bg-[#09090b] ${RED_BORDER} border-t-0`}>
        <div className="flex items-center gap-4">
          <div className="bg-[#1e293b] text-blue-400 px-3 py-3 text-xs font-bold rounded-sm border border-blue-900/50">
            NBH
          </div>
          <div>
            <h1 className="text-2xl font-light text-white tracking-wide">S/4 Transformation Project</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded border border-blue-900/50">NEW BUILD</span>
              <span className="text-[10px] text-gray-500 uppercase">History</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">View Scope</Button>
          <Button variant="outline">Collaborators</Button>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="flex w-full overflow-x-auto">
        {steps.map((step, idx) => (
          <NavStep key={idx} {...step} />
        ))}
      </div>

      {/* Main Content Area */}
      <main className="p-8 grid grid-cols-12 gap-8">
        
        {/* Left Column: Systems Management */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-10">
          
          {/* Project Scope Title */}
          <div>
            <h2 className="text-xl text-gray-200 font-light mb-8">Project Scope</h2>
            
            {/* In Scope Section */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg text-gray-300 font-light">In Scope</h3>
                <Button variant="outline" className="!py-1 !px-3 !text-[9px]">View Scope</Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {inScopeSystems.map((sys) => (
                  <SystemCard key={sys.id} {...sys} type="remove" />
                ))}
                {/* Add Placeholder */}
                <div className={`flex items-center justify-center min-h-[140px] bg-[#0f0f11] ${RED_BORDER_DASHED} cursor-pointer hover:bg-[#18181b] transition-colors group`}>
                  <div className="w-8 h-8 rounded-full bg-[#18181b] flex items-center justify-center group-hover:bg-[#27272a] transition-colors">
                    <Plus className="text-gray-400" size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* Available Systems Section */}
            <div>
              <h3 className="text-lg text-gray-300 font-light mb-6">Available Systems</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableSystems.map((sys) => (
                  <SystemCard key={sys.id} {...sys} type="add" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Add New Systems Form */}
        <div className={`col-span-12 lg:col-span-4 bg-[#0c0c0e] ${RED_BORDER} p-6 h-fit`}>
          <h3 className="text-lg text-gray-200 font-light mb-8">Add New Systems</h3>
          
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="System ID" value="P10" />
              <SelectField label="Default IMP Content" value="Select" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Type" value="SAP" />
              <InputField label="SAP System Owner" value="owner@mail.ch" icon={Mail} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Version" value="ECC 6.0" />
              <InputField label="Location" value="Kreuzlingen" />
            </div>

            <InputField label="SAP Base Admin" value="Admin@mail.ch" icon={Mail} />

            <div className="pt-8 flex justify-end">
              <Button variant="primary" className="!bg-blue-600 hover:!bg-blue-500 !border-blue-600" icon={ArrowRight}>
                Add System
              </Button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

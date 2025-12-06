import React from 'react';
import { Bell, ChevronDown, Plus, Check, Monitor, Users, ArrowRight, Mail, LayoutGrid } from 'lucide-react';

// Reusable components with forced green borders as requested

const Button = ({ children, className = "", variant = "primary", ...props }) => {
  const baseStyle = "px-4 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-2 border border-green-500 rounded-sm";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-transparent hover:bg-zinc-800 text-zinc-300",
    outline: "bg-transparent border-green-500 text-zinc-300 hover:bg-zinc-800",
    ghost: "bg-transparent border-transparent hover:border-green-500 text-zinc-400 hover:text-white",
    tab: "bg-zinc-900 text-zinc-400 hover:text-white uppercase tracking-wider text-[10px] py-3 px-6"
  };
  
  const finalClass = `${baseStyle} ${variants[variant] || variants.primary} ${className}`;
  
  return (
    <button className={finalClass} {...props}>
      {children}
    </button>
  );
};

const Input = ({ label, placeholder, value, icon: Icon, type = "text" }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-[10px] text-zinc-500 uppercase tracking-wide font-semibold">{label}</label>}
    <div className="relative group">
      <input 
        type={type}
        className="w-full bg-[#0a0a0c] border border-green-500 text-zinc-300 text-xs px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-green-500 placeholder-zinc-600 rounded-sm"
        placeholder={placeholder}
        defaultValue={value}
      />
      {Icon && <Icon className="absolute right-3 top-2.5 w-4 h-4 text-zinc-500" />}
    </div>
  </div>
);

const Select = ({ label, value, options = [] }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-[10px] text-zinc-500 uppercase tracking-wide font-semibold">{label}</label>}
    <div className="relative">
      <select className="w-full bg-[#0a0a0c] border border-green-500 text-zinc-300 text-xs px-3 py-2.5 appearance-none focus:outline-none focus:ring-1 focus:ring-green-500 rounded-sm">
        <option>{value}</option>
        {options.map(opt => <option key={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-3 w-3 h-3 text-zinc-500 pointer-events-none" />
    </div>
  </div>
);

const SystemCard = ({ id, version, actionLabel, actionType = "remove" }) => (
  <div className="bg-[#18181b] border border-green-500 p-3 flex flex-col gap-4 min-h-[110px] rounded-sm">
    <div className="flex justify-between items-start">
      <div>
        <div className="text-[10px] text-zinc-500 uppercase mb-0.5">System ID</div>
        <div className="text-sm font-bold text-white">{id}</div>
      </div>
    </div>
    
    <div className="flex flex-col gap-2">
      <div>
        <div className="text-[10px] text-zinc-500 uppercase mb-0.5">Version</div>
        <div className="text-xs text-zinc-300">{version}</div>
      </div>
      
      <button className={`w-full text-[9px] font-bold py-1.5 border border-green-500 uppercase tracking-wider transition-colors rounded-sm mt-1
        ${actionType === 'add' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-transparent text-zinc-400 hover:bg-zinc-800'}`}>
        {actionLabel}
      </button>
    </div>
  </div>
);

export default function ProjectScopeGreenBorders() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-green-500/30 pb-10">
      {/* Top Navigation */}
      <header className="h-14 border-b border-green-500 flex items-center justify-between px-6 bg-[#0a0a0c]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs border border-green-500 shadow-md">
            jivs
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <Bell className="w-5 h-5 text-zinc-400 hover:text-white cursor-pointer" />
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-300 cursor-pointer">
            <Monitor className="w-4 h-4" />
            <span>Seeburg AG</span>
            <ChevronDown className="w-3 h-3" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white font-medium border border-green-500">
              RK
            </div>
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          </div>
        </div>
      </header>

      {/* Project Header */}
      <div className="px-8 py-6 border-b border-green-500 bg-[#08080a]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#1e293b] flex flex-col items-center justify-center text-[8px] font-bold text-blue-200 border border-green-500 rounded-sm">
              <span className="text-xs text-white">NBH</span>
              <span className="scale-75">NEW BUILD</span>
            </div>
            <h1 className="text-2xl font-light text-white tracking-tight">S/4 Transformation Project</h1>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="text-[10px] px-4 h-8">
              <LayoutGrid className="w-3 h-3 mr-1" /> VIEW SCOPE
            </Button>
            <Button variant="outline" className="text-[10px] px-4 h-8">
              COLLABORATORS
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 pt-6 pb-0 border-b border-green-500 bg-[#08080a]">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button className="flex items-center gap-2 px-6 py-3 bg-[#1c1c20] text-white text-[10px] font-bold uppercase tracking-wider border border-green-500 border-b-0 relative top-[1px] rounded-t-sm min-w-max">
            <div className="w-3 h-3 rounded-full bg-white flex items-center justify-center">
              <Check className="w-2 h-2 text-black" />
            </div>
            Project Scope
          </button>
          {['History Analysis', 'JIVS IMP Deployment', 'Implementation', 'Acceptance Testing', 'Finalize Project'].map((tab) => (
            <button key={tab} className="px-6 py-3 bg-transparent text-zinc-500 hover:text-zinc-300 text-[10px] font-bold uppercase tracking-wider border border-green-500 border-b-0 opacity-60 hover:opacity-100 rounded-t-sm min-w-max">
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-10">
          
          {/* In Scope Section */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-light text-white">In Scope</h2>
              <Button variant="outline" className="h-7 text-[10px] px-3">
                <ArrowRight className="w-3 h-3 mr-1 rotate-180" /> VIEW SCOPE
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              <SystemCard id="P01" version="SAP ECC 6.0" actionLabel="REMOVE SYSTEM" />
              <SystemCard id="P02" version="SAP ECC 6.0" actionLabel="REMOVE SYSTEM" />
              <SystemCard id="P03" version="SAP ECC 6.0" actionLabel="REMOVE SYSTEM" />
              
              {/* Add Placeholder */}
              <button className="border border-dashed border-green-500 bg-transparent flex items-center justify-center min-h-[110px] hover:bg-zinc-900 transition-colors group rounded-sm">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 border border-green-500">
                  <Plus className="w-4 h-4 text-zinc-400" />
                </div>
              </button>
            </div>
          </div>

          {/* Available Systems Section */}
          <div>
            <h2 className="text-xl font-light text-white mb-5">Available Systems</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {['P04', 'P05', 'P06', 'P07', 'P08', 'P09'].map((id) => (
                <SystemCard key={id} id={id} version="SAP ECC 6.0" actionLabel="ADD SYSTEM" actionType="add" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Add New Systems Form */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-[#0e0e10] border border-green-500 p-8 h-full relative rounded-sm">
            <h2 className="text-xl font-light text-white mb-8">Add New Systems</h2>
            
            <div className="grid grid-cols-2 gap-x-5 gap-y-7">
              <Input label="System ID" value="P10" />
              <Select label="Default IMP Content" value="Select" />
              
              <Select label="Type" value="SAP" />
              <Input label="SAP System Owner" value="owner@mail.ch" icon={Mail} />
              
              <Select label="Version" value="ECC 6.0" />
              <Input label="Location" value="Kreuzlingen" />
              
              <div className="col-span-2">
                <Input label="SAP Base Admin" value="Admin@mail.ch" icon={Mail} />
              </div>
            </div>

            <div className="mt-12 flex justify-end">
              <Button variant="primary" className="px-8 py-3 text-xs bg-blue-600 hover:bg-blue-500 border border-green-500 font-bold tracking-wide">
                ADD SYSTEM <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            
            {/* Decorative line on the right edge similar to screenshot */}
            <div className="absolute -right-[1px] top-1/4 h-1/2 w-[2px] bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.8)] hidden md:block"></div>
          </div>
        </div>

      </div>
    </div>
  );
}

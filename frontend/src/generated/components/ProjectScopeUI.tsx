import React from 'react';
import { 
  Bell, 
  ChevronDown, 
  Plus, 
  ArrowRight, 
  Mail, 
  Users, 
  LayoutGrid, 
  Monitor,
  CheckCircle2
} from 'lucide-react';

// Reusable Components with Green Borders as requested
const Button = ({ 
  children, 
  variant = "primary", 
  className = "", 
  icon: Icon = null, 
  fullWidth = false 
}) => {
  const baseStyle = "flex items-center justify-center px-4 py-2 text-[10px] sm:text-xs font-bold tracking-wider transition-colors border border-green-600 rounded-sm uppercase";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white border-green-600",
    secondary: "bg-transparent hover:bg-white/5 text-gray-300 border-green-600",
    outline: "bg-transparent text-gray-400 border-green-600 hover:bg-white/5",
    danger: "bg-[#1a1a1d] hover:bg-red-900/20 text-gray-300 border-green-600",
    action: "bg-[#1a1a2e] hover:bg-blue-900/30 text-blue-400 border-green-600",
    ghost: "bg-transparent border-transparent hover:bg-white/5 text-gray-400"
  };
  
  return (
    <button className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}>
      {children}
      {Icon && <Icon className="ml-2 w-3 h-3" />}
    </button>
  );
};

const Input = ({ label, placeholder, value, icon: Icon, type = "text" }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />}
      <input 
        type={type} 
        className={`w-full bg-[#0b0b0d] border border-green-600 text-gray-300 text-xs px-3 py-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-green-500 placeholder-gray-600 ${Icon ? 'pl-9' : ''}`}
        placeholder={placeholder}
        defaultValue={value}
      />
    </div>
  </div>
);

const Select = ({ label, value, options = [] }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</label>
    <div className="relative">
      <select className="w-full bg-[#0b0b0d] border border-green-600 text-gray-300 text-xs px-3 py-3 rounded-sm appearance-none focus:outline-none focus:ring-1 focus:ring-green-500">
        <option>{value}</option>
        {options.map(opt => <option key={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
    </div>
  </div>
);

const SystemCard = ({ id, version, type = "available" }) => (
  <div className="bg-[#121214] border border-green-600 p-4 rounded-sm flex flex-col gap-4 min-w-[140px]">
    <div className="flex flex-col">
      <span className="text-[10px] text-gray-500 mb-1">System ID</span>
      <span className="text-lg font-bold text-gray-200">{id}</span>
    </div>
    
    <div className="flex flex-col">
      <span className="text-[10px] text-gray-500 mb-1">Version</span>
      <span className="text-xs text-gray-400">{version}</span>
    </div>

    <div className="mt-2">
      {type === 'in-scope' ? (
        <button className="w-full py-1.5 bg-[#1a1a1d] border border-green-600 text-[9px] font-bold text-gray-300 hover:bg-red-900/20 uppercase tracking-wider">
          Remove System
        </button>
      ) : (
        <button className="w-full py-1.5 bg-[#1a1a2e] border border-green-600 text-[9px] font-bold text-blue-400 hover:bg-blue-900/20 uppercase tracking-wider">
          Add System
        </button>
      )}
    </div>
  </div>
);

const NavTab = ({ label, active, last = false }) => (
  <div className={`flex-1 flex items-center justify-center py-3 px-2 text-[10px] font-bold tracking-wider cursor-pointer border-r border-green-600 ${last ? 'border-r-0' : ''} ${active ? 'bg-[#27272a] text-white' : 'bg-[#0f0f11] text-gray-500 hover:bg-[#1a1a1d]'}`}>
    {active && <CheckCircle2 className="w-3 h-3 mr-2 text-white" />}
    {label}
  </div>
);

export default function ProjectScopeUI() {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-sans selection:bg-green-500/30">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-green-600 bg-[#0a0a0c] flex items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
            jivs
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <Bell className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
          <div className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <LayoutGrid className="w-4 h-4" />
            <span>Seeburg AG</span>
            <ChevronDown className="w-3 h-3" />
          </div>
          <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-[10px] text-white font-bold">
            RK
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="p-8 max-w-[1600px] mx-auto">
        
        {/* Project Header */}
        <div className="flex justify-between items-start mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1c2436] border border-green-600 flex flex-col items-center justify-center rounded-sm">
              <span className="text-blue-400 font-bold text-sm">NBH</span>
              <span className="text-[8px] text-blue-300/50 uppercase">New Build History</span>
            </div>
            <h1 className="text-2xl font-light text-gray-200">S/4 Transformation Project</h1>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline">VIEW SCOPE</Button>
            <Button variant="outline">COLLABORATORS</Button>
          </div>
        </div>

        {/* Process Navigation Tabs */}
        <div className="flex border border-green-600 rounded-sm overflow-hidden mb-12">
          <NavTab label="PROJECT SCOPE" active={true} />
          <NavTab label="HISTORY ANALYSIS" />
          <NavTab label="JIVS IMP DEPLOYMENT" />
          <NavTab label="IMPLEMENTATION" />
          <NavTab label="ACCEPTANCE TESTING" />
          <NavTab label="FINALIZE PROJECT" last={true} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Scope & Available Systems */}
          <div className="lg:col-span-7 flex flex-col gap-10">
            
            {/* In Scope Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-light text-gray-200">Project Scope</h2>
              </div>
              
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm text-gray-300">In Scope</h3>
                  <Button variant="outline" className="py-1 px-3 text-[10px]">VIEW SCOPE</Button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <SystemCard id="P01" version="SAP ECC 6.0" type="in-scope" />
                  <SystemCard id="P02" version="SAP ECC 6.0" type="in-scope" />
                  <SystemCard id="P03" version="SAP ECC 6.0" type="in-scope" />
                  
                  {/* Add Placeholder */}
                  <div className="border border-dashed border-green-600/50 bg-[#0f0f11] rounded-sm flex items-center justify-center min-h-[140px] cursor-pointer hover:bg-[#1a1a1d] transition-colors">
                    <Plus className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Available Systems Section */}
            <div>
              <h3 className="text-sm text-gray-300 mb-4">Available Systems</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <SystemCard id="P04" version="SAP ECC 6.0" />
                <SystemCard id="P05" version="SAP ECC 6.0" />
                <SystemCard id="P06" version="SAP ECC 6.0" />
                <SystemCard id="P07" version="SAP ECC 6.0" />
                <SystemCard id="P08" version="SAP ECC 6.0" />
                <SystemCard id="P09" version="SAP ECC 6.0" />
              </div>
            </div>
          </div>

          {/* Right Column: Add New Systems Form */}
          <div className="lg:col-span-5">
            <div className="bg-[#0a0a0c] p-1 rounded-sm h-full">
              <h2 className="text-lg font-light text-gray-200 mb-8">Add New Systems</h2>
              
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-6">
                  <Input label="System ID" value="P10" />
                  <Select label="Default IMP Content" value="Select" options={["Standard", "Custom"]} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Select label="Type" value="SAP" options={["SAP", "Oracle", "Other"]} />
                  <Input label="SAP System Owner" value="owner@mail.ch" icon={Mail} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Select label="Version" value="ECC 6.0" options={["ECC 6.0", "S/4HANA"]} />
                  <Input label="Location" value="Kreuzlingen" />
                </div>

                <div className="w-1/2 pr-3">
                  <Input label="SAP Base Admin" value="Admin@mail.ch" icon={Mail} />
                </div>

                <div className="mt-12 flex justify-end">
                  <Button variant="primary" className="px-8 py-3" icon={ArrowRight}>
                    ADD SYSTEM
                  </Button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

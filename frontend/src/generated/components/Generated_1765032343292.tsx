import React, { useState } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Search, 
  LayoutGrid, 
  Settings, 
  User, 
  Monitor,
  X
} from 'lucide-react';

// --- Reusable Components ---

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  fullWidth = false,
  icon: Icon,
  ...props 
}: any) => {
  const baseStyles = "inline-flex items-center justify-center rounded text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500 disabled:pointer-events-none disabled:opacity-50 h-8 px-4 py-2";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm border border-green-500",
    outline: "border border-green-500 bg-transparent hover:bg-white/5 text-gray-300",
    ghost: "hover:bg-white/5 text-gray-400 hover:text-white",
    destructive: "bg-transparent border border-green-500 text-red-400 hover:bg-red-900/20",
    secondary: "bg-[#1e293b] text-white border border-green-500 hover:bg-[#283547]"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant as keyof typeof variants]} ${fullWidth ? 'w-full' : ''} ${className}`} 
      {...props}
    >
      {children}
      {Icon && <Icon className="ml-2 h-3 w-3" />}
    </button>
  );
};

const Input = ({ label, placeholder, defaultValue, type = "text" }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{label}</label>
    <div className="relative">
      <input 
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="flex h-9 w-full rounded border border-green-500 bg-[#0B0C10] px-3 py-1 text-sm text-gray-200 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  </div>
);

const Select = ({ label, options, defaultValue }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{label}</label>
    <div className="relative">
      <select 
        className="flex h-9 w-full appearance-none rounded border border-green-500 bg-[#0B0C10] px-3 py-1 text-sm text-gray-200 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500"
        defaultValue={defaultValue}
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
    </div>
  </div>
);

const SystemCard = ({ id, version, type = 'available' }: { id: string, version: string, type?: 'in-scope' | 'available' }) => (
  <div className="bg-[#16181d] border border-green-500 rounded p-4 flex flex-col justify-between gap-4 min-h-[100px]">
    <div className="flex justify-between items-start">
      <div>
        <div className="text-[10px] text-gray-500 uppercase">System ID</div>
        <div className="text-sm font-bold text-white">{id}</div>
      </div>
      <div className="text-right">
        <div className="text-[10px] text-gray-500 uppercase">Version</div>
        <div className="text-xs text-gray-300">{version}</div>
      </div>
    </div>
    
    {type === 'in-scope' ? (
      <button className="w-full py-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400 bg-[#1f222a] border border-green-500 hover:bg-red-900/20 hover:text-red-400 hover:border-red-500 transition-all rounded">
        Remove System
      </button>
    ) : (
      <button className="w-full py-1.5 text-[10px] font-bold uppercase tracking-wide text-white bg-blue-600 hover:bg-blue-700 border border-green-500 transition-all rounded">
        Add System
      </button>
    )}
  </div>
);

// --- Main Dashboard Component ---

export default function ProjectScopeDashboard() {
  const [activeTab, setActiveTab] = useState('PROJECT SCOPE');

  const tabs = [
    "PROJECT SCOPE",
    "HISTORY ANALYSIS",
    "JIVS IMP DEPLOYMENT",
    "IMPLEMENTATION",
    "ACCEPTANCE TESTING",
    "FINALIZE PROJECT"
  ];

  return (
    <div className="min-h-screen bg-[#090a0c] text-slate-200 font-sans selection:bg-green-500/30 overflow-x-hidden">
      
      {/* Top Navigation */}
      <nav className="flex items-center justify-between px-6 py-3 border-b border-green-500 bg-[#0f1115]">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs border border-green-500">
            jivs
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <Bell className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
          <div className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <LayoutGrid className="h-4 w-4" />
            <span>Seeburg AG</span>
            <ChevronDown className="h-3 w-3" />
          </div>
          <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-medium border border-green-500">
            RK
          </div>
        </div>
      </nav>

      <div className="p-6 max-w-[1800px] mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-[#1e2330] border border-green-500 rounded flex flex-col items-center justify-center text-[8px] font-bold text-blue-400 leading-tight">
              <span>NBH</span>
              <span className="text-[6px] text-gray-500">NEW BUILD</span>
              <span className="text-[6px] text-gray-500">HISTORY</span>
            </div>
            <h1 className="text-2xl font-light text-white tracking-wide">S/4 Transformation Project</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-[10px] tracking-wider">
              <Monitor className="mr-2 h-3 w-3" />
              VIEW SCOPE
            </Button>
            <Button variant="outline" className="text-[10px] tracking-wider">
              COLLABORATORS
            </Button>
          </div>
        </header>

        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto border border-green-500 rounded-md bg-[#13151a] mb-8 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                flex-1 min-w-[140px] py-3 text-[10px] font-bold tracking-wider uppercase border-r border-green-500 last:border-r-0 transition-colors
                ${activeTab === tab 
                  ? 'bg-[#252836] text-white border-b-2 border-b-blue-500' 
                  : 'text-gray-500 hover:bg-[#1c1f26] hover:text-gray-300'}
              `}
            >
              <div className="flex items-center justify-center gap-2">
                {activeTab === tab && <CheckCircle2 className="h-3 w-3 text-white" />}
                {tab}
              </div>
            </button>
          ))}
        </div>

        <h2 className="text-xl text-gray-300 mb-6 font-light">Project Scope</h2>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left Column: Systems Lists */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* In Scope Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg text-gray-200 font-normal">In Scope</h3>
                <Button variant="outline" className="h-7 text-[10px]">
                  <ArrowRight className="mr-2 h-3 w-3 rotate-180" />
                  VIEW SCOPE
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <SystemCard id="P01" version="SAP ECC 6.0" type="in-scope" />
                <SystemCard id="P02" version="SAP ECC 6.0" type="in-scope" />
                <SystemCard id="P03" version="SAP ECC 6.0" type="in-scope" />
                
                {/* Add Placeholder */}
                <button className="border border-dashed border-green-500 rounded bg-[#0f1115] flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-white hover:border-gray-400 transition-colors min-h-[100px]">
                  <div className="h-6 w-6 rounded-full bg-[#1e2330] flex items-center justify-center">
                    <Plus className="h-4 w-4" />
                  </div>
                </button>
              </div>
            </section>

            {/* Available Systems Section */}
            <section>
              <h3 className="text-lg text-gray-200 font-normal mb-4">Available Systems</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <SystemCard id="P04" version="SAP ECC 6.0" type="available" />
                <SystemCard id="P05" version="SAP ECC 6.0" type="available" />
                <SystemCard id="P06" version="SAP ECC 6.0" type="available" />
                <SystemCard id="P07" version="SAP ECC 6.0" type="available" />
                <SystemCard id="P08" version="SAP ECC 6.0" type="available" />
                <SystemCard id="P09" version="SAP ECC 6.0" type="available" />
              </div>
            </section>
          </div>

          {/* Right Column: Add New Systems Form */}
          <div className="xl:col-span-4">
            <div className="bg-[#13151a] border border-green-500 rounded p-6 h-full">
              <h3 className="text-lg text-gray-200 font-normal mb-6">Add New Systems</h3>
              
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="System ID" defaultValue="P10" />
                  <Select label="Default IMP Content" options={['Select', 'Standard', 'Custom']} defaultValue="Select" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select label="Type" options={['SAP', 'Oracle', 'SQL']} defaultValue="SAP" />
                  <Input label="SAP System Owner" placeholder="owner@mail.ch" type="email" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select label="Version" options={['ECC 6.0', 'S/4HANA 2021']} defaultValue="ECC 6.0" />
                  <Input label="Location" defaultValue="Kreuzlingen" />
                </div>

                <div className="w-1/2 pr-2">
                   <Input label="SAP Base Admin" defaultValue="Admin@mail.ch" />
                </div>
              </div>

              <div className="mt-12 flex justify-end">
                <Button variant="primary" className="px-8 py-2 h-10 text-xs font-bold tracking-wider">
                  ADD SYSTEM
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

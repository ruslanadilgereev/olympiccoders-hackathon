import React from 'react';
import { 
  Bell, 
  ChevronDown, 
  Plus, 
  ArrowRight, 
  Mail, 
  Check
} from 'lucide-react';

export default function ProjectScopeUI() {
  return (
    <div className="min-h-screen bg-[#08090b] text-white font-sans p-4 md:p-8">
      {/* Top Navigation Bar */}
      <header className="flex justify-between items-center mb-8 border-b border-green-600/30 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center font-bold text-xs shadow-[0_0_10px_rgba(220,38,38,0.5)]">
            jivs
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <Bell className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
          <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
            <span className="font-medium">Seeburg AG</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs border border-green-600 shadow-sm">
            RK
          </div>
        </div>
      </header>

      {/* Project Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-[#0f172a] rounded-md flex flex-col items-center justify-center text-white border border-green-600 shadow-lg">
            <span className="text-sm font-bold tracking-wider">NBH</span>
            <span className="text-[6px] uppercase opacity-70 leading-tight text-center">New Build\nHistory</span>
          </div>
          <div>
            <h1 className="text-3xl font-light text-white tracking-tight">S/4 Transformation Project</h1>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2 text-[10px] font-bold border border-green-600 text-gray-400 rounded hover:bg-green-900/10 transition-all uppercase tracking-widest">
            View Scope
          </button>
          <button className="px-5 py-2 text-[10px] font-bold border border-green-600 text-gray-400 rounded hover:bg-green-900/10 transition-all uppercase tracking-widest">
            Collaborators
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-green-600/30 mb-10 overflow-x-auto no-scrollbar">
        {[
          { name: 'Project Scope', active: true },
          { name: 'History Analysis', active: false },
          { name: 'JIVS IMP Deployment', active: false },
          { name: 'Implementation', active: false },
          { name: 'Acceptance Testing', active: false },
          { name: 'Finalize Project', active: false },
        ].map((tab) => (
          <div 
            key={tab.name}
            className={`
              flex items-center px-8 py-4 text-[10px] font-bold uppercase tracking-widest cursor-pointer border-r border-green-600/30 first:border-l whitespace-nowrap transition-all
              ${tab.active 
                ? 'bg-[#15151a] text-white border-t-2 border-t-white relative after:content-[""] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-gradient-to-b after:from-white/5 after:to-transparent' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-[#15151a]/50'}
            `}
          >
            {tab.active && <div className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center mr-2"><Check className="w-3 h-3" /></div>}
            {tab.name}
          </div>
        ))}
      </div>

      {/* Page Title */}
      <h2 className="text-2xl font-light text-gray-400 mb-8">Project Scope</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Scope Management */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* In Scope Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-light text-white">In Scope</h3>
              <button className="px-4 py-1.5 text-[10px] border border-green-600 text-gray-500 rounded uppercase tracking-widest hover:bg-green-900/10 transition-colors">
                View Scope
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {['P01', 'P02', 'P03'].map((id) => (
                <SystemCard 
                  key={id} 
                  id={id} 
                  version="SAP ECC 6.0" 
                  type="in-scope" 
                />
              ))}
              {/* Add Placeholder Card */}
              <div className="bg-[#0f1014] border border-dashed border-green-600/40 rounded-lg p-4 flex items-center justify-center min-h-[140px] cursor-pointer hover:bg-[#15151a] hover:border-green-500 transition-all group">
                <div className="w-10 h-10 rounded-full bg-[#1a1b21] flex items-center justify-center group-hover:bg-[#25262e] transition-colors">
                  <Plus className="w-5 h-5 text-gray-500 group-hover:text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Available Systems Section */}
          <div>
            <h3 className="text-xl font-light text-gray-400 mb-6">Available Systems</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {['P04', 'P05', 'P06', 'P07', 'P08', 'P09'].map((id) => (
                <SystemCard 
                  key={id} 
                  id={id} 
                  version="SAP ECC 6.0" 
                  type="available" 
                />
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Add New Systems Form */}
        <div className="lg:col-span-1">
          <div className="bg-[#101116] border border-green-600 rounded-lg p-8 h-full relative shadow-2xl">
            <h3 className="text-xl font-light text-gray-200 mb-8">Add New Systems</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-5">
                <InputGroup label="System ID" placeholder="P10" />
                <SelectGroup label="Default IMP Content" placeholder="Select" />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <SelectGroup label="Type" value="SAP" />
                <InputGroup label="SAP System Owner" value="owner@mail.ch" icon={<Mail className="w-3 h-3" />} />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <SelectGroup label="Version" value="ECC 6.0" />
                <InputGroup label="Location" value="Kreuzlingen" />
              </div>

              <div className="grid grid-cols-1">
                <InputGroup label="SAP Base Admin" value="Admin@mail.ch" icon={<Mail className="w-3 h-3" />} />
              </div>
            </div>

            <div className="mt-16 flex justify-end">
              <button className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold py-3 px-6 rounded flex items-center gap-3 border border-green-600 transition-all shadow-lg hover:shadow-blue-900/20 tracking-widest uppercase">
                Add System <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Reusable Sub-Components ---

function SystemCard({ id, version, type }: { id: string, version: string, type: 'in-scope' | 'available' }) {
  const isInScope = type === 'in-scope';
  
  return (
    <div className="bg-[#15151a] border border-green-600 rounded-lg p-5 flex flex-col justify-between min-h-[140px] shadow-md hover:shadow-green-900/10 transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">System ID</div>
          <div className="text-lg font-bold text-white tracking-wide">{id}</div>
        </div>
      </div>
      
      <div className="mb-5">
        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Version</div>
        <div className="text-xs text-gray-300 font-medium">{version}</div>
      </div>

      {isInScope ? (
        <button className="w-full py-2 text-[9px] font-bold uppercase tracking-widest border border-green-600 text-gray-300 rounded hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 transition-all">
          Remove System
        </button>
      ) : (
        <button className="w-full py-2 text-[9px] font-bold uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white rounded border border-green-600 transition-all shadow-sm">
          Add System
        </button>
      )}
    </div>
  );
}

function InputGroup({ label, placeholder, value, icon }: { label: string, placeholder?: string, value?: string, icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[9px] text-gray-500 uppercase tracking-widest font-medium">{label}</label>
      <div className="relative group">
        <input 
          type="text" 
          className="w-full bg-[#0b0c0e] border border-green-600 rounded px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all"
          placeholder={placeholder}
          defaultValue={value}
        />
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

function SelectGroup({ label, placeholder, value }: { label: string, placeholder?: string, value?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[9px] text-gray-500 uppercase tracking-widest font-medium">{label}</label>
      <div className="relative">
        <div className="w-full bg-[#0b0c0e] border border-green-600 rounded px-3 py-2.5 text-xs text-white flex justify-between items-center cursor-pointer hover:bg-[#15161a] hover:border-green-500 transition-all group">
          <span className={value ? "text-white" : "text-gray-600 italic"}>{value || placeholder}</span>
          <ChevronDown className="w-3 h-3 text-gray-500 group-hover:text-green-500 transition-colors" />
        </div>
      </div>
    </div>
  );
}

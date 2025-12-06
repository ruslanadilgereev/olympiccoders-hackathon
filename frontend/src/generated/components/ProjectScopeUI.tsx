import React, { useState } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Check, 
  Plus, 
  ArrowRight, 
  Mail, 
  User, 
  Settings, 
  Search,
  LayoutGrid,
  Monitor
} from 'lucide-react';

// Reusable Components
const Button = ({ children, variant = 'primary', className = '', icon: Icon, ...props }) => {
  const baseStyle = "flex items-center justify-center px-4 py-2 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#0b0c10]";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white border border-green-600",
    secondary: "bg-transparent border border-green-600 text-gray-300 hover:bg-white/5",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
    danger: "bg-transparent border border-green-600 text-red-400 hover:bg-red-900/20",
    input: "bg-[#1c1d24] border border-green-600 text-gray-200 w-full text-left flex justify-between items-center"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
      {Icon && <Icon className="ml-2 w-4 h-4" />}
    </button>
  );
};

const InputField = ({ label, placeholder, defaultValue, type = "text", icon: Icon }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</label>
    <div className="relative">
      <input 
        type={type} 
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full bg-[#1c1d24] border border-green-600 rounded p-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 placeholder-gray-600"
      />
      {Icon && <Icon className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />}
    </div>
  </div>
);

const SelectField = ({ label, value, options = [] }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</label>
    <div className="relative">
      <select 
        className="w-full bg-[#1c1d24] border border-green-600 rounded p-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
        defaultValue={value}
      >
        {options.map(opt => <option key={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
    </div>
  </div>
);

const SystemCard = ({ id, version, type, onAction }) => {
  const isAdd = type === 'add';
  const isInScope = type === 'in-scope';
  
  if (type === 'placeholder') {
    return (
      <div className="flex items-center justify-center h-[100px] border-2 border-dashed border-green-600 rounded bg-[#1c1d24]/50 hover:bg-[#1c1d24] cursor-pointer transition-colors group">
        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-gray-700">
          <Plus className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1c1d24] border border-green-600 rounded p-4 flex flex-col justify-between h-[100px] relative group hover:border-blue-500/50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs text-gray-500 mb-1">System ID</div>
          <div className="text-lg font-bold text-white">{id}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">Version</div>
          <div className="text-sm text-gray-300">{version}</div>
        </div>
      </div>
      
      <div className="mt-2">
        {isInScope ? (
          <button className="w-full text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white bg-[#27272a] py-1.5 rounded border border-green-600 hover:border-red-500 hover:bg-red-500/10 transition-all">
            Remove System
          </button>
        ) : (
          <button className="w-full text-[10px] font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 py-1.5 rounded border border-green-600 transition-all">
            Add System
          </button>
        )}
      </div>
    </div>
  );
};

const StepTab = ({ label, active, completed }) => (
  <div className={`flex items-center px-4 py-3 border-b-2 cursor-pointer transition-colors ${active ? 'border-blue-500 bg-[#1c1d24]' : 'border-transparent hover:bg-[#1c1d24]/50'}`}>
    <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${active || completed ? 'bg-white text-black' : 'bg-gray-700 text-gray-400'}`}>
      {completed || active ? <Check className="w-3 h-3" /> : <div className="w-2 h-2 bg-gray-500 rounded-full" />}
    </div>
    <span className={`text-xs font-bold uppercase tracking-wide ${active ? 'text-white' : 'text-gray-500'}`}>{label}</span>
  </div>
);

export default function ProjectScopeUI() {
  const [activeTab, setActiveTab] = useState('Project Scope');

  const steps = [
    { label: 'Project Scope', active: true },
    { label: 'History Analysis', active: false },
    { label: 'JIVS IMP Deployment', active: false },
    { label: 'Implementation', active: false },
    { label: 'Acceptance Testing', active: false },
    { label: 'Finalize Project', active: false },
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
    <div className="min-h-screen bg-[#0b0c10] text-gray-300 font-sans selection:bg-green-900 selection:text-white">
      {/* Header */}
      <header className="h-16 border-b border-green-600 flex items-center justify-between px-6 bg-[#0b0c10]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm border border-green-600">
            jivs
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
          <div className="flex items-center gap-2 text-sm font-medium text-gray-300 cursor-pointer hover:text-white">
            <Building2 className="w-4 h-4" />
            <span>Seeburg AG</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white font-bold border border-green-600">
            RK
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-8 max-w-[1800px] mx-auto">
        
        {/* Project Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-[#1e293b] border border-green-600 rounded p-2 text-center min-w-[60px]">
              <div className="text-blue-400 font-bold text-xl leading-none">NBH</div>
              <div className="text-[8px] text-gray-400 uppercase mt-1 leading-tight">New Build<br/>History</div>
            </div>
            <h1 className="text-3xl font-light text-white">S/4 Transformation Project</h1>
          </div>
          
          <div className="flex gap-3">
            <Button variant="secondary">View Scope</Button>
            <Button variant="secondary">Collaborators</Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-green-600 mb-10 overflow-x-auto">
          {steps.map((step) => (
            <StepTab key={step.label} label={step.label} active={step.active} />
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-12 gap-12">
          
          {/* Left Column: Scope & Systems */}
          <div className="col-span-12 xl:col-span-7">
            <h2 className="text-xl text-gray-400 font-light mb-6">Project Scope</h2>
            
            {/* In Scope Section */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg text-white">In Scope</h3>
                <Button variant="secondary" className="text-xs py-1 px-3 h-8">
                  <ArrowRight className="w-3 h-3 mr-2 rotate-180" /> View Scope
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {inScopeSystems.map(sys => (
                  <SystemCard key={sys.id} {...sys} type="in-scope" />
                ))}
                <SystemCard type="placeholder" />
              </div>
            </div>

            {/* Available Systems Section */}
            <div>
              <h3 className="text-lg text-white mb-4">Available Systems</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {availableSystems.map(sys => (
                  <SystemCard key={sys.id} {...sys} type="available" />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Add New Systems Form */}
          <div className="col-span-12 xl:col-span-5">
            <h2 className="text-xl text-gray-400 font-light mb-6">Add New Systems</h2>
            
            <div className="bg-[#121214] p-0 rounded-lg">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <InputField label="System ID" defaultValue="P10" />
                <SelectField label="Default IMP Content" value="Select" options={['Select', 'Standard', 'Custom']} />
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <SelectField label="Type" value="SAP" options={['SAP', 'Oracle', 'Other']} />
                <InputField label="SAP System Owner" placeholder="owner@mail.ch" icon={Mail} />
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <SelectField label="Version" value="ECC 6.0" options={['ECC 6.0', 'S/4HANA', 'R/3']} />
                <InputField label="Location" defaultValue="Kreuzlingen" />
              </div>

              <div className="mb-8">
                <InputField label="SAP Base Admin" defaultValue="Admin@mail.ch" icon={Mail} />
              </div>

              <div className="flex justify-end">
                <Button className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide">
                  ADD SYSTEM <ArrowRight className="ml-2 w-4 h-4 inline" />
                </Button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

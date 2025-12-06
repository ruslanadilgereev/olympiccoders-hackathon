import React, { useState } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Check, 
  Plus, 
  Mail, 
  ArrowRight, 
  LayoutGrid, 
  Users,
  Search
} from 'lucide-react';

// Reusable UI Components to simulate shadcn/ui
const Button = ({ children, variant = 'primary', className = '', ...props }: any) => {
  const baseStyles = "px-4 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800",
    ghost: "bg-transparent text-gray-400 hover:text-white",
    outline: "bg-transparent border border-gray-700 text-gray-300 hover:border-gray-500"
  };
  // @ts-ignore
  return <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

const Input = ({ className = '', icon: Icon, ...props }: any) => (
  <div className="relative w-full">
    <input 
      className={`w-full bg-[#1e1e24] border border-gray-700 rounded px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 ${Icon ? 'pl-9' : ''} ${className}`} 
      {...props} 
    />
    {Icon && <Icon className="absolute left-3 top-3 w-4 h-4 text-gray-500" />}
  </div>
);

const Select = ({ className = '', value, options = [], ...props }: any) => (
  <div className="relative w-full">
    <select 
      className={`w-full bg-[#1e1e24] border border-gray-700 rounded px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 appearance-none ${className}`} 
      value={value}
      {...props}
    >
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
  </div>
);

const Badge = ({ children, className = '' }: any) => (
  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${className}`}>
    {children}
  </span>
);

const Card = ({ children, className = '', active = false }: any) => (
  <div className={`bg-[#13131a] border ${active ? 'border-green-500' : 'border-gray-800'} rounded-lg p-4 ${className}`}>
    {children}
  </div>
);

const SystemCard = ({ id, version, type = 'remove', isGreen = false }: any) => (
  <Card active={isGreen} className="flex flex-col justify-between h-32">
    <div className="flex justify-between items-start">
      <div>
        <div className="text-xs text-gray-500 mb-1">System ID:</div>
        <div className="text-sm font-bold text-white">{id}</div>
      </div>
      <div className="text-right">
        <div className="text-xs text-gray-500 mb-1">Version:</div>
        <div className="text-xs text-gray-300">{version}</div>
      </div>
    </div>
    
    {type === 'remove' ? (
      <button className="w-full mt-auto py-1.5 bg-[#1a1a20] hover:bg-red-900/30 border border-gray-700 hover:border-red-800 text-[10px] text-gray-300 hover:text-red-400 rounded uppercase font-semibold transition-colors">
        Remove System
      </button>
    ) : (
      <button className="w-full mt-auto py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/50 text-[10px] text-blue-400 rounded uppercase font-semibold transition-colors">
        Add System
      </button>
    )}
  </Card>
);

export default function TransformationDashboard() {
  const tabs = [
    { name: 'PROJECT SCOPE', active: true },
    { name: 'HISTORY ANALYSIS', active: false },
    { name: 'JIVS IMP DEPLOYMENT', active: false },
    { name: 'IMPLEMENTATION', active: false },
    { name: 'ACCEPTANCE TESTING', active: false },
    { name: 'FINALIZE PROJECT', active: false },
  ];

  const inScopeSystems = [
    { id: 'P01', version: 'SAP ECC 6.0', isGreen: true },
    { id: 'P02', version: 'SAP ECC 6.0', isGreen: false },
    { id: 'P03', version: 'SAP ECC 6.0', isGreen: false },
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
    <div className="min-h-screen bg-[#0a0a0c] text-gray-300 font-sans selection:bg-blue-500/30">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-[#0a0a0c]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs">
            jvs
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
          <div className="flex items-center gap-2 cursor-pointer hover:text-white">
            <span className="text-sm font-medium">Seeburg AG</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
            RK
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </header>

      {/* Project Header */}
      <div className="px-8 py-6 border-b border-gray-800">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1e293b] rounded flex flex-col items-center justify-center border border-blue-900/50">
              <span className="text-blue-400 font-bold text-sm">NBH</span>
              <span className="text-[8px] text-blue-300/70 uppercase">New Build</span>
            </div>
            <h1 className="text-2xl text-white font-light tracking-wide">S/4 Transformation Project</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="text-[10px] px-3 py-1.5 h-8">
              <LayoutGrid className="w-3 h-3 mr-2" /> VIEW SCOPE
            </Button>
            <Button variant="outline" className="text-[10px] px-3 py-1.5 h-8">
              <Users className="w-3 h-3 mr-2" /> COLLABORATORS
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              className={`
                flex items-center gap-2 px-6 py-3 text-[10px] font-bold tracking-wider uppercase border-t-2 transition-all
                ${tab.active 
                  ? 'bg-[#1a1a20] border-blue-500 text-white' 
                  : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-[#131316]'}
              `}
            >
              {tab.active && <div className="w-3 h-3 rounded-full bg-white text-black flex items-center justify-center"><Check className="w-2 h-2" /></div>}
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="p-8 grid grid-cols-12 gap-8">
        
        {/* Left Column - Scope & Systems */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <h2 className="text-xl text-gray-200 font-light mb-6">Project Scope</h2>

          {/* In Scope Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg text-gray-300 font-light">In Scope</h3>
              <Button variant="outline" className="text-[10px] h-7 px-3 border-gray-700">
                <LayoutGrid className="w-3 h-3 mr-2" /> VIEW SCOPE
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {inScopeSystems.map((sys) => (
                <SystemCard 
                  key={sys.id} 
                  id={sys.id} 
                  version={sys.version} 
                  type="remove" 
                  isGreen={sys.isGreen} // Passing the prop to trigger green border
                />
              ))}
              
              {/* Add Placeholder */}
              <div className="h-32 border border-dashed border-gray-700 rounded-lg flex items-center justify-center hover:bg-[#131316] cursor-pointer transition-colors group">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-gray-700">
                  <Plus className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Available Systems Section */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg text-gray-300 font-light">Available Systems</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableSystems.map((sys) => (
                <SystemCard key={sys.id} id={sys.id} version={sys.version} type="add" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Add New Systems Form */}
        <div className="col-span-12 lg:col-span-4 bg-[#13131a] p-6 rounded-lg border border-gray-800 h-fit">
          <h2 className="text-lg text-gray-200 font-light mb-8">Add New Systems</h2>
          
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">System ID</label>
                <Input defaultValue="P10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">Default IMP Content</label>
                <Select options={['Select', 'Content A', 'Content B']} value="Select" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-blue-400">Type</label>
                <Select options={['SAP', 'Oracle', 'Other']} value="SAP" className="border-blue-900/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">SAP System Owner</label>
                <Input icon={Mail} defaultValue="owner@mail.ch" className="text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">Version</label>
                <Select options={['ECC 6.0', 'S/4HANA']} value="ECC 6.0" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">Location</label>
                <Input defaultValue="Kreuzlingen" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-500">SAP Base Admin</label>
              <Input icon={Mail} defaultValue="Admin@mail.ch" />
            </div>

            <div className="pt-8 flex justify-end">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 text-xs font-bold tracking-wide flex items-center">
                ADD SYSTEM <ArrowRight className="w-3 h-3 ml-2" />
              </Button>
            </div>
          </form>
        </div>

      </main>
    </div>
  );
}

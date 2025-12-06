import React from 'react';
import { CheckCircle, ChevronDown, Bell, Users, Plus, Mail, ArrowRight, Search } from 'lucide-react';

const SystemCard: React.FC<{ id: string; version: string; inScope: boolean; onAction: (id: string) => void; } > = ({ id, version, inScope, onAction }) => (
  <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-start justify-between w-40 h-28">
    <div>
      <div className="text-gray-400 text-xs">System ID:</div>
      <div className="text-white font-semibold text-lg">{id}</div>
    </div>
    <div>
      <div className="text-gray-400 text-xs">Version:</div>
      <div className="text-white text-sm">{version}</div>
    </div>
    <button
      onClick={() => onAction(id)}
      className={`mt-2 w-full text-xs font-medium py-1 rounded ${inScope ? 'bg-red-700 text-white' : 'bg-blue-700 text-white'}`}
    >
      {inScope ? 'REMOVE SYSTEM' : 'ADD SYSTEM'}
    </button>
  </div>
);

const AddSystemPlaceholder: React.FC = () => (
  <div className="bg-gray-800 border border-dashed border-gray-600 p-4 rounded-lg flex items-center justify-center w-40 h-28 cursor-pointer">
    <Plus className="text-gray-400 w-8 h-8" />
  </div>
);

const Dropdown: React.FC<{ label: string; value: string; options: string[]; }> = ({ label, value, options }) => (
  <div className="mb-4">
    <label className="block text-gray-400 text-sm mb-1">{label}</label>
    <div className="relative">
      <select
        className="w-full bg-gray-700 border border-gray-600 text-white py-2 px-3 pr-8 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
        value={value}
        onChange={() => {}}
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
    </div>
  </div>
);

const InputField: React.FC<{ label: string; value: string; icon?: React.ElementType; }> = ({ label, value, icon: Icon }) => (
  <div className="mb-4">
    <label className="block text-gray-400 text-sm mb-1">{label}</label>
    <div className="relative">
      <input
        type="text"
        className="w-full bg-gray-700 border border-gray-600 text-white py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={value}
        readOnly
      />
      {Icon && <Icon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />}
    </div>
  </div>
);

const GeneratedUI: React.FC = () => {
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

  const handleSystemAction = (id: string) => {
    console.log(`Action for system ${id}`);
    // In a real app, this would update state
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <div className="bg-red-600 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold text-sm">jivs</div>
          <div className="bg-blue-800 text-white text-xs font-bold px-2 py-1 rounded-md flex flex-col items-center justify-center leading-none">
            NBH<span className="text-[8px] font-normal">NEW BUILD HISTORY</span>
          </div>
          <h1 className="text-2xl font-light">S/4 Transformation Project</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-400 hover:text-white"><Bell className="w-5 h-5" /></button>
          <button className="text-gray-400 hover:text-white"><Users className="w-5 h-5" /></button>
          <div className="flex items-center space-x-2 text-gray-300">
            <span>Seeburg AG</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <div className="bg-purple-600 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold text-sm">RK</div>
        </div>
      </header>

      {/* Project Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center space-x-6">
        <button className="flex items-center space-x-2 px-4 py-2 rounded-md bg-gray-700 text-white font-medium">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span>PROJECT SCOPE</span>
        </button>
        <button className="px-4 py-2 rounded-md text-gray-400 hover:bg-gray-800 font-medium">HISTORY ANALYSIS</button>
        <button className="px-4 py-2 rounded-md text-gray-400 hover:bg-gray-800 font-medium">JIVS IMP DEPLOYMENT</button>
        <button className="px-4 py-2 rounded-md text-gray-400 hover:bg-gray-800 font-medium">IMPLEMENTATION</button>
        <button className="px-4 py-2 rounded-md text-gray-400 hover:bg-gray-800 font-medium">ACCEPTANCE TESTING</button>
        <button className="px-4 py-2 rounded-md text-gray-400 hover:bg-gray-800 font-medium">FINALIZE PROJECT</button>
      </nav>

      {/* Main Content Area */}
      <div className="flex p-6 space-x-6">
        {/* Left Panel - Project Scope Details */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light">Project Scope</h2>
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 rounded-md border border-gray-700 text-gray-400 hover:bg-gray-800 text-sm">
                <Search className="w-4 h-4" />
                <span>VIEW SCOPE</span>
              </button>
              <button className="px-4 py-2 rounded-md border border-gray-700 text-gray-400 hover:bg-gray-800 text-sm">COLLABORATORS</button>
            </div>
          </div>

          {/* In Scope Systems */}
          <div className="mb-8">
            <h3 className="text-xl font-light mb-4">In Scope</h3>
            <div className="flex flex-wrap gap-4">
              {inScopeSystems.map(system => (
                <SystemCard key={system.id} {...system} inScope={true} onAction={handleSystemAction} />
              ))}
              <AddSystemPlaceholder />
            </div>
          </div>

          {/* Available Systems */}
          <div>
            <h3 className="text-xl font-light mb-4">Available Systems</h3>
            <div className="flex flex-wrap gap-4">
              {availableSystems.map(system => (
                <SystemCard key={system.id} {...system} inScope={false} onAction={handleSystemAction} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Add New Systems Form */}
        <div className="w-96 bg-gray-900 p-6 rounded-lg border border-gray-800">
          <h3 className="text-xl font-light mb-6">Add New Systems</h3>
          <InputField label="System ID" value="P10" />
          <Dropdown label="Default IMF Content" value="Select" options={['Select', 'Option 1', 'Option 2']} />
          <Dropdown label="Type" value="SAP" options={['SAP', 'Non-SAP']} />
          <InputField label="SAP System Owner" value="owner@mail.ch" icon={Mail} />
          <Dropdown label="Version" value="ECC 6.0" options={['ECC 6.0', 'ECC 7.0']} />
          <InputField label="Location" value="Kreuzlingen" />
          <InputField label="SAP Basis Admin" value="Admin@mail.ch" icon={Mail} />
          <button className="mt-6 w-full bg-blue-700 text-white py-3 px-4 rounded-md flex items-center justify-center space-x-2 font-medium hover:bg-blue-600">
            <span>ADD SYSTEM</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneratedUI;

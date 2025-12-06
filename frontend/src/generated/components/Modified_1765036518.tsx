import React from 'react';
import { CheckCircle, Plus } from 'lucide-react';

const GeneratedUI = () => {
  return (
    <div className="bg-zinc-900 text-white font-sans antialiased">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-red-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-500 rounded-full mr-4"></div>
            <div>
              <div className="text-sm text-zinc-400">NBH</div>
              <div className="text-xl font-semibold">S/4 Transformation Project</div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="text-sm text-zinc-400 mr-4">Seeburg AG</div>
            <div className="w-6 h-6 bg-green-500 rounded-full"></div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-start space-x-4 mb-8">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Project Scope
          </button>
          <button className="text-zinc-400 px-4 py-2 rounded-md text-sm font-medium">History Analysis</button>
          <button className="text-zinc-400 px-4 py-2 rounded-md text-sm font-medium">JIVS IMP Deployment</button>
          <button className="text-zinc-400 px-4 py-2 rounded-md text-sm font-medium">Implementation</button>
          <button className="text-zinc-400 px-4 py-2 rounded-md text-sm font-medium">Acceptance Testing</button>
          <button className="text-zinc-400 px-4 py-2 rounded-md text-sm font-medium">Finalize Project</button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-2 gap-8">
          {/* Left Section - Project Scope */}
          <div>
            <div className="text-2xl font-semibold mb-4">Project Scope</div>
            <div className="text-lg font-medium mb-2">In Scope</div>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-zinc-800 rounded-md p-4 border border-red-500 border-[3px]">
                <div className="text-sm text-zinc-400">System ID:</div>
                <div className="text-white">P01</div>
                <div className="text-xs text-green-500">SAP ECC 6.0</div>
                <button className="text-xs text-red-500">Remove System</button>
              </div>
              <div className="bg-zinc-800 rounded-md p-4 border border-red-500 border-[3px]">
                <div className="text-sm text-zinc-400">System ID:</div>
                <div className="text-white">P02</div>
                <div className="text-xs text-green-500">SAP ECC 6.0</div>
                <button className="text-xs text-red-500">Remove System</button>
              </div>
              <div className="bg-zinc-800 rounded-md p-4 border border-red-500 border-[3px]">
                <div className="text-sm text-zinc-400">System ID:</div>
                <div className="text-white">P03</div>
                <div className="text-xs text-green-500">SAP ECC 6.0</div>
                <button className="text-xs text-red-500">Remove System</button>
              </div>
              <div className="bg-zinc-800 rounded-md p-4 flex items-center justify-center border border-red-500 border-[3px]">
                <Plus className="w-6 h-6 text-zinc-400" />
              </div>
            </div>

            <div className="text-lg font-medium mb-2">Available Systems</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-zinc-800 rounded-md p-4 border border-red-500 border-[3px]">
                <div className="text-sm text-zinc-400">System ID:</div>
                <div className="text-white">P04</div>
                <div className="text-xs text-green-500">SAP ECC 6.0</div>
                <button className="text-xs text-green-500">Add System</button>
              </div>
              <div className="bg-zinc-800 rounded-md p-4 border border-red-500 border-[3px]">
                <div className="text-sm text-zinc-400">System ID:</div>
                <div className="text-white">P05</div>
                <div className="text-xs text-green-500">SAP ECC 6.0</div>
                <button className="text-xs text-green-500">Add System</button>
              </div>
              <div className="bg-zinc-800 rounded-md p-4 border border-red-500 border-[3px]">
                <div className="text-sm text-zinc-400">System ID:</div>
                <div className="text-white">P06</div>
                <div className="text-xs text-green-500">SAP ECC 6.0</div>
                <button className="text-xs text-green-500">Add System</button>
              </div>
              <div className="bg-zinc-800 rounded-md p-4 border border-red-500 border-[3px]">
                <div className="text-sm text-zinc-400">System ID:</div>
                <div className="text-white">P07</div>
                <div className="text-xs text-green-500">SAP ECC 6.0</div>
                <button className="text-xs text-green-500">Add System</button>
              </div>
              <div className="bg-zinc-800 rounded-md p-4 border border-red-500 border-[3px]">
                <div className="text-sm text-zinc-400">System ID:</div>
                <div className="text-white">P08</div>
                <div className="text-xs text-green-500">SAP ECC 6.0</div>
                <button className="text-xs text-green-500">Add System</button>
              </div>
              <div className="bg-zinc-800 rounded-md p-4 border border-red-500 border-[3px]">
                <div className="text-sm text-zinc-400">System ID:</div>
                <div className="text-white">P09</div>
                <div className="text-xs text-green-500">SAP ECC 6.0</div>
                <button className="text-xs text-green-500">Add System</button>
              </div>
            </div>
          </div>

          {/* Right Section - Add New Systems */}
          <div className="bg-zinc-800 rounded-md p-4 border border-red-500 border-[3px]">
            <div className="text-xl font-semibold mb-4">Add New Systems</div>
            <div className="mb-2">
              <label className="block text-sm text-zinc-400 mb-1">System ID</label>
              <input type="text" className="bg-zinc-700 text-white rounded-md p-2 w-full" placeholder="P10" />
            </div>
            <div className="mb-2">
              <label className="block text-sm text-zinc-400 mb-1">Type</label>
              <select className="bg-zinc-700 text-white rounded-md p-2 w-full">
                <option>SAP</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-sm text-zinc-400 mb-1">Version</label>
              <select className="bg-zinc-700 text-white rounded-md p-2 w-full">
                <option>ECC 6.0</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-sm text-zinc-400 mb-1">SAP Base Admin</label>
              <input type="email" className="bg-zinc-700 text-white rounded-md p-2 w-full" placeholder="Admin@mail.ch" />
            </div>
            <div className="mb-2">
              <label className="block text-sm text-zinc-400 mb-1">Default IMF Content</label>
              <select className="bg-zinc-700 text-white rounded-md p-2 w-full">
                <option>Select</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-sm text-zinc-400 mb-1">SAP System Owner</label>
              <input type="email" className="bg-zinc-700 text-white rounded-md p-2 w-full" placeholder="owner@gmail.ch" />
            </div>
            <div className="mb-2">
              <label className="block text-sm text-zinc-400 mb-1">Location</label>
              <input type="text" className="bg-zinc-700 text-white rounded-md p-2 w-full" placeholder="Kreuzlingen" />
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium w-full">Add System</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedUI;

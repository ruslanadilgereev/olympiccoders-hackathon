import React from 'react';
import { Bell, ChevronDown, Plus, ArrowRight, LayoutGrid, Users, Monitor, CheckCircle2 } from 'lucide-react';

// Reusable components with forced green borders as requested by the prompt
const Button = ({ children, className, variant = 'primary', ...props }: any) => {
  const baseStyle = "px-4 py-2 rounded text-xs font-medium transition-colors border border-green-500 flex items-center justify-center gap-2";
  const variants: any = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-transparent text-gray-300 hover:bg-[#1a1b21]",
    danger: "bg-[#1a1b21] text-red-400 hover:bg-red-900/20",
    outline: "bg-transparent text-gray-400 hover:text-white"
  };
  return <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

const Input = ({ label, placeholder, value, icon: Icon, ...props }: any) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-[10px] text-gray-400 uppercase tracking-wider ml-1">{label}</label>}
    <div className="relative group">
      <input 
        className="w-full bg-[#15161A] text-gray-200 text-sm px-3 py-2.5 rounded border border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 placeholder-gray-600"
        placeholder={placeholder}
        value={value}
        readOnly
        {...props}
      />
      {Icon && <Icon className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />}
    </div>
  </div>
);

const Select = ({ label, value, ...props }: any) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-[10px] text-gray-400 uppercase tracking-wider ml-1">{label}</label>}
    <div className="relative">
      <div className="w-full bg-[#15161A] text-gray-200 text-sm px-3 py-2.5 rounded border border-green-500 flex justify-between items-center cursor-pointer">
        <span>{value || "Select"}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </div>
    </div>
  </div>
);

const Card = ({ children, className }: any) => (
  <div className={`bg-[#15161A] rounded p-4 border border-green-500 ${className}`}>
    {children}
  </div>
);

export default function ProjectScopeGreen() {
  return (
    <div className="min-h-screen bg-[#0B0C10] text-gray-300 font-sans p-4 border-x border-green-500 overflow-x-hidden">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between mb-8 px-2 py-2 border-b border-green-500 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs border border-green-500">
            jivs
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
          <div className="flex items-center gap-2 text-sm font-medium text-gray-300 cursor-pointer">
            <Monitor className="w-4 h-4" />
            <span>Seeburg AG</span>
            <ChevronDown className="w-3 h-3" />
          </div>
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold border border-green-500">
            RK
          </div>
        </div>
      </nav>

      {/* Project Header */}
      <header className="mb-8 border border-green-500 p-6 rounded-lg bg-[#111216]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1E293B] rounded flex flex-col items-center justify-center border border-green-500 text-center">
              <span className="text-[10px] font-bold text-blue-400">NBH</span>
              <span className="text-[8px] text-gray-500 leading-none">NEW BUILD<br/>HISTORY</span>
            </div>
            <div>
              <h1 className="text-2xl text-white font-light tracking-wide">S/4 Transformation Project</h1>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="text-[10px] uppercase tracking-wider">
              <LayoutGrid className="w-3 h-3" /> View Scope
            </Button>
            <Button variant="outline" className="text-[10px] uppercase tracking-wider">
              Collaborators
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex flex-wrap gap-1 border-b border-green-500/30 pb-1">
          {['Project Scope', 'History Analysis', 'JIVS IMP Deployment', 'Implementation', 'Acceptance Testing', 'Finalize Project'].map((tab, i) => (
            <div 
              key={tab}
              className={`
                px-6 py-3 text-[10px] font-bold uppercase tracking-wider cursor-pointer border border-green-500 transition-all
                ${i === 0 ? 'bg-[#1E2028] text-white border-b-0 relative top-[1px]' : 'text-gray-500 hover:text-gray-300 bg-[#0f1014]'}
              `}
            >
              {i === 0 && <CheckCircle2 className="w-3 h-3 inline mr-2 text-white" />}
              {tab}
            </div>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Scope Lists */}
        <div className="xl:col-span-7 flex flex-col gap-8">
          
          {/* In Scope Section */}
          <section className="border border-green-500 p-4 rounded-lg bg-[#111216]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg text-white font-light">In Scope</h2>
              <Button variant="outline" className="text-[10px] py-1 px-3 h-8">
                <ArrowRight className="w-3 h-3 mr-1" /> View Scope
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card 1 */}
              <Card className="flex flex-col justify-between h-32">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase">System ID</div>
                  <div className="text-sm font-bold text-white mb-2">P01</div>
                  <div className="text-[10px] text-gray-500 uppercase">Version</div>
                  <div className="text-xs text-gray-300">SAP ECC 6.0</div>
                </div>
                <button className="text-[9px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider text-left border border-green-500 w-fit px-2 py-1 rounded">
                  Remove System
                </button>
              </Card>

              {/* Card 2 */}
              <Card className="flex flex-col justify-between h-32">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase">System ID</div>
                  <div className="text-sm font-bold text-white mb-2">P02</div>
                  <div className="text-[10px] text-gray-500 uppercase">Version</div>
                  <div className="text-xs text-gray-300">SAP ECC 6.0</div>
                </div>
                <button className="text-[9px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider text-left border border-green-500 w-fit px-2 py-1 rounded">
                  Remove System
                </button>
              </Card>

              {/* Card 3 */}
              <Card className="flex flex-col justify-between h-32">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase">System ID</div>
                  <div className="text-sm font-bold text-white mb-2">P03</div>
                  <div className="text-[10px] text-gray-500 uppercase">Version</div>
                  <div className="text-xs text-gray-300">SAP ECC 6.0</div>
                </div>
                <button className="text-[9px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider text-left border border-green-500 w-fit px-2 py-1 rounded">
                  Remove System
                </button>
              </Card>

              {/* Add Placeholder */}
              <div className="h-32 border border-dashed border-green-500 rounded flex items-center justify-center cursor-pointer hover:bg-[#15161A] transition-colors bg-[#0f1014]">
                <Plus className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </section>

          {/* Available Systems Section */}
          <section className="border border-green-500 p-4 rounded-lg bg-[#111216]">
            <h2 className="text-lg text-white font-light mb-6">Available Systems</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: 'P04', ver: 'SAP ECC 6.0' },
                { id: 'P05', ver: 'SAP ECC 6.0' },
                { id: 'P06', ver: 'SAP ECC 6.0' },
                { id: 'P07', ver: 'SAP ECC 6.0' },
                { id: 'P08', ver: 'SAP ECC 6.0' },
                { id: 'P09', ver: 'SAP ECC 6.0' },
              ].map((sys) => (
                <Card key={sys.id} className="flex flex-col justify-between h-32">
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase">System ID</div>
                    <div className="text-sm font-bold text-white mb-2">{sys.id}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Version</div>
                    <div className="text-xs text-gray-300">{sys.ver}</div>
                  </div>
                  <Button variant="primary" className="w-full text-[9px] py-1 h-6">
                    ADD SYSTEM
                  </Button>
                </Card>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column: Add Form */}
        <div className="xl:col-span-5">
          <div className="border border-green-500 p-6 rounded-lg bg-[#111216] h-full relative">
            <h2 className="text-xl text-white font-light mb-8">Add New Systems</h2>
            
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Input label="System ID" value="P10" />
                <Select label="Default IMP Content" value="Select" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Select label="Type" value="SAP" />
                <Input label="SAP System Owner" value="owner@mail.ch" icon={Users} />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Select label="Version" value="ECC 6.0" />
                <Input label="Location" value="Kreuzlingen" />
              </div>

              <div className="w-1/2 pr-3">
                 <Input label="SAP Base Admin" value="Admin@mail.ch" icon={Users} />
              </div>

              <div className="pt-12 flex justify-end">
                 <Button variant="primary" className="px-8 py-3 text-xs font-bold w-full sm:w-auto">
                    ADD SYSTEM <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>
              </div>
            </form>

            {/* Decorative right border line from screenshot */}
            <div className="absolute right-0 top-20 bottom-20 w-[1px] bg-blue-600 hidden xl:block border-r border-green-500"></div>
          </div>
        </div>

      </div>
    </div>
  );
}

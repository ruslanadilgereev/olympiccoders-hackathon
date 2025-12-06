import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Settings, 
  User, 
  ChevronDown, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Server, 
  Database, 
  Activity, 
  CheckCircle2, 
  Terminal,
  Play,
  BarChart3,
  Clock,
  ShieldCheck,
  Search
} from 'lucide-react';

// --- Types ---

type SystemStatus = 'in-scope' | 'available';

interface System {
  id: string;
  name: string;
  version: string;
  status: SystemStatus;
  type: 'SAP ECC' | 'S/4HANA';
}

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

// --- Components ---

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  onClick, 
  icon: Icon 
}: { 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; 
  className?: string; 
  onClick?: () => void;
  icon?: React.ElementType;
}) => {
  const baseStyles = "px-4 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20",
    secondary: "bg-[#27272a] hover:bg-[#3f3f46] text-zinc-300 border border-zinc-700",
    danger: "bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50",
    ghost: "bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-white"
  };

  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
};

const Badge = ({ children, color = 'blue' }: { children: React.ReactNode, color?: 'blue' | 'green' | 'amber' }) => {
  const colors = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20"
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border ${colors[color]}`}>
      {children}
    </span>
  );
};

const InputLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs text-zinc-500 mb-1.5">{children}</label>
);

const DarkInput = ({ placeholder, defaultValue }: { placeholder?: string, defaultValue?: string }) => (
  <input 
    type="text" 
    defaultValue={defaultValue}
    placeholder={placeholder}
    className="w-full bg-[#09090b] border border-zinc-800 rounded p-2.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all placeholder:text-zinc-700"
  />
);

const DarkSelect = ({ options, defaultValue }: { options: string[], defaultValue?: string }) => (
  <div className="relative">
    <select 
      defaultValue={defaultValue}
      className="w-full bg-[#09090b] border border-zinc-800 rounded p-2.5 text-sm text-zinc-300 focus:outline-none focus:border-blue-600 appearance-none cursor-pointer"
    >
      {options.map(opt => <option key={opt}>{opt}</option>)}
    </select>
    <ChevronDown className="absolute right-3 top-3 text-zinc-600 pointer-events-none" size={14} />
  </div>
);

// --- Main Application ---

export default function OCCLifecycleSimulation() {
  const [activeTab, setActiveTab] = useState('scope');
  const [systems, setSystems] = useState<System[]>([
    { id: 'P01', name: 'SAP ECC 6.0', version: 'EHP8', status: 'in-scope', type: 'SAP ECC' },
    { id: 'P02', name: 'SAP ECC 6.0', version: 'EHP7', status: 'in-scope', type: 'SAP ECC' },
    { id: 'P03', name: 'SAP ECC 6.0', version: 'EHP8', status: 'in-scope', type: 'SAP ECC' },
    { id: 'P04', name: 'SAP ECC 6.0', version: 'EHP6', status: 'available', type: 'SAP ECC' },
    { id: 'P05', name: 'SAP ECC 6.0', version: 'EHP8', status: 'available', type: 'SAP ECC' },
    { id: 'P06', name: 'SAP ECC 6.0', version: 'EHP7', status: 'available', type: 'SAP ECC' },
    { id: 'P07', name: 'SAP ECC 6.0', version: 'EHP8', status: 'available', type: 'SAP ECC' },
    { id: 'P08', name: 'SAP ECC 6.0', version: 'EHP8', status: 'available', type: 'SAP ECC' },
    { id: 'P09', name: 'SAP ECC 6.0', version: 'EHP8', status: 'available', type: 'SAP ECC' },
  ]);

  // Simulation States
  const [installProgress, setInstallProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [transferItems, setTransferItems] = useState([
    { name: 'MARA', records: '1.2M', status: 'Pending' },
    { name: 'KNA1', records: '850K', status: 'Pending' },
    { name: 'VBAK', records: '2.4M', status: 'Pending' },
    { name: 'BSEG', records: '15.1M', status: 'Pending' },
  ]);

  const moveSystem = (id: string, to: SystemStatus) => {
    setSystems(prev => prev.map(s => s.id === id ? { ...s, status: to } : s));
  };

  // --- Scene 1: Project Scope (Screenshot Replica) ---
  const ProjectScopeView = () => (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
      {/* Left Column: Systems Lists */}
      <div className="flex-1 space-y-8">
        {/* In Scope Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-light text-zinc-200">In Scope</h2>
            <Button variant="secondary" className="text-[10px] py-1 h-7"> <ArrowRight size={12}/> VIEW SCOPE</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {systems.filter(s => s.status === 'in-scope').map(sys => (
              <div key={sys.id} className="bg-[#18181b] border border-zinc-800 p-4 rounded-lg flex flex-col gap-3 group hover:border-zinc-700 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">System ID</div>
                    <div className="text-zinc-100 font-medium">{sys.id}</div>
                  </div>
                  <Badge>{sys.type}</Badge>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Version</div>
                  <div className="text-zinc-300 text-sm">{sys.name}</div>
                </div>
                <button 
                  onClick={() => moveSystem(sys.id, 'available')}
                  className="mt-2 w-full py-1.5 bg-zinc-900 hover:bg-red-900/20 text-zinc-500 hover:text-red-400 text-[10px] font-bold uppercase tracking-wider rounded border border-zinc-800 hover:border-red-900/30 transition-all"
                >
                  Remove System
                </button>
              </div>
            ))}
            
            {/* Add Placeholder */}
            <button className="border border-dashed border-zinc-700 rounded-lg flex items-center justify-center min-h-[160px] hover:bg-zinc-900/50 transition-colors group">
              <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                <Plus className="text-zinc-400" size={16} />
              </div>
            </button>
          </div>
        </div>

        {/* Available Systems Section */}
        <div>
          <h2 className="text-lg font-light text-zinc-200 mb-4">Available Systems</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {systems.filter(s => s.status === 'available').map(sys => (
              <div key={sys.id} className="bg-[#0e0e11] border border-zinc-800/60 p-4 rounded-lg flex flex-col gap-3 opacity-75 hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">System ID</div>
                    <div className="text-zinc-300 font-medium">{sys.id}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Version</div>
                  <div className="text-zinc-400 text-sm">{sys.name}</div>
                </div>
                <button 
                  onClick={() => moveSystem(sys.id, 'in-scope')}
                  className="mt-2 w-full py-1.5 bg-blue-900/10 hover:bg-blue-600 text-blue-500 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded border border-blue-900/30 hover:border-blue-500 transition-all"
                >
                  Add System
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Add Form */}
      <div className="w-full lg:w-[400px] shrink-0">
        <h2 className="text-lg font-light text-zinc-200 mb-4">Add New Systems</h2>
        <div className="bg-[#131316] border border-zinc-800 rounded-lg p-6 space-y-5 shadow-xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputLabel>System ID</InputLabel>
              <DarkInput defaultValue="P10" />
            </div>
            <div>
              <InputLabel>Default IMP Content</InputLabel>
              <DarkSelect options={['Select', 'Standard', 'Minimal']} defaultValue="Select" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputLabel>Type</InputLabel>
              <DarkSelect options={['SAP', 'Oracle', 'Other']} defaultValue="SAP" />
            </div>
            <div>
              <InputLabel>SAP System Owner</InputLabel>
              <DarkInput placeholder="owner@mail.ch" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputLabel>Version</InputLabel>
              <DarkSelect options={['ECC 6.0', 'S/4HANA 2022']} defaultValue="ECC 6.0" />
            </div>
            <div>
              <InputLabel>Location</InputLabel>
              <DarkInput defaultValue="Kreuzlingen" />
            </div>
          </div>

          <div>
            <InputLabel>SAP Base Admin</InputLabel>
            <div className="relative">
              <DarkInput defaultValue="Admin@mail.ch" />
              <div className="absolute left-3 top-2.5">
                 {/* Icon placeholder if needed */}
              </div>
            </div>
          </div>

          <div className="pt-8 flex justify-end">
            <Button className="w-full sm:w-auto px-8 py-2.5">
              ADD SYSTEM <ArrowRight size={14} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // --- Scene 2: Installation (Simulation) ---
  const InstallationView = () => {
    const startInstall = () => {
      setInstallProgress(0);
      setLogs([]);
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 5;
        if (p > 100) p = 100;
        setInstallProgress(p);
        
        if (Math.random() > 0.7) {
          const msgs = [
            "Provisioning Azure Resources...",
            "Allocating VM Standard_D4s_v3...",
            "Pulling Docker images for JiVS IMP...",
            "Configuring Network Security Groups...",
            "Mounting Data Volumes...",
            "Starting Kubernetes Services..."
          ];
          setLogs(prev => [...prev, { 
            timestamp: new Date().toLocaleTimeString(), 
            message: msgs[Math.floor(Math.random() * msgs.length)],
            type: 'info'
          }]);
        }

        if (p === 100) clearInterval(interval);
      }, 200);
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#131316] border border-zinc-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-zinc-200 font-medium flex items-center gap-2">
                <Terminal size={18} className="text-blue-500"/> 
                Deployment Console
              </h3>
              <Button onClick={startInstall} icon={Play} className="h-8">Start Deployment</Button>
            </div>
            
            <div className="bg-black rounded border border-zinc-800 h-64 overflow-y-auto p-4 font-mono text-xs space-y-1">
              {logs.length === 0 && <span className="text-zinc-600">Ready to deploy... Waiting for command.</span>}
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-zinc-500">[{log.timestamp}]</span>
                  <span className="text-green-400">{log.message}</span>
                </div>
              ))}
              {installProgress === 100 && <div className="text-blue-400 mt-2">> Deployment Successful. System Ready.</div>}
            </div>
          </div>

          <div className="bg-[#131316] border border-zinc-800 rounded-lg p-6">
             <h3 className="text-zinc-200 font-medium mb-4">Resource Allocation</h3>
             <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1">
                    <span>CPU Usage</span>
                    <span>{Math.round(installProgress * 0.8)}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${installProgress * 0.8}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1">
                    <span>Memory Allocation</span>
                    <span>{Math.round(installProgress * 0.6)}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${installProgress * 0.6}%` }}></div>
                  </div>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#131316] border border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
             <div className="relative h-32 w-32 flex items-center justify-center mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-zinc-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path className="text-blue-500 transition-all duration-300" strokeDasharray={`${installProgress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
                <div className="absolute text-2xl font-bold text-white">{Math.round(installProgress)}%</div>
             </div>
             <p className="text-zinc-400 text-sm">Overall Progress</p>
          </div>
        </div>
      </div>
    );
  };

  // --- Scene 3: Data Transfer ---
  const DataTransferView = () => {
    useEffect(() => {
      const interval = setInterval(() => {
        setTransferItems(prev => prev.map(item => {
          if (item.status === 'Pending' && Math.random() > 0.8) return { ...item, status: 'In Progress' };
          if (item.status === 'In Progress' && Math.random() > 0.7) return { ...item, status: 'Success' };
          return item;
        }));
      }, 1000);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="bg-[#131316] border border-zinc-800 rounded-lg overflow-hidden animate-in fade-in duration-500">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <h3 className="text-zinc-100 font-medium">Export Handling App</h3>
            <p className="text-zinc-500 text-xs mt-1">Transferring legacy data to JiVS IMP</p>
          </div>
          <div className="flex gap-2">
             <Badge color="blue">Active</Badge>
             <Badge color="green">Secure Connection</Badge>
          </div>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-[#09090b] text-zinc-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Table Name</th>
              <th className="px-6 py-4 font-medium">Records</th>
              <th className="px-6 py-4 font-medium">Target System</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {transferItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                <td className="px-6 py-4 text-zinc-300 font-mono">{item.name}</td>
                <td className="px-6 py-4 text-zinc-400">{item.records}</td>
                <td className="px-6 py-4 text-zinc-400">P10 (S/4HANA)</td>
                <td className="px-6 py-4">
                  {item.status === 'Pending' && <span className="flex items-center gap-2 text-zinc-500"><Clock size={14}/> Pending</span>}
                  {item.status === 'In Progress' && <span className="flex items-center gap-2 text-blue-400 animate-pulse"><Activity size={14}/> Transferring...</span>}
                  {item.status === 'Success' && <span className="flex items-center gap-2 text-emerald-400"><CheckCircle2 size={14}/> Completed</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // --- Scene 4: Analysis ---
  const AnalysisView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
       <div className="bg-[#131316] border border-zinc-800 p-6 rounded-lg">
          <div className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Total Data Volume</div>
          <div className="text-3xl font-light text-white mb-1">4.2 TB</div>
          <div className="text-emerald-500 text-xs flex items-center gap-1">+12% <span className="text-zinc-600">vs last month</span></div>
       </div>
       <div className="bg-[#131316] border border-zinc-800 p-6 rounded-lg">
          <div className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Compression Ratio</div>
          <div className="text-3xl font-light text-white mb-1">92%</div>
          <div className="text-blue-500 text-xs flex items-center gap-1">Optimal <span className="text-zinc-600">performance</span></div>
       </div>
       <div className="bg-[#131316] border border-zinc-800 p-6 rounded-lg">
          <div className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Archived Objects</div>
          <div className="text-3xl font-light text-white mb-1">14,205</div>
          <div className="text-zinc-600 text-xs">Across 3 systems</div>
       </div>
       <div className="bg-[#131316] border border-zinc-800 p-6 rounded-lg">
          <div className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Cost Savings</div>
          <div className="text-3xl font-light text-white mb-1">$125k</div>
          <div className="text-emerald-500 text-xs flex items-center gap-1">Year to date</div>
       </div>

       <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-[#131316] border border-zinc-800 p-6 rounded-lg">
          <h3 className="text-zinc-200 font-medium mb-6 flex items-center gap-2"><BarChart3 size={18} className="text-blue-500"/> Data Aging Analysis</h3>
          <div className="h-48 flex items-end justify-between gap-2">
             {[40, 65, 35, 85, 55, 70, 45, 90, 60, 75, 50, 80].map((h, i) => (
               <div key={i} className="w-full bg-zinc-800/50 rounded-t hover:bg-blue-600/50 transition-colors relative group">
                  <div 
                    className="absolute bottom-0 w-full bg-blue-600 rounded-t opacity-80 group-hover:opacity-100 transition-all"
                    style={{ height: `${h}%` }}
                  ></div>
               </div>
             ))}
          </div>
          <div className="flex justify-between text-xs text-zinc-500 mt-2 px-1">
             <span>Jan</span><span>Dec</span>
          </div>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 font-sans selection:bg-blue-500/30">
      {/* Top Header */}
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-[#0c0c0e]">
        <div className="flex items-center gap-6">
          {/* Logo Placeholder */}
          <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-red-900/50">
            jivs
          </div>
          
          {/* Breadcrumb/Title */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-blue-900/30 rounded flex items-center justify-center text-blue-400 font-bold text-xs border border-blue-900/50">
              NBH
            </div>
            <div>
              <h1 className="text-zinc-100 font-light text-lg">S/4 Transformation Project</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="secondary" className="hidden md:flex text-[10px] py-1.5 h-8"> <ArrowRight size={12}/> VIEW SCOPE</Button>
          <Button variant="secondary" className="hidden md:flex text-[10px] py-1.5 h-8">COLLABORATORS</Button>
          <div className="h-6 w-px bg-zinc-800 mx-2"></div>
          <Bell size={18} className="text-zinc-400 hover:text-white cursor-pointer" />
          <div className="flex items-center gap-2 cursor-pointer hover:bg-zinc-800 py-1 px-2 rounded transition-colors">
             <div className="h-6 w-6 bg-purple-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
               RK
             </div>
             <span className="text-xs font-medium hidden sm:block">Seeburg AG</span>
             <ChevronDown size={14} className="text-zinc-500" />
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-zinc-800 bg-[#0c0c0e]/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-6 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {[ 
              { id: 'scope', label: 'PROJECT SCOPE', icon: ShieldCheck },
              { id: 'history', label: 'HISTORY ANALYSIS', icon: Search },
              { id: 'deployment', label: 'JIVS IMP DEPLOYMENT', icon: Server },
              { id: 'implementation', label: 'IMPLEMENTATION', icon: Database },
              { id: 'testing', label: 'ACCEPTANCE TESTING', icon: CheckCircle2 },
              { id: 'finalize', label: 'FINALIZE PROJECT', icon: CheckCircle2 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative px-6 py-4 text-[10px] font-bold tracking-widest uppercase transition-colors flex items-center gap-2
                  ${activeTab === tab.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}
                `}
              >
                {activeTab === tab.id && <tab.icon size={12} className="text-blue-500" />}
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="p-6 max-w-[1600px] mx-auto">
        {/* Header for the specific view */}
        <div className="mb-8">
          <h1 className="text-2xl font-light text-white mb-1">
            {activeTab === 'scope' && 'Project Scope'}
            {activeTab === 'deployment' && 'System Deployment'}
            {activeTab === 'implementation' && 'Data Migration'}
            {activeTab === 'history' && 'Analysis Dashboard'}
            {['testing', 'finalize'].includes(activeTab) && 'Module Under Construction'}
          </h1>
          <p className="text-zinc-500 text-sm">
             {activeTab === 'scope' && 'Manage your transformation landscape and define system boundaries.'}
             {activeTab === 'deployment' && 'Monitor infrastructure provisioning and application installation.'}
             {activeTab === 'implementation' && 'Track data transfer progress from legacy systems.'}
          </p>
        </div>

        {/* Dynamic Content */}
        {activeTab === 'scope' && <ProjectScopeView />}
        {activeTab === 'deployment' && <InstallationView />}
        {activeTab === 'implementation' && <DataTransferView />}
        {activeTab === 'history' && <AnalysisView />}
        
        {['testing', 'finalize'].includes(activeTab) && (
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-lg text-zinc-600">
            <Settings size={48} className="mb-4 opacity-20" />
            <p>This module is currently locked pending previous phase completion.</p>
          </div>
        )}
      </main>
    </div>
  );
}

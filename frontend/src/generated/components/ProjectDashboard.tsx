import React from 'react';
import { 
  Bell, 
  ChevronDown, 
  MoreHorizontal, 
  Gauge, 
  CheckCircle2, 
  ArrowRight, 
  Users,
  LayoutDashboard
} from 'lucide-react';

// Reusable components for the dashboard

const Badge = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={`px-2 py-0.5 text-xs font-medium rounded ${className}`}>
    {children}
  </span>
);

const Button = ({ 
  children, 
  variant = "primary", 
  className = "", 
  icon: Icon 
}: { 
  children: React.ReactNode; 
  variant?: "primary" | "outline" | "ghost" | "secondary"; 
  className?: string;
  icon?: React.ElementType;
}) => {
  const baseStyles = "flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors focus:outline-none rounded-sm";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20",
    secondary: "bg-[#1c1c21] hover:bg-[#27272a] text-gray-300 border border-gray-800",
    outline: "bg-transparent border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white",
    ghost: "bg-transparent text-gray-400 hover:text-white"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
      {Icon && <Icon className="ml-2 w-4 h-4" />}
    </button>
  );
};

const ProgressBar = ({ value, max = 100 }: { value: number; max?: number }) => {
  const percentage = (value / max) * 100;
  return (
    <div className="flex items-center gap-4 w-full">
      <div className="h-1.5 flex-1 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 font-mono">{value}/{max}</span>
    </div>
  );
};

const StepTab = ({ 
  label, 
  status, 
  isActive 
}: { 
  label: string; 
  status: "completed" | "current" | "pending"; 
  isActive?: boolean 
}) => {
  return (
    <div className={`
      flex-1 flex items-center justify-center py-4 px-2 border-b-2 text-xs font-bold tracking-wide uppercase transition-colors cursor-pointer
      ${isActive 
        ? "bg-[#16161a] border-blue-600 text-white" 
        : "bg-[#0e0e10] border-[#1f1f23] text-gray-500 hover:bg-[#131316]"}
    `}>
      {status === "completed" && <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-gray-400" />}
      {status === "current" && <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-white" />}
      {label}
    </div>
  );
};

export default function ProjectDashboard() {
  const systems = [
    { id: "P01", status: "Done", progress: 100 },
    { id: "P02", status: "Done", progress: 100 },
    { id: "P03", status: "Done", progress: 100 },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-sans selection:bg-blue-500/30">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-[#1f1f23] flex items-center justify-between px-6 bg-[#0a0a0a]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs shadow-red-900/50 shadow-lg">
            jivs
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <Bell className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
          <div className="flex items-center gap-2 text-sm font-medium text-gray-300 cursor-pointer hover:text-white">
            <span className="text-gray-500">🏢</span>
            Seeburg AG
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-[#0a0a0a]">
            RK
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Project Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded flex flex-col items-center justify-center text-[10px] font-bold text-white leading-tight shadow-lg shadow-blue-900/20">
              <span>NBH</span>
              <span className="text-[8px] opacity-70 font-normal">NEW BUILD</span>
              <span className="text-[8px] opacity-70 font-normal">HISTORY</span>
            </div>
            <div>
              <h1 className="text-2xl font-light text-white tracking-wide">S/4 Transformation Project</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="secondary" className="text-xs uppercase tracking-wider px-3 py-1.5">
              <LayoutDashboard className="w-3 h-3 mr-2" />
              View Scope
            </Button>
            <Button variant="secondary" className="text-xs uppercase tracking-wider px-3 py-1.5">
              <Users className="w-3 h-3 mr-2" />
              Collaborators
            </Button>
          </div>
        </div>

        {/* Workflow Tabs */}
        <div className="flex w-full mb-12 border border-[#1f1f23] rounded-sm overflow-hidden">
          <StepTab label="Project Scope" status="completed" />
          <StepTab label="History Analysis" status="current" isActive={true} />
          <StepTab label="JIVS IMP Deployment" status="pending" />
          <StepTab label="Implementation" status="pending" />
          <StepTab label="Acceptance Testing" status="pending" />
          <StepTab label="Finalize Project" status="pending" />
        </div>

        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-xl font-light text-gray-200">History Analysis</h2>
        </div>

        {/* Data Table */}
        <div className="bg-[#0e0e10] border border-[#1f1f23] rounded-sm overflow-hidden mb-8">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#1f1f23] text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-1">System</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-5"></div> {/* Progress spacer */}
            <div className="col-span-2">Performance</div>
            <div className="col-span-3">Actions</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[#1f1f23]">
            {systems.map((sys) => (
              <div key={sys.id} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-[#131316] transition-colors group">
                <div className="col-span-1 text-sm font-medium text-gray-300">{sys.id}</div>
                <div className="col-span-1">
                  <span className="text-sm text-gray-300">{sys.status}</span>
                </div>
                <div className="col-span-5 pr-8">
                  <ProgressBar value={sys.progress} />
                </div>
                <div className="col-span-2">
                  <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <Gauge className="w-4 h-4" />
                    Details
                  </button>
                </div>
                <div className="col-span-3 flex items-center gap-3">
                  <Button variant="outline" className="text-[10px] uppercase tracking-wider py-1.5 h-8 px-4 border-gray-700">
                    Open Analysis
                  </Button>
                  <button className="text-gray-500 hover:text-white p-1">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Action */}
        <div className="flex justify-end">
          <Button variant="primary" className="uppercase tracking-wider text-xs py-3 px-6 font-bold">
            Open JIVS IMP Deployment
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

      </main>
    </div>
  );
}

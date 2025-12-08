import React from 'react';
import { Bell, Building2, ChevronDown, CheckCircle2 } from 'lucide-react';

// Mock shadcn/ui components styled according to Business DNA
const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={`bg-[#18181B] rounded-lg border border-[#27272A] text-[#F9FAFB] ${className}`} {...props} />;
const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />;
const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props} />;
const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={`p-6 pt-0 ${className}`} {...props} />;
const Table = ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => <table className={`w-full caption-bottom text-sm ${className}`} {...props} />;
const TableHeader = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => <thead className={`[&_tr]:border-b [&_tr]:border-[#27272A] ${className}`} {...props} />;
const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => <tr className={`border-b border-[#27272A] transition-colors hover:bg-[#27272A]/50 data-[state=selected]:bg-[#27272A] ${className}`} {...props} />;
const TableHead = ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => <th className={`h-12 px-4 text-left align-middle font-medium text-[#A1A1AA] [&:has([role=checkbox])]:pr-0 ${className}`} {...props} />;
const TableCell = ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`} {...props} />;
const TableBody = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props} />;
const Badge = ({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: 'completed' | 'failed' | 'default' }) => {
    const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
    const variantClasses = {
        completed: "border-transparent bg-[#2DD4BF]/10 text-[#2DD4BF]",
        failed: "border-transparent bg-[#DC2626]/10 text-[#DC2626]",
        default: "border-transparent bg-[#A1A1AA]/10 text-[#A1A1AA]",
    };
    return <div className={`${baseClasses} ${variantClasses[variant || 'default']} ${className}`} {...props} />;
};
const Button = ({ className, variant, size, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'ghost', size?: 'sm' | 'default' }) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50";
    const variantClasses = { ghost: "hover:bg-[#27272A] hover:text-[#F9FAFB] text-[#A1A1AA]" };
    const sizeClasses = { sm: "h-9 rounded-md px-3", default: "h-10 px-4 py-2" };
    return <button className={`${baseClasses} ${variantClasses[variant || 'ghost']} ${sizeClasses[size || 'default']} ${className}`} {...props} />;
};

// --- TEMPLATES (as provided) ---

const HeaderTemplate: React.FC = () => {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-10 h-[64px] bg-[#18181B] border-b border-[#27272A]"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
    >
      <div className="flex items-center justify-between h-full max-w-[1152px] mx-auto px-[32px]">
        <div className="flex items-center">
          <div className="w-[32px] h-[32px] bg-[#DC2626] rounded-full flex items-center justify-center">
            <span className="text-[#FFFFFF] text-[14px] font-semibold">givs</span>
          </div>
        </div>
        <div className="flex items-center gap-x-6">
          <div className="relative">
            <Bell className="text-[#A1A1AA] w-[20px] h-[20px]" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
              1
            </div>
          </div>
          <div className="flex items-center gap-x-2 text-[#F9FAFB] cursor-pointer">
            <Building2 className="text-[#A1A1AA] w-[20px] h-[20px]" />
            <span className="text-[14px] font-medium">Seeburg AG</span>
            <ChevronDown className="text-[#A1A1AA] w-[16px] h-[16px]" />
          </div>
          <div className="flex items-center gap-x-2 cursor-pointer">
            <div className="w-[32px] h-[32px] bg-[#A78BFA] rounded-full flex items-center justify-center text-[#F9FAFB] text-[14px] font-medium">
              0
            </div>
            <div className="w-[32px] h-[32px] bg-[#27272A] rounded-full flex items-center justify-center text-[#F9FAFB] text-[14px] font-medium">
              RK
            </div>
            <ChevronDown className="text-[#A1A1AA] w-[16px] h-[16px]" />
          </div>
        </div>
      </div>
    </header>
  );
};

interface NavbarTemplateProps {
  activeStep: string;
}

const steps = [
  "PROJECT SCOPE",
  "HISTORY ANALYSIS",
  "JIVS IMP DEPLOYMENT",
  "IMPLEMENTATION",
  "ACCEPTANCE TESTING",
  "FINALIZE PROJECT"
];

const NavbarTemplate: React.FC<NavbarTemplateProps> = ({ activeStep }) => {
  const activeIndex = steps.indexOf(activeStep);

  return (
    <nav className="bg-[#18181B] border-b border-[#27272A]">
      <div className="flex items-center max-w-[1152px] mx-auto px-[32px] gap-x-[8px]">
        {steps.map((step, index) => {
          const isActive = step === activeStep;
          const isCompleted = index < activeIndex;

          return (
            <button
              key={step}
              className={`flex items-center gap-x-2 py-[12px] px-[16px] border-b-[2px] transition-colors duration-200
                ${isActive ? 'border-[#4F46E5] text-[#F9FAFB]' : 'border-transparent text-[#A1A1AA] hover:text-[#F9FAFB]'}
              `}
            >
              {isCompleted && <CheckCircle2 className="w-[16px] h-[16px] text-[#A1A1AA]" />}
              <span className="text-[12px] font-medium uppercase tracking-wider">
                {step}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

interface LayoutTemplateProps {
  children: React.ReactNode;
}

const LayoutTemplate: React.FC<LayoutTemplateProps> = ({ children }) => {
  const currentStep = "JIVS IMP DEPLOYMENT";

  return (
    <div className="min-h-screen bg-[#101012] font-['Inter'] text-[#F9FAFB]">
      <HeaderTemplate />
      <main className="pt-[64px]">
        <NavbarTemplate activeStep={currentStep} />
        <div className="max-w-[1152px] mx-auto px-[32px] py-[32px]">
          {children}
        </div>
      </main>
    </div>
  );
};

// --- PAGE SPECIFIC COMPONENTS ---

const TrendChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Metrics Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px] text-[#A1A1AA]">
          <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="xMidYMid meet">
            <line x1="40" y1="10" x2="40" y2="170" stroke="#3F3F46" strokeWidth="1" />
            <line x1="40" y1="170" x2="490" y2="170" stroke="#3F3F46" strokeWidth="1" />
            {[1, 2, 3, 4].map(i => (
              <line key={i} x1="40" y1={170 - i * 40} x2="490" y2={170 - i * 40} stroke="#27272A" strokeWidth="1" />
            ))}
            <text x="30" y="175" textAnchor="end" fontSize="12" fill="#71717A">0</text>
            <text x="30" y="135" textAnchor="end" fontSize="12" fill="#71717A">25</text>
            <text x="30" y="95" textAnchor="end" fontSize="12" fill="#71717A">50</text>
            <text x="30" y="55" textAnchor="end" fontSize="12" fill="#71717A">75</text>
            <text x="30" y="15" textAnchor="end" fontSize="12" fill="#71717A">100</text>
            <text x="70" y="185" textAnchor="middle" fontSize="12" fill="#71717A">Oct 20</text>
            <text x="175" y="185" textAnchor="middle" fontSize="12" fill="#71717A">Oct 21</text>
            <text x="280" y="185" textAnchor="middle" fontSize="12" fill="#71717A">Oct 22</text>
            <text x="385" y="185" textAnchor="middle" fontSize="12" fill="#71717A">Oct 23</text>
            <text x="490" y="185" textAnchor="middle" fontSize="12" fill="#71717A">Oct 24</text>
            <polyline
              fill="none"
              stroke="#4F46E5"
              strokeWidth="2"
              points="70,130 175,90 280,110 385,50 490,70"
            />
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

const runHistoryData = [
  { id: 'run_2d8e1a', startTime: '2023-10-26 14:30:15', endTime: '2023-10-26 14:45:22', status: 'Completed' },
  { id: 'run_9f4c7b', startTime: '2023-10-26 11:05:45', endTime: '2023-10-26 11:15:10', status: 'Completed' },
  { id: 'run_5a3b8d', startTime: '2023-10-25 18:00:00', endTime: '2023-10-25 18:02:13', status: 'Failed' },
  { id: 'run_c1e7f2', startTime: '2023-10-25 09:20:05', endTime: '2023-10-25 09:55:30', status: 'Completed' },
  { id: 'run_8g6h3i', startTime: '2023-10-24 16:45:10', endTime: '2023-10-24 17:00:00', status: 'Completed' },
  { id: 'run_k4l1m9', startTime: '2023-10-23 10:00:00', endTime: '2023-10-23 10:12:45', status: 'Completed' },
];

const RunHistoryTable = () => {
  const getStatusVariant = (status: string): 'completed' | 'failed' | 'default' => {
    if (status === 'Completed') return 'completed';
    if (status === 'Failed') return 'failed';
    return 'default';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Run History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Run ID</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runHistoryData.map((run) => (
              <TableRow key={run.id}>
                <TableCell className="font-medium text-[#F9FAFB]">{run.id}</TableCell>
                <TableCell className="text-[#A1A1AA]">{run.startTime}</TableCell>
                <TableCell className="text-[#A1A1AA]">{run.endTime}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(run.status)}>
                    {run.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                   <Button variant="ghost" size="sm">View Details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// --- MAIN SCREEN COMPONENT ---

const ResultsDashboardScreen = () => {
  return (
    <LayoutTemplate>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-[#F9FAFB]">Analysis Results</h1>
        
        <TrendChart />
        
        <RunHistoryTable />
      </div>
    </LayoutTemplate>
  );
};

export default ResultsDashboardScreen;

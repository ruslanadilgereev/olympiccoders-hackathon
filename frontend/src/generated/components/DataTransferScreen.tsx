import React from 'react';
import { Bell, Building2, ChevronDown, CheckCircle2, ArrowLeftRight, GaugeCircle, MoreHorizontal } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

// --- TEMPLATES ---

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
    <nav className="bg-[#101012]">
      <div className="flex items-center max-w-[1152px] mx-auto px-[32px]">
        {steps.map((step, index) => {
          const isActive = step === activeStep;
          const isCompleted = index < activeIndex;

          return (
            <button
              key={step}
              className={`flex items-center gap-x-2 py-4 px-3 border-b-[3px] transition-colors duration-200
                ${isActive ? 'border-[#4F46E5] text-[#F9FAFB]' : 'border-transparent text-[#A1A1AA] hover:text-[#F9FAFB]'}
              `}
            >
              {isCompleted && <CheckCircle2 className="w-4 h-4 text-[#A1A1AA]" />}
              <span className="text-[12px] font-medium tracking-wider whitespace-nowrap">
                {step}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// --- MAIN SCREEN COMPONENT ---

const implementationData = [
  { system: 'P01', status: 'Waiting', progress: 20, isDark: false },
  { system: 'P02', status: 'Waiting', progress: 0, isDark: true },
  { system: 'P03', status: 'Waiting', progress: 0, isDark: false },
];

const DataTransferScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#101012] font-['Inter'] text-[#F9FAFB]">
      <HeaderTemplate />
      <main className="pt-[64px]">
        <div className="bg-[#101012] border-b border-[#3F3F46]">
          <div className="max-w-[1152px] mx-auto px-[32px] pt-8 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-4">
                <div className="w-16 h-16 bg-[#2E3A87] rounded-lg flex flex-col items-center justify-center p-1 shrink-0">
                  <span className="text-white font-bold text-2xl">NBH</span>
                  <span className="text-white text-[8px] tracking-wider leading-tight">NEW BUILD</span>
                  <span className="text-white text-[8px] tracking-wider leading-tight">HISTORY</span>
                </div>
                <h1 className="text-4xl font-light">
                  <span className="font-medium text-[#F9FAFB]">S/4 Transformation</span>
                  <span className="text-[#A1A1AA]"> Project</span>
                </h1>
              </div>
              <div className="flex items-center gap-x-2">
                <Button variant="outline" className="bg-transparent border-[#3F3F46] text-[#A1A1AA] hover:bg-[#27272A] hover:text-[#F9FAFB] text-xs font-bold">
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  VIEW SCOPE
                </Button>
                <Button variant="outline" className="bg-transparent border-[#3F3F46] text-[#A1A1AA] hover:bg-[#27272A] hover:text-[#F9FAFB] text-xs font-bold">
                  COLLABORATORS
                </Button>
              </div>
            </div>
          </div>
        </div>

        <NavbarTemplate activeStep="IMPLEMENTATION" />
        
        <div className="max-w-[1152px] mx-auto px-[32px] py-8">
          <h2 className="text-2xl font-semibold mb-6 text-[#F9FAFB]">Implementation</h2>
          <div className="relative">
            <div className="border border-[#27272A] rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_1fr_3fr_2fr] items-center px-6 py-3 bg-[#18181B] text-[#A1A1AA] text-sm font-medium border-b border-[#27272A]">
                <div>System</div>
                <div>Status</div>
                <div>Performance</div>
                <div>Actions</div>
              </div>

              {/* Table Body */}
              <div>
                {implementationData.map((item, index) => (
                  <div
                    key={item.system}
                    className={`grid grid-cols-[1fr_1fr_3fr_2fr] items-center px-6 py-4 ${item.isDark ? 'bg-[#18181B]' : 'bg-[#101012]'} ${index < implementationData.length - 1 ? 'border-b border-[#27272A]' : ''}`}
                  >
                    <div className="font-medium text-[#F9FAFB]">{item.system}</div>
                    <div className="text-[#A1A1AA]">{item.status}</div>
                    <div className="flex items-center justify-between gap-x-4">
                       <div className="flex items-center gap-x-4 flex-grow">
                         <Progress value={item.progress} className="w-full h-2 bg-[#27272A] [&>div]:bg-[#2DD4BF]" />
                         <span className="text-[#A1A1AA] text-sm whitespace-nowrap">{item.progress}/100</span>
                       </div>
                       <div className="flex items-center gap-x-2 text-[#A1A1AA] shrink-0">
                         <GaugeCircle className="w-5 h-5" />
                         <span>Details</span>
                       </div>
                    </div>
                    <div className="flex items-center justify-start gap-x-2 pl-4">
                      <Button variant="outline" className="bg-transparent border-[#3F3F46] text-[#A1A1AA] hover:bg-[#27272A] hover:text-[#F9FAFB] text-xs px-3 py-1 h-auto font-bold">
                        START IMPLEMENTATION
                      </Button>
                      <Button variant="ghost" size="icon" className="text-[#A1A1AA] hover:bg-[#27272A] hover:text-[#F9FAFB]">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute top-12 right-[-16px] h-[calc(100%-48px)] w-0.5 bg-[#4F46E5] rounded-full"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DataTransferScreen;

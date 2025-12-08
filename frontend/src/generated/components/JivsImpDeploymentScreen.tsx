import React from 'react';
import { Bell, Building2, ChevronDown, CheckCircle2, ArrowLeftRight, Clock } from 'lucide-react';

const HeaderTemplate: React.FC = () => {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-10 h-[64px] bg-[#18181B] border-b border-[#27272A]"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
    >
      <div className="flex items-center justify-between h-full max-w-[1152px] mx-auto px-[32px]">
        <div className="flex items-center">
          <div className="w-[32px] h-[32px] bg-[#DC2626] rounded-full flex items-center justify-center">
            <span className="text-[#FFFFFF] text-[14px] font-semibold">jivs</span>
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
              O
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
        <div className="max-w-[1152px] mx-auto px-[32px] py-[32px] relative">
          {children}
        </div>
      </main>
      <div className="fixed top-[112px] right-0 bottom-0 w-0.5 bg-[#4F46E5] z-20"></div>
    </div>
  );
};

const JivsImpDeploymentScreen: React.FC = () => {
  return (
    <LayoutTemplate>
      <div className="flex items-center justify-between pb-6 border-b border-[#3F3F46]">
        <div className="flex items-center gap-x-4">
          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-[#2E3A87]">
            <span className="text-2xl font-bold text-white">NBH</span>
            <span className="text-[8px] text-gray-300 tracking-wider">NEW BUILD HISTORY</span>
          </div>
          <h1 className="text-4xl font-light text-gray-200">
            <span className="font-normal text-white">S/4</span> Transformation Project
          </h1>
        </div>
        <div className="flex items-center gap-x-2">
          <button className="flex items-center gap-x-2 px-3 py-1.5 border border-[#3F3F46] rounded-md text-xs font-semibold text-[#A1A1AA] hover:bg-[#27272A] transition-colors">
            <ArrowLeftRight size={14} />
            VIEW SCOPE
          </button>
          <button className="px-3 py-1.5 border border-[#3F3F46] rounded-md text-xs font-semibold text-[#A1A1AA] hover:bg-[#27272A] transition-colors">
            COLLABORATORS
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-3xl font-light text-gray-300">JIVS IMP Deployment</h2>
        <div className="mt-6 p-4 bg-[#18181B] border border-[#27272A] rounded-lg">
          <div className="flex items-center w-full bg-[#1C1F33] rounded-md h-10 px-3">
            <div className="w-[20%] h-6 bg-[#4F46E5] rounded-sm" />
            <div className="flex items-center pl-4 space-x-3">
              <Clock className="w-5 h-5 text-[#A1A1AA]" />
              <span className="text-sm font-medium tracking-wider text-[#A1A1AA]">
                IMP SYSTEM IS BEING PREPARED...
              </span>
            </div>
          </div>
        </div>
      </div>
    </LayoutTemplate>
  );
};

export default JivsImpDeploymentScreen;

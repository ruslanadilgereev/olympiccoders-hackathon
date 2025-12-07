import React from 'react';

const CheckCircleIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const BellIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const CastleIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 20v-9H2v9"/>
    <path d="M18 11V4l-4 4-4-4v7"/>
    <path d="M10 11V4l-4 4-4-4v7"/>
    <path d="M2 20v-2h20v2"/>
    <path d="M6 20v-2h4v2"/>
    <path d="M14 20v-2h4v2"/>
  </svg>
);

const ChevronDownIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const ArrowLeftRightIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3 4 7l4 4"/>
    <path d="M4 7h16"/>
    <path d="m16 21 4-4-4-4"/>
    <path d="M20 17H4"/>
  </svg>
);

const SpinnerIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const JivsImpHarness = () => {
  const steps = [
    { name: 'PROJECT SCOPE', status: 'completed' },
    { name: 'HISTORY ANALYSIS', status: 'completed' },
    { name: 'JIVS IMP DEPLOYMENT', status: 'active' },
    { name: 'IMPLEMENTATION', status: 'upcoming' },
    { name: 'ACCEPTANCE TESTING', status: 'upcoming' },
    { name: 'FINALIZE PROJECT', status: 'upcoming' },
  ];

  return (
    <div className="bg-[#101010] text-[#F9FAFB] min-h-screen font-['Inter']">
      <header className="flex items-center justify-between p-4 border-b border-[#27272A]">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-[#DC2626] rounded-full flex items-center justify-center font-bold text-lg">
            jivs
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <BellIcon className="h-6 w-6 text-[#9CA3AF]" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-[#EF4444] ring-2 ring-[#101010]"></span>
          </div>
          <div className="flex items-center space-x-2 text-[#F9FAFB]">
            <CastleIcon className="h-6 w-6" />
            <span>Seeburg AG</span>
            <ChevronDownIcon className="h-4 w-4" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#7C3AED] rounded-full flex items-center justify-center font-bold text-sm">
              RK
            </div>
            <ChevronDownIcon className="h-4 w-4" />
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-3">
              <div className="bg-[#4263EB] text-white rounded-md w-16 h-16 flex flex-col items-center justify-center">
                <span className="font-bold text-2xl">NBH</span>
                <span className="text-xs tracking-widest">NEW BUILD</span>
                <span className="text-xs tracking-widest">HISTORY</span>
              </div>
            </div>
            <h1 className="text-4xl font-light text-white">S/4 Transformation Project</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 border border-[#27272A] rounded-md text-[#9CA3AF] text-sm hover:bg-[#27272A]">
              <ArrowLeftRightIcon className="h-4 w-4" />
              <span>VIEW SCOPE</span>
            </button>
            <button className="px-4 py-2 border border-[#27272A] rounded-md text-[#9CA3AF] text-sm hover:bg-[#27272A]">
              COLLABORATORS
            </button>
          </div>
        </div>

        <div className="border-b border-[#27272A] mt-8 mb-8"></div>

        <nav>
          <div className="flex space-x-4 border-b border-[#27272A]">
            {steps.map((step) => (
              <button
                key={step.name}
                className={`flex items-center space-x-2 py-3 px-4 text-sm font-medium relative ` +
                  `${step.status === 'active' ? 'text-[#F9FAFB]' : 'text-[#6B7280]'}`
                }
              >
                {step.status !== 'upcoming' && <CheckCircleIcon className={`h-5 w-5 ${step.status === 'active' ? 'text-[#F9FAFB]' : 'text-[#6B7280]'}`} />}
                <span>{step.name}</span>
                {step.status === 'active' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4263EB]"></div>}
              </button>
            ))}
          </div>
        </nav>

        <div className="mt-8">
          <h2 className="text-2xl font-light text-white mb-6">JIVS IMP Deployment</h2>
          <div className="bg-[#181818] p-6 rounded-lg border border-[#27272A]">
            <div className="bg-[#27272A] rounded-lg w-full h-12 flex items-center overflow-hidden">
              <div className="bg-[#4263EB] h-full" style={{ width: '20%' }}></div>
              <div className="flex items-center gap-3 px-4 flex-shrink-0">
                <SpinnerIcon className="animate-spin text-[#9CA3AF] w-5 h-5" />
                <span className="text-[#9CA3AF] text-sm font-medium">IMP SYSTEM IS BEING PREPARED...</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JivsImpHarness;

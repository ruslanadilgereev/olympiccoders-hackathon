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

const DetailsIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const MoreHorizontalIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

const ArrowRightIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const HistoryAnalysisCompleteScreen = () => {
  const steps = [
    { name: 'PROJECT SCOPE', status: 'completed' },
    { name: 'HISTORY ANALYSIS', status: 'active' },
    { name: 'JIVS IMP DEPLOYMENT', status: 'upcoming' },
    { name: 'IMPLEMENTATION', status: 'upcoming' },
    { name: 'ACCEPTANCE TESTING', status: 'upcoming' },
    { name: 'FINALIZE PROJECT', status: 'upcoming' },
  ];

  const systems = [
    { name: 'P01', status: 'Done', progress: 100 },
    { name: 'P02', status: 'Done', progress: 100 },
    { name: 'P03', status: 'Done', progress: 100 },
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
            <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-[#EF4444] ring-2 ring-[#101010] text-xs flex items-center justify-center">1</span>
          </div>
          <div className="flex items-center space-x-2 text-[#F9FAFB]">
            <CastleIcon className="h-6 w-6" />
            <span>Seeburg AG</span>
            <ChevronDownIcon className="h-4 w-4" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#7C3AED] rounded-full flex items-center justify-center font-bold text-sm text-white">
              0
            </div>
            <div className="w-8 h-8 bg-[#27272A] rounded-full flex items-center justify-center font-bold text-sm">
              RK
            </div>
            <ChevronDownIcon className="h-4 w-4" />
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-[#1d2b5b] p-1 rounded-lg">
              <div className="bg-[#10173a] text-white rounded-md w-16 h-16 flex flex-col items-center justify-center p-1">
                <span className="font-bold text-2xl">NBH</span>
                <span className="text-[8px] tracking-widest">NEW BUILD</span>
                <span className="text-[8px] tracking-widest">HISTORY</span>
              </div>
            </div>
            <h1 className="text-4xl font-light text-white">S/4 Transformation <span className="text-[#6B7280]">Project</span></h1>
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
          <div className="flex space-x-1">
            {steps.map((step) => (
              <button
                key={step.name}
                className={`flex items-center space-x-2 py-3 px-4 text-sm font-medium relative ` +
                  `${step.status === 'active' ? 'text-[#F9FAFB] bg-[#181818]' : 'text-[#6B7280]'}`
                }
              >
                {step.status !== 'upcoming' && <CheckCircleIcon className={`h-5 w-5 ${step.status === 'active' ? 'text-[#F9FAFB]' : 'text-[#6B7280]'}`} />}
                <span>{step.name}</span>
                {step.status === 'active' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4263EB]"></div>}
              </button>
            ))}
          </div>
        </nav>

        <div className="bg-[#181818] p-6 mt-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-white">History <span className="font-light text-[#9CA3AF]">Analysis</span></h2>
          </div>
          
          <div className="rounded-lg overflow-hidden border border-[#27272A]">
            <div className="grid grid-cols-[1fr_1fr_3fr_2fr] items-center p-4 text-sm text-[#9CA3AF] bg-[#181818] border-b border-[#27272A]">
              <div className="font-medium">System</div>
              <div className="font-medium">Status</div>
              <div className="font-medium">Performance</div>
              <div className="font-medium">Actions</div>
            </div>
            <div>
              {systems.map((system, index) => (
                <div key={system.name} className={`grid grid-cols-[1fr_1fr_3fr_2fr] items-center p-4 text-sm bg-[#181818] ${index < systems.length - 1 ? 'border-b border-[#27272A]' : ''}`}>
                  <div className="text-[#F9FAFB]">{system.name}</div>
                  <div className="text-[#F9FAFB]">{system.status}</div>
                  <div className="flex items-center space-x-4">
                    <div className="w-full bg-[#27272A] rounded-full h-1.5">
                      <div className="bg-[#2DD4BF] h-1.5 rounded-full" style={{ width: `${system.progress}%` }}></div>
                    </div>
                    <span className="text-[#6B7280] w-12 text-right">{system.progress}/100</span>
                    <button className="flex items-center space-x-1 text-[#9CA3AF]">
                      <DetailsIcon className="h-5 w-5" />
                      <span>Details</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-start space-x-4">
                    <button className="px-3 py-1 text-xs border border-[#3F3F46] rounded-md text-[#F9FAFB] hover:bg-[#27272A]">
                      OPEN ANALYSIS
                    </button>
                    <button className="text-[#6B7280] hover:text-[#F9FAFB]">
                      <MoreHorizontalIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-8">
          <button className="bg-[#4263EB] text-white px-4 py-2 rounded-md text-sm font-semibold flex items-center space-x-2 hover:bg-[#3B5BDB]">
            <span>OPEN JIVS IMP DEPLOYMENT</span>
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>

      </main>
    </div>
  );
};

export default HistoryAnalysisCompleteScreen;

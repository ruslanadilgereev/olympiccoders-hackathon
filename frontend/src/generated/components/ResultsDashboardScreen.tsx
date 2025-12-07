import React from 'react';

// Icon components
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

const ResultsDashboardScreen = () => {
  const steps = [
    { name: 'PROJECT SCOPE', status: 'completed' },
    { name: 'HISTORY ANALYSIS', status: 'completed' },
    { name: 'JIVS IMP DEPLOYMENT', status: 'completed' },
    { name: 'IMPLEMENTATION', status: 'completed' },
    { name: 'ACCEPTANCE TESTING', status: 'completed' },
    { name: 'FINALIZE PROJECT', status: 'active' },
  ];

  const runHistory = [
    { name: 'Analysis Run 1', date: '2023-10-26', status: 'Completed' },
    { name: 'Analysis Run 2', date: '2023-10-22', status: 'Completed' },
    { name: 'Analysis Run 3', date: '2023-10-18', status: 'Completed' },
    { name: 'Analysis Run 4', date: '2023-10-15', status: 'Completed' },
  ];

  return (
    <div className="bg-[#101010] text-[#F9FAFB] min-h-screen font-['Inter']">
      <header className="flex items-center justify-between p-4 border-b border-[#27272A] shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
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

        <div className="bg-[#181818] p-6 mt-1 rounded-b-lg">
          <h2 className="text-2xl font-semibold text-white mb-6">Results Dashboard</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 border border-[#27272A] rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#F9FAFB]">Data Consistency Trend</h3>
                <div className="flex items-center space-x-4 text-xs text-[#9CA3AF]">
                  <div className="flex items-center space-x-2"><span className="w-3 h-3 rounded-full bg-[#4263EB]"></span><span>P01</span></div>
                  <div className="flex items-center space-x-2"><span className="w-3 h-3 rounded-full bg-[#2DD4BF]"></span><span>P02</span></div>
                  <div className="flex items-center space-x-2"><span className="w-3 h-3 rounded-full bg-[#7C3AED]"></span><span>P03</span></div>
                </div>
              </div>
              <div className="w-full h-80">
                <svg width="100%" height="100%" viewBox="0 0 500 300" preserveAspectRatio="none">
                  <g className="grid" stroke="#27272A" strokeOpacity="0.5">
                    <line x1="0" x2="500" y1="50" y2="50"></line>
                    <line x1="0" x2="500" y1="100" y2="100"></line>
                    <line x1="0" x2="500" y1="150" y2="150"></line>
                    <line x1="0" x2="500" y1="200" y2="200"></line>
                    <line x1="0" x2="500" y1="250" y2="250"></line>
                  </g>
                  <polyline fill="none" stroke="#4263EB" strokeWidth="2" points="0,150 100,120 200,180 300,160 400,200 500,180" />
                  <polyline fill="none" stroke="#2DD4BF" strokeWidth="2" points="0,200 100,180 200,150 300,120 400,140 500,100" />
                  <polyline fill="none" stroke="#7C3AED" strokeWidth="2" points="0,80 100,100 200,90 300,130 400,110 500,140" />
                </svg>
              </div>
            </div>
            <div className="p-6 border border-[#27272A] rounded-lg">
              <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">Run History</h3>
              <div className="space-y-4">
                {runHistory.map((run, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#27272A] rounded-md">
                    <div>
                      <p className="text-sm font-medium text-[#F9FAFB]">{run.name}</p>
                      <p className="text-xs text-[#6B7280]">{run.date}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#2DD4BF]"></span>
                        <span className="text-xs text-[#2DD4BF]">{run.status}</span>
                      </div>
                      <button className="px-3 py-1 text-xs border border-[#3F3F46] rounded-md text-[#F9FAFB] hover:bg-[#3F3F46]">
                        View Results
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultsDashboardScreen;

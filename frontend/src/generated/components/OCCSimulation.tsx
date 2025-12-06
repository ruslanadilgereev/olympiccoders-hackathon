import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Search, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  Server, 
  Database, 
  BarChart3, 
  Activity, 
  FileCheck, 
  Settings,
  Play
} from 'lucide-react';

// --- Components ---

const Header = () => (
  <header className="flex items-center justify-between px-6 py-3 bg-[#0f0f12] border-b border-zinc-800">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs">
        jivs
      </div>
    </div>
    <div className="flex items-center gap-6 text-zinc-400">
      <Bell className="w-5 h-5 hover:text-white cursor-pointer" />
      <div className="flex items-center gap-2 hover:text-white cursor-pointer">
        <span className="text-sm font-medium">Seeburg AG</span>
        <ChevronDown className="w-4 h-4" />
      </div>
      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-medium">
        RK
      </div>
      <ChevronDown className="w-4 h-4 -ml-4 hover:text-white cursor-pointer" />
    </div>
  </header>
);

const StepTabs = ({ currentScene }: { currentScene: number }) => {
  const steps = [
    { id: 1, label: "PROJECT SCOPE" },
    { id: 1.5, label: "HISTORY ANALYSIS" }, // Intermediate visual step
    { id: 2, label: "JIVS IMP DEPLOYMENT" },
    { id: 3, label: "IMPLEMENTATION" },
    { id: 3.5, label: "ACCEPTANCE TESTING" },
    { id: 4, label: "FINALIZE PROJECT" }
  ];

  // Map scene to active tab logic roughly
  const getActive = (id: number) => {
    if (currentScene === 1 && id === 1) return true;
    if (currentScene === 2 && id === 2) return true;
    if (currentScene === 3 && id === 3) return true;
    if (currentScene === 4 && id === 4) return true;
    return false;
  };

  return (
    <div className="flex border-b border-zinc-800 mt-8">
      {steps.map((step) => (
        <div
          key={step.id}
          className={`
            flex items-center gap-2 px-6 py-3 text-[10px] font-bold tracking-wider cursor-default transition-colors
            ${getActive(step.id) 
              ? 'bg-[#27272a] text-white border-b-2 border-blue-600' 
              : 'text-zinc-500 hover:text-zinc-300'}
          `}
        >
          {getActive(step.id) ? (
            <div className="w-3 h-3 rounded-full bg-white flex items-center justify-center">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
            </div>
          ) : (
            <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
          )}
          {step.label}
        </div>
      ))}
    </div>
  );
};

// --- Scenes ---

const Scene1_Scope = ({ onNext }: { onNext: () => void }) => {
  const [systems, setSystems] = useState<{name: string, type: string}[]>([]);
  const [input, setInput] = useState("");

  const addSystem = () => {
    if (!input) return;
    setSystems([...systems, { name: input, type: "SAP ERP 6.0" }]);
    setInput("");
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl text-zinc-100 mb-6 font-light">System Assignment</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Area */}
        <div className="bg-[#121214] border border-zinc-800 p-6 rounded-sm">
          <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Available Systems</h3>
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter System ID (e.g. P01)"
              className="flex-1 bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-blue-500 rounded-sm"
            />
            <button 
              onClick={addSystem}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-sm font-medium rounded-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="space-y-2">
            <div className="p-3 bg-zinc-900/50 border border-zinc-800 flex justify-between items-center text-zinc-500 text-sm">
              <span>ERP_PROD_01</span>
              <span className="text-xs bg-zinc-800 px-2 py-1 rounded">Legacy</span>
            </div>
            <div className="p-3 bg-zinc-900/50 border border-zinc-800 flex justify-between items-center text-zinc-500 text-sm">
              <span>CRM_ARCHIVE</span>
              <span className="text-xs bg-zinc-800 px-2 py-1 rounded">Legacy</span>
            </div>
          </div>
        </div>

        {/* Selected Scope */}
        <div className="bg-[#121214] border border-zinc-800 p-6 rounded-sm flex flex-col">
          <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">In Scope for Transformation</h3>
          <div className="flex-1 space-y-2">
            {systems.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-sm italic">
                <Server className="w-8 h-8 mb-2 opacity-20" />
                No systems assigned yet
              </div>
            )}
            {systems.map((sys, idx) => (
              <div key={idx} className="p-3 bg-blue-900/10 border border-blue-900/30 flex justify-between items-center text-zinc-200 text-sm animate-in zoom-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {sys.name}
                </div>
                <span className="text-xs text-zinc-500">{sys.type}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button 
              onClick={onNext}
              disabled={systems.length === 0}
              className="disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black hover:bg-zinc-200 px-6 py-2 text-sm font-bold rounded-sm flex items-center gap-2 transition-all"
            >
              Confirm Scope <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Scene2_Deployment = ({ onNext }: { onNext: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("INITIALIZING...");

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus("ENVIRONMENT READY");
          return 100;
        }
        // Simulate stages
        if (prev < 30) setStatus("PROVISIONING AZURE RESOURCES...");
        else if (prev < 60) setStatus("INSTALLING JIVS IMP...");
        else if (prev < 90) setStatus("CONFIGURING MEDIATOR APP...");
        else setStatus("FINALIZING SETUP...");
        
        return prev + 0.8;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-in fade-in duration-700">
      <h2 className="text-xl text-zinc-100 mb-2 font-light">JIVS IMP Deployment</h2>
      <p className="text-zinc-500 text-sm mb-8">Automated environment setup and configuration.</p>

      <div className="bg-[#121214] border border-zinc-800 p-12 rounded-sm flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-full max-w-2xl">
          <div className="flex justify-between text-xs font-bold text-zinc-400 mb-2 uppercase tracking-widest">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-12 bg-zinc-900 border border-zinc-800 w-full relative overflow-hidden">
             <div 
               className="h-full bg-blue-600 transition-all duration-100 ease-linear"
               style={{ width: `${progress}%` }}
             ></div>
             {/* Scanline effect */}
             <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)] w-full h-full animate-[shimmer_2s_infinite]"></div>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-3 text-zinc-300">
            {progress < 100 ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            )}
            <span className="font-mono text-sm tracking-wide uppercase">{status}</span>
          </div>
        </div>

        {progress === 100 && (
          <button 
            onClick={onNext}
            className="mt-12 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 text-sm font-bold rounded-sm animate-in fade-in slide-in-from-bottom-2"
          >
            Proceed to Implementation
          </button>
        )}
      </div>
    </div>
  );
};

const Scene3_Transfer = ({ onNext }: { onNext: () => void }) => {
  const [items, setItems] = useState([
    { id: 1, name: "Master Data (KNA1)", records: "45,200", status: "pending" },
    { id: 2, name: "Transaction History (VBAK)", records: "1,205,000", status: "pending" },
    { id: 3, name: "Material Documents (MKPF)", records: "890,500", status: "pending" },
    { id: 4, name: "Financial Documents (BKPF)", records: "2,100,300", status: "pending" },
  ]);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex >= items.length) {
        clearInterval(interval);
        return;
      }

      setItems(prev => prev.map((item, idx) => {
        if (idx === currentIndex) return { ...item, status: "processing" };
        if (idx < currentIndex) return { ...item, status: "completed" };
        return item;
      }));

      // Simulate completion of current item after a delay
      setTimeout(() => {
        setItems(prev => prev.map((item, idx) => {
          if (idx === currentIndex) return { ...item, status: "completed" };
          return item;
        }));
        currentIndex++;
      }, 1500);

    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const allComplete = items.every(i => i.status === "completed");

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      <h2 className="text-xl text-zinc-100 mb-6 font-light">Data Transfer Execution</h2>
      <div className="bg-[#121214] border border-zinc-800 rounded-sm overflow-hidden">
        <div className="grid grid-cols-12 bg-zinc-900/50 border-b border-zinc-800 p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Object Name</div>
          <div className="col-span-3 text-right">Records</div>
          <div className="col-span-3 pl-8">Status</div>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 p-4 items-center text-sm hover:bg-zinc-900/30 transition-colors">
              <div className="col-span-1 text-zinc-500">{item.id}</div>
              <div className="col-span-5 font-medium text-zinc-200 flex items-center gap-2">
                <Database className="w-4 h-4 text-zinc-600" />
                {item.name}
              </div>
              <div className="col-span-3 text-right text-zinc-400 font-mono">{item.records}</div>
              <div className="col-span-3 pl-8">
                {item.status === "pending" && <span className="text-zinc-600 text-xs uppercase bg-zinc-900 px-2 py-1 rounded">Pending</span>}
                {item.status === "processing" && (
                  <span className="text-blue-400 text-xs uppercase bg-blue-900/20 px-2 py-1 rounded flex w-fit items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> Transferring
                  </span>
                )}
                {item.status === "completed" && (
                  <span className="text-green-400 text-xs uppercase bg-green-900/20 px-2 py-1 rounded flex w-fit items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" /> Done
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button 
          onClick={onNext}
          disabled={!allComplete}
          className="disabled:opacity-0 disabled:translate-y-4 transition-all duration-500 bg-white text-black hover:bg-zinc-200 px-6 py-2 text-sm font-bold rounded-sm flex items-center gap-2"
        >
          View Analysis <BarChart3 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Scene4_Analysis = ({ onReset }: { onReset: () => void }) => {
  return (
    <div className="animate-in zoom-in-95 duration-500">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-xl text-zinc-100 font-light">Final Analysis & Results</h2>
          <p className="text-zinc-500 text-sm mt-1">Transformation project summary and savings report.</p>
        </div>
        <button onClick={onReset} className="text-zinc-500 hover:text-white text-sm flex items-center gap-2">
          <Settings className="w-4 h-4" /> Start New Simulation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#121214] border border-zinc-800 p-6 rounded-sm">
          <div className="text-zinc-500 text-xs uppercase tracking-wider font-bold mb-2">Total Data Volume</div>
          <div className="text-3xl text-white font-light">4.2 <span className="text-lg text-zinc-500">TB</span></div>
          <div className="mt-4 text-green-500 text-xs flex items-center gap-1">
            <Activity className="w-3 h-3" /> -85% vs Legacy System
          </div>
        </div>
        <div className="bg-[#121214] border border-zinc-800 p-6 rounded-sm">
          <div className="text-zinc-500 text-xs uppercase tracking-wider font-bold mb-2">Archived Objects</div>
          <div className="text-3xl text-white font-light">12.5 <span className="text-lg text-zinc-500">M</span></div>
          <div className="mt-4 text-blue-500 text-xs flex items-center gap-1">
            <FileCheck className="w-3 h-3" /> 100% Integrity Check
          </div>
        </div>
        <div className="bg-[#121214] border border-zinc-800 p-6 rounded-sm">
          <div className="text-zinc-500 text-xs uppercase tracking-wider font-bold mb-2">Cost Savings</div>
          <div className="text-3xl text-white font-light">$ 450<span className="text-lg text-zinc-500">k/yr</span></div>
          <div className="mt-4 text-green-500 text-xs flex items-center gap-1">
            <Activity className="w-3 h-3" /> ROI in 8 Months
          </div>
        </div>
      </div>

      <div className="bg-[#121214] border border-zinc-800 p-6 rounded-sm">
        <h3 className="text-sm font-semibold text-zinc-400 mb-6 uppercase tracking-wider">Data Reduction Trend</h3>
        <div className="h-48 flex items-end gap-4 px-4">
           {[60, 45, 30, 20, 15, 15].map((h, i) => (
             <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div 
                  className="w-full bg-blue-900/20 border-t-2 border-blue-500 transition-all duration-500 group-hover:bg-blue-900/40"
                  style={{ height: `${h}%` }}
                ></div>
                <span className="text-xs text-zinc-600">M{i+1}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

// --- Main Layout Controller ---

export default function OCCSimulation() {
  const [scene, setScene] = useState(1);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 font-sans selection:bg-blue-500/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-4">
            <div className="bg-blue-900/30 text-blue-400 border border-blue-900/50 px-2 py-1 rounded text-xs font-bold tracking-widest">
              NBH
            </div>
            <h1 className="text-2xl text-white font-light tracking-tight">S/4 Transformation Project</h1>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-1.5 border border-zinc-700 hover:border-zinc-500 text-xs font-bold tracking-wider text-zinc-400 hover:text-white transition-colors uppercase">
              View Scope
            </button>
            <button className="px-4 py-1.5 border border-zinc-700 hover:border-zinc-500 text-xs font-bold tracking-wider text-zinc-400 hover:text-white transition-colors uppercase">
              Collaborators
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <StepTabs currentScene={scene} />

        {/* Dynamic Content Area */}
        <div className="mt-10">
          {scene === 1 && <Scene1_Scope onNext={() => setScene(2)} />}
          {scene === 2 && <Scene2_Deployment onNext={() => setScene(3)} />}
          {scene === 3 && <Scene3_Transfer onNext={() => setScene(4)} />}
          {scene === 4 && <Scene4_Analysis onReset={() => setScene(1)} />}
        </div>
      </main>
    </div>
  );
}

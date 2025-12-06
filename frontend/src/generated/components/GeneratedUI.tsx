import React from 'react';
import { Bell, ChevronDown, ArrowRight, Search, LayoutGrid, Database, History, Globe } from 'lucide-react';

const GeneratedUI = () => {
  return (
    <div className="min-h-screen bg-[#02040a] text-white font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-red-600/30">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#cc0000] rounded-full flex items-center justify-center font-bold text-lg border border-red-600">
            jivs
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-gray-300 cursor-pointer">
            <span className="text-sm font-medium">Seeburg AG</span>
            <ChevronDown className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold border border-red-600">
              RK
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative px-8 pb-20">
        {/* Background Swirl Effect (Placeholder for the complex WebGL/Image) */}
        <div className="absolute top-0 right-0 w-2/3 h-[800px] opacity-60 pointer-events-none z-0">
           <img 
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
            alt="Abstract Swirl"
            className="w-full h-full object-cover mask-image-gradient"
            style={{ maskImage: 'linear-gradient(to left, black, transparent)' }}
           />
           <div className="absolute inset-0 bg-gradient-to-b from-[#02040a] via-transparent to-[#02040a]" />
           <div className="absolute inset-0 bg-gradient-to-r from-[#02040a] via-transparent to-transparent" />
        </div>

        {/* Hero Section */}
        <section className="relative z-10 pt-24 pb-16 max-w-2xl">
          <h1 className="text-6xl font-medium leading-tight tracking-tight mb-6">
            Lorem Ipsum <br />
            <span className="font-light text-gray-300">Dolor Sit Amet Elitr</span>
          </h1>
          <p className="text-gray-400 text-lg mb-10 max-w-lg leading-relaxed">
            Sed diam nonumy eirmod tempor invidunt ut labore et
            dolore magna aliquyam erat
          </p>
          <button className="bg-[#0066ff] hover:bg-blue-600 text-white px-8 py-3 rounded-md font-semibold text-sm flex items-center gap-2 transition-all border border-red-600">
            LEARN MORE <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        {/* My Running Projects */}
        <section className="relative z-10 mb-16">
          <h2 className="text-xl font-semibold mb-6">My Running Projects</h2>
          <div className="flex gap-6 overflow-x-auto pb-4">
            
            {/* Card 1 */}
            <div className="min-w-[300px] h-[180px] rounded-xl overflow-hidden relative group border border-red-600">
              <img 
                src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop" 
                alt="System Analysis" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5">
                <div className="w-8 h-8 mb-3 rounded bg-cyan-500/20 flex items-center justify-center border border-red-600">
                    <LayoutGrid className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="font-bold text-lg">System Analysis</h3>
                <p className="text-xs text-gray-400 mt-1">Retirement Program</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="min-w-[300px] h-[180px] rounded-xl overflow-hidden relative group border border-red-600">
              <img 
                src="https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=800&auto=format&fit=crop" 
                alt="DRPA" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5">
                <div className="w-8 h-8 mb-3 rounded bg-purple-500/20 flex items-center justify-center border border-red-600">
                    <Database className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="font-bold text-lg">D.R.P.A.</h3>
                <p className="text-xs text-gray-400 mt-1">Prestudy S/4 Transformation</p>
              </div>
            </div>

            {/* Card 3 (Active) */}
            <div className="min-w-[340px] h-[200px] -mt-2 rounded-xl overflow-hidden relative group shadow-2xl shadow-red-900/20 border border-red-600">
              <img 
                src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format&fit=crop" 
                alt="NBH" 
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute top-5 left-5">
                 <div className="w-10 h-10 bg-red-900/80 backdrop-blur-sm rounded flex items-center justify-center border border-red-600">
                    <span className="font-bold text-xs text-red-100">NBH</span>
                 </div>
                 <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-wider">New Build History</p>
              </div>
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <h3 className="font-bold text-xl mb-1">New Build History</h3>
                <p className="text-xs text-gray-400 mb-4">S/4 Transformation Project</p>
                <button className="bg-[#3b4eff] hover:bg-blue-600 text-white text-xs font-bold py-2 px-6 rounded shadow-lg shadow-blue-900/50 transition-all border border-red-600">
                  OPEN PROJECT
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Discover Section */}
        <section className="relative z-10">
          <h2 className="text-xl font-semibold mb-6">Discover</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Discover Card 1 */}
            <div className="h-[200px] rounded-xl overflow-hidden relative group cursor-pointer border border-red-600">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop" 
                alt="Person 1" 
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="font-medium text-sm text-gray-200">System Analysis</h3>
              </div>
            </div>

            {/* Discover Card 2 */}
            <div className="h-[200px] rounded-xl overflow-hidden relative group cursor-pointer border border-red-600">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop" 
                alt="Person 2" 
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="font-medium text-sm text-gray-200">D.R.P.A.</h3>
              </div>
            </div>

            {/* Discover Card 3 */}
            <div className="h-[200px] rounded-xl overflow-hidden relative group cursor-pointer border border-red-600">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop" 
                alt="Person 3" 
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="font-medium text-sm text-gray-200">Historization Analysis</h3>
              </div>
            </div>

            {/* Discover Card 4 */}
            <div className="h-[200px] rounded-xl overflow-hidden relative group cursor-pointer border border-red-600">
              <img 
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop" 
                alt="Person 4" 
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="font-medium text-sm text-gray-200">Migration Analysis</h3>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
};

export default GeneratedUI;

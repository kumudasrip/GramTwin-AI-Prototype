import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  Droplets, 
  LayoutDashboard, 
  Bell, 
  Map as MapIcon,
  ChevronRight,
  Search
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Alerts from './components/Alerts';
import MapComponent from './components/MapComponent';
import { 
  fetchBaseline, 
  fetchVillageList, 
  fetchVillageBaseline, 
  fetchLastSimulation, 
  fetchRainfallInfo,
  runSimulation, 
  BaselineData, 
  SimulationResult, 
  VillageListItem 
} from './api/client';

export default function App() {
  const [baseline, setBaseline] = useState<BaselineData | null>(null);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'dashboard' | 'alerts'>('map');
  const [villages, setVillages] = useState<VillageListItem[]>([]);
  const [selectedVillageId, setSelectedVillageId] = useState<string>('V001');
  const [rainfallInfo, setRainfallInfo] = useState<{ avg_rainfall_mm: number; rainfall_category: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [vList, lastSim] = await Promise.all([
          fetchVillageList(),
          fetchLastSimulation()
        ]);
        setVillages(vList);
        if (lastSim) {
          setSimulation(lastSim);
          if (lastSim.rainfall_info) setRainfallInfo(lastSim.rainfall_info);
        }
        
        const initialBaseline = await fetchVillageBaseline('V001');
        setBaseline(initialBaseline);
        const rInfo = await fetchRainfallInfo('V001');
        setRainfallInfo(rInfo);
      } catch (err) {
        console.error("Initialization failed", err);
      }
    };
    init();
  }, []);

  const handleVillageSelect = async (id: string) => {
    setSelectedVillageId(id);
    setLoading(true);
    try {
      const [data, rInfo] = await Promise.all([
        fetchVillageBaseline(id),
        fetchRainfallInfo(id)
      ]);
      setBaseline(data);
      setRainfallInfo(rInfo);
    } catch (err) {
      console.error("Failed to fetch village data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async (formData: { village_id: string; population: number; rainfall_forecast: string; current_crop: string }) => {
    if (!baseline) return;
    setLoading(true);
    try {
      const result = await runSimulation({
        ...formData,
        groundwater_level: baseline.groundwater_level,
      });
      setSimulation(result);
      if (result.rainfall_info) setRainfallInfo(result.rainfall_info);
      setActiveTab('dashboard');
    } catch (err) {
      console.error("Simulation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const latestRisk = simulation?.timeline[simulation.timeline.length - 1]?.risk;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-[2000]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">GramTwin AI</h1>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.2em]">Village Digital Twin</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-1 bg-zinc-100 p-1 rounded-full">
            <button 
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'map' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
            >
              <MapIcon className="w-4 h-4" />
              Map View
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'alerts' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
            >
              <Bell className="w-4 h-4" />
              Alerts
              {simulation && simulation.alerts.length > 0 && (
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'map' ? (
              <div className="space-y-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <MapComponent 
                      selectedVillageId={selectedVillageId} 
                      onVillageSelect={handleVillageSelect}
                      simulationRisk={latestRisk}
                    />
                  </div>
                  <div className="w-full lg:w-80 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
                      <div className="flex items-center gap-2 mb-4 text-zinc-400">
                        <Search className="w-4 h-4" />
                        <h3 className="text-xs font-bold uppercase tracking-widest">Village Directory</h3>
                      </div>
                      <div className="space-y-2">
                        {villages.map(v => (
                          <button
                            key={v.id}
                            onClick={() => handleVillageSelect(v.id)}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${selectedVillageId === v.id ? 'border-black bg-black text-white' : 'border-black/5 hover:border-black/20 text-zinc-600'}`}
                          >
                            <span className="font-medium text-sm">{v.name}</span>
                            <ChevronRight className={`w-4 h-4 transition-transform ${selectedVillageId === v.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {baseline && (
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 space-y-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Selected Village</p>
                          <h4 className="text-xl font-bold">{baseline.village_name}</h4>
                          <p className="text-xs text-zinc-500">{baseline.district}, {baseline.state}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-zinc-50 rounded-xl">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Population</p>
                            <p className="text-sm font-bold">{baseline.population}</p>
                          </div>
                          <div className="p-3 bg-zinc-50 rounded-xl">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Main Crop</p>
                            <p className="text-sm font-bold">{baseline.main_crop}</p>
                          </div>
                        </div>

                        <button 
                          onClick={() => setActiveTab('dashboard')}
                          className="w-full py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all shadow-lg shadow-black/10"
                        >
                          Open Dashboard
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : activeTab === 'dashboard' ? (
              <Dashboard 
                baseline={baseline} 
                simulation={simulation} 
                onSimulate={handleSimulate}
                loading={loading}
                villages={villages}
                onVillageSelect={handleVillageSelect}
                selectedVillageId={selectedVillageId}
                rainfallInfo={rainfallInfo}
              />
            ) : (
              <div className="max-w-2xl mx-auto">
                <Alerts alerts={simulation?.alerts || []} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-black/5 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-zinc-500">© 2026 GramTwin AI Prototype. Village-scale resilience modeling.</p>
          <div className="flex items-center gap-4 text-xs font-medium text-zinc-400 uppercase tracking-widest">
            <span>Water Security</span>
            <span className="w-1 h-1 bg-zinc-300 rounded-full" />
            <span>Climate Adaptation</span>
            <span className="w-1 h-1 bg-zinc-300 rounded-full" />
            <span>Rural India</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

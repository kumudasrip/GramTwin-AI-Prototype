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
    <div className="app-container">
      {/* Header */}
      <header className="navbar">
        <div className="logo-text">GramTwin AI</div>
        
        <nav className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('map')}
            className={`px-6 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'map' 
                ? 'bg-earth-primary text-white shadow-lg' 
                : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            Village Map
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-earth-primary text-white shadow-lg' 
                : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('alerts')}
            className={`px-6 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'alerts' 
                ? 'bg-earth-primary text-white shadow-lg' 
                : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            Citizen Alerts
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'map' ? (
              <div className="main-layout h-full">
                <div className="map-hero">
                  <MapComponent 
                    selectedVillageId={selectedVillageId} 
                    onVillageSelect={handleVillageSelect}
                    simulationRisk={latestRisk}
                  />
                </div>
                
                <div className="flex flex-col gap-6">
                  <div className="village-card">
                    <div className="flex items-center gap-2 mb-4 text-zinc-400">
                      <Search className="w-4 h-4" />
                      <h3 className="text-xs font-bold uppercase tracking-widest">Select Village</h3>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {villages.map(v => (
                        <button
                          key={v.id}
                          onClick={() => handleVillageSelect(v.id)}
                          className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${selectedVillageId === v.id ? 'border-earth-primary bg-earth-primary/5 text-earth-primary' : 'border-zinc-100 hover:border-zinc-200 text-zinc-500'}`}
                        >
                          <span className="font-semibold">{v.name}</span>
                          <ChevronRight className={`w-4 h-4 transition-transform ${selectedVillageId === v.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {baseline && (
                    <div className="village-card flex-1 flex flex-col">
                      <div className="space-y-1 mb-6">
                        <p className="text-[10px] font-bold text-earth-gold uppercase tracking-widest">Selected Village</p>
                        <h4 className="village-name !text-2xl !mb-2">{baseline.village_name}</h4>
                        <p className="text-sm text-zinc-500">{baseline.district}, {baseline.state}</p>
                      </div>
                      
                      <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-400">Population</span>
                          <span className="font-bold text-earth-primary">{baseline.population.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-400">Main Crop</span>
                          <span className="font-bold text-earth-primary">{baseline.main_crop}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-400">Water Level</span>
                          <span className="font-bold text-earth-primary">{baseline.groundwater_level}m</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-6">
                        <button 
                          onClick={() => setActiveTab('dashboard')}
                          className="primary-btn"
                        >
                          View Analytics
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === 'dashboard' ? (
              <div className="h-full overflow-y-auto px-8 pt-8 pr-10 custom-scrollbar">
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
              </div>
            ) : (
              <div className="max-w-5xl mx-auto h-full overflow-y-auto px-8 pt-8 pr-10 custom-scrollbar">
                <Alerts alerts={simulation?.alerts || []} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-zinc-200 mt-auto flex justify-between items-center bg-white/50 backdrop-blur-sm">
        <p className="text-xs text-zinc-500 font-medium">© 2026 GramTwin AI. Empowering Rural India.</p>
        <div className="flex items-center gap-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          <span>Water Security</span>
          <span className="w-1 h-1 bg-zinc-300 rounded-full" />
          <span>Climate Adaptation</span>
          <span className="w-1 h-1 bg-zinc-300 rounded-full" />
          <span>Rural Development</span>
        </div>
      </footer>
    </div>
  );
}

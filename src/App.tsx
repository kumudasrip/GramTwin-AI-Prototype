import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  Droplets, 
  LayoutDashboard, 
  Map as MapIcon,
  ChevronRight,
  Search,
  FileText,
  Settings,
  LogOut
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import MapComponent from './components/MapComponent';
import VillageSearch from './components/VillageSearch';
import ReportPage from './components/ReportPage';
import EnhancedVillageMap from './components/EnhancedVillageMap';
import InfrastructureRecommendations from './components/InfrastructureRecommendations';
import Login from './components/Login';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useTranslation } from './hooks/useTranslation';
import { 
  fetchVillageList, 
  fetchVillageBaseline, 
  fetchRainfallInfo,
  runSimulation, 
  BaselineData, 
  SimulationResult, 
  VillageListItem 
} from './api/client';
import { isAuthenticated, clearSession, getUserInfo, verifyCode, createSession, saveSession } from './utils/auth';

export default function App() {
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(isAuthenticated());
  const [authLoading, setAuthLoading] = useState(false);
  const [baseline, setBaseline] = useState<BaselineData | null>(null);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'dashboard' | 'village-map' | 'reports' | 'infrastructure'>('map');
  const [villages, setVillages] = useState<VillageListItem[]>([]);
  const [selectedVillageId, setSelectedVillageId] = useState<string>('NARSING_BATLA');
  const [rainfallInfo, setRainfallInfo] = useState<{ avg_rainfall_mm: number; rainfall_category: string } | null>(null);

  // Handle login
  const handleLogin = async (organizationType: string, placeName: string, verificationCode: string) => {
    setAuthLoading(true);
    try {
      // Verify the code against backend
      const isValid = await verifyCode(organizationType, placeName, verificationCode);
      if (!isValid) {
        throw new Error('Invalid verification code');
      }

      // Create and save session
      const session = createSession(organizationType, placeName);
      saveSession(session);
      setIsLoggedIn(true);
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    clearSession();
    setIsLoggedIn(false);
    setBaseline(null);
    setSimulation(null);
    setActiveTab('map');
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    const init = async () => {
      try {
        const vList = await fetchVillageList();
        setVillages(vList);
        // Don't load last simulation - only show simulation when user clicks Execute Simulation button
        
        const initialBaseline = await fetchVillageBaseline('NARSING_BATLA');
        setBaseline(initialBaseline);
        const rInfo = await fetchRainfallInfo('NARSING_BATLA');
        setRainfallInfo(rInfo);
      } catch (err) {
        console.error("Initialization failed", err);
      }
    };
    init();
  }, [isLoggedIn]);

  const handleVillageSelect = async (id: string) => {
    console.log("Village select triggered:", id);
    setSelectedVillageId(id);
    setSimulation(null); // Clear previous simulation results when switching villages
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

  // Show login page if not authenticated
  if (!isLoggedIn) {
    return (
      <Login 
        onLogin={handleLogin}
        loading={authLoading}
      />
    );
  }

  const userInfo = getUserInfo();

  return (
    <div className="app-container">
      {/* Header */}
      <header className="navbar">
        <div className="logo-text">{t('nav.gramtwinAI')}</div>
        
        {/* Search Component */}
        <div className="flex-1 max-w-md ml-8">
          <VillageSearch 
            onVillageSelect={(id) => handleVillageSelect(id)}
            selectedVillageId={selectedVillageId}
          />
        </div>
        
        <nav className="flex items-center gap-2 ml-auto">
          <button 
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'map' 
                ? 'bg-earth-primary text-white shadow-lg' 
                : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            {t('nav.map')}
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'dashboard' 
                ? 'bg-earth-primary text-white shadow-lg' 
                : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            {t('nav.dashboard')}
          </button>
          <button 
            onClick={() => setActiveTab('village-map')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'village-map' 
                ? 'bg-earth-primary text-white shadow-lg' 
                : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            <Sprout className="w-4 h-4" />
            {t('nav.soilCrops')}
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'reports' 
                ? 'bg-earth-primary text-white shadow-lg' 
                : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            {t('nav.reports')}
          </button>
          <button 
            onClick={() => setActiveTab('infrastructure')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'infrastructure' 
                ? 'bg-earth-primary text-white shadow-lg' 
                : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            {t('nav.infrastructure')}
          </button>
          <div className="ml-4 pl-4 border-l border-zinc-200 flex items-center gap-3">
            <LanguageSwitcher />
            {userInfo && (
              <div className="flex items-center gap-2 text-xs text-zinc-600 font-medium">
                <span>{userInfo.placeName}</span>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
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
            {activeTab === 'map' && (
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
                      <h3 className="text-xs font-bold uppercase tracking-widest">{t('map.selectVillage')}</h3>
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
                        <p className="text-[10px] font-bold text-earth-gold uppercase tracking-widest">{t('map.selectedVillage')}</p>
                        <h4 className="village-name !text-2xl !mb-2">{baseline.village_name}</h4>
                        <p className="text-sm text-zinc-500">{baseline.district}, {baseline.state}</p>
                      </div>
                      
                      <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-400">{t('map.population')}</span>
                          <span className="font-bold text-earth-primary">{baseline.population.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-400">{t('map.mainCrop')}</span>
                          <span className="font-bold text-earth-primary">{baseline.main_crop}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-400">{t('map.waterLevel')}</span>
                          <span className="font-bold text-earth-primary">{baseline.groundwater_level}m</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-6">
                        <button 
                          onClick={() => setActiveTab('dashboard')}
                          className="primary-btn"
                        >
                          {t('map.viewAnalytics')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'village-map' && (
              <div className="h-full overflow-y-auto px-8 pt-8 pr-10 custom-scrollbar">
                <EnhancedVillageMap 
                  selectedVillageId={selectedVillageId}
                  onVillageSelect={handleVillageSelect}
                />
              </div>
            )}

            {activeTab === 'dashboard' && (
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
            )}

            {activeTab === 'reports' && (
              <div className="h-full overflow-y-auto px-8 pt-8 pr-10 custom-scrollbar">
                <ReportPage 
                  selectedVillageId={selectedVillageId}
                  baseline={baseline}
                />
              </div>
            )}

            {activeTab === 'infrastructure' && (
              <div className="h-full overflow-y-auto px-8 pt-8 pr-10 custom-scrollbar">
                <InfrastructureRecommendations 
                  selectedVillageId={selectedVillageId}
                  baseline={baseline}
                />
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-zinc-200 mt-auto flex justify-between items-center bg-white/50 backdrop-blur-sm">
        <p className="text-xs text-zinc-500 font-medium">{t('footer.copyright')}</p>
        <div className="flex items-center gap-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          <span>{t('footer.waterSecurity')}</span>
          <span className="w-1 h-1 bg-zinc-300 rounded-full" />
          <span>{t('footer.climateAdaptation')}</span>
          <span className="w-1 h-1 bg-zinc-300 rounded-full" />
          <span>{t('footer.ruralDevelopment')}</span>
        </div>
      </footer>
    </div>
  );
}

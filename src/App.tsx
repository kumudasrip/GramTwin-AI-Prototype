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
  LogOut,
  MessageSquare,
  MessageCircle,
  Users,
  Award
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import MapComponent from './components/MapComponent';
import VillageSearch from './components/VillageSearch';
import ReportPage from './components/ReportPage';
import EnhancedVillageMap from './components/EnhancedVillageMap';
import InfrastructureRecommendations from './components/InfrastructureRecommendations';
import PostQuery from './components/PostQuery';
import CitizenQueries from './components/CitizenQueries';
import FarmerCropPlanning from './components/FarmerCropPlanning';
import GovernmentSchemes from './components/GovernmentSchemes';
import NewLoginPage from './components/NewLoginPage';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useTranslation } from './hooks/useTranslation';
import { useAuth } from './contexts/AuthContext';
import { 
  fetchVillageList, 
  fetchVillageBaseline, 
  fetchRainfallInfo,
  runSimulation, 
  BaselineData, 
  SimulationResult, 
  VillageListItem 
} from './api/client';

function AppContent() {
  const { t } = useTranslation();
  const { isAuthenticated, user, login, loginAsCitizen, logout } = useAuth();
  const [baseline, setBaseline] = useState<BaselineData | null>(null);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'dashboard' | 'village-map' | 'reports' | 'post-query' | 'citizen-queries' | 'infrastructure' | 'farmer-planning' | 'government-schemes'>('map');
  const [villages, setVillages] = useState<VillageListItem[]>([]);
  const [selectedVillageId, setSelectedVillageId] = useState<string>('NARSING_BATLA');
  const [formData, setFormData] = useState({
    population: 4500,
    rainfall_forecast: 'Below normal',
    current_crop: 'Paddy'
  });
  const [rainfallInfo, setRainfallInfo] = useState<{ avg_rainfall_mm: number; rainfall_category: string } | null>(null);

  // Handle new login flows
  const handleCitizenLogin = () => {
    loginAsCitizen();
  };

  const handleOrgLogin = async (email: string, orgType: string, placeName: string, role: 'org') => {
    login(email, orgType, placeName, role);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setBaseline(null);
    setSimulation(null);
    setActiveTab('map');
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const init = async () => {
      try {
        const vList = await fetchVillageList();
        setVillages(vList);
        
        const initialBaseline = await fetchVillageBaseline('NARSING_BATLA');
        setBaseline(initialBaseline);
        const rInfo = await fetchRainfallInfo('NARSING_BATLA');
        setRainfallInfo(rInfo);
      } catch (err) {
        console.error("Initialization failed", err);
      }
    };
    init();
  }, [isAuthenticated]);

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
  const pageContainerClass = 'h-full overflow-y-auto w-full max-w-7xl mx-auto px-4 pt-4 md:pt-6 custom-scrollbar';

  // Show new login page if not authenticated
  if (!isAuthenticated) {
    return (
      <NewLoginPage
        onCitizenLogin={handleCitizenLogin}
        onOrgLogin={handleOrgLogin}
      />
    );
  }

  return (
    <div className="app-container overflow-x-hidden">
      {/* Header */}
      <header className="navbar max-w-7xl mx-auto w-full">
        <div className="logo-text">{t('nav.gramtwinAI')}</div>
        
        {/* Search Component */}
        <div className="w-full md:w-auto md:flex-1 md:max-w-md">
          <VillageSearch 
            onVillageSelect={(id) => handleVillageSelect(id)}
            selectedVillageId={selectedVillageId}
          />
        </div>
        
        <nav className="w-full lg:flex-1 flex items-center gap-2 flex-wrap overflow-x-auto">
          <button 
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-lg font-medium text-sm md:text-base whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'map' 
                ? 'bg-earth-primary text-white shadow-lg' 
                : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            <MapIcon className="w-5 h-5" />
            {t('nav.map')}
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium text-sm md:text-base whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'dashboard' 
                ? 'bg-earth-primary text-white shadow-lg' 
                : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            {t('nav.dashboard')}
          </button>
          <button 
            onClick={() => setActiveTab('village-map')}
            className={`px-4 py-2 rounded-lg font-medium text-sm md:text-base whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'village-map' 
                ? 'bg-earth-primary text-white shadow-lg' 
                : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            <Sprout className="w-5 h-5" />
            {t('nav.soilCrops')}
          </button>
          {user?.role === 'org' && (
            <button 
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-lg font-medium text-sm md:text-base whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'reports' 
                  ? 'bg-earth-primary text-white shadow-lg' 
                  : 'text-zinc-500 hover:bg-zinc-100'
              }`}
            >
              <FileText className="w-5 h-5" />
              {t('nav.reports')}
            </button>
          )}
          {user?.role === 'org' && (
            <button 
              onClick={() => setActiveTab('citizen-queries')}
              className={`px-4 py-2 rounded-lg font-medium text-sm md:text-base whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'citizen-queries' 
                  ? 'bg-earth-primary text-white shadow-lg' 
                  : 'text-zinc-500 hover:bg-zinc-100'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              {t('citizenQueries.title')}
            </button>
          )}
          {user?.role === 'citizen' && (
            <button 
              onClick={() => setActiveTab('post-query')}
              className={`px-4 py-2 rounded-lg font-medium text-sm md:text-base whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === 'post-query' 
                  ? 'bg-earth-primary text-white shadow-lg' 
                  : 'text-zinc-500 hover:bg-zinc-100'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              {t('postQuery.postQuery')}
            </button>
          )}
          <button 
            onClick={() => setActiveTab('infrastructure')}
            className={`px-4 py-2 rounded-lg font-medium text-sm md:text-base whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'infrastructure' 
                ? 'bg-earth-primary text-white shadow-lg' 
                : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            <Settings className="w-5 h-5" />
            {t('nav.infrastructure')}
          </button>
          <button 
            onClick={() => setActiveTab('farmer-planning')}
            className={`px-4 py-2 rounded-lg font-medium text-sm md:text-base whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'farmer-planning' 
                ? 'bg-earth-primary text-white shadow-lg' 
                : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            <Users className="w-5 h-5" />
            Farmer Planning
          </button>
          <button 
            onClick={() => setActiveTab('government-schemes')}
            className={`px-4 py-2 rounded-lg font-medium text-sm md:text-base whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'government-schemes' 
                ? 'bg-earth-primary text-white shadow-lg' 
                : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            <Award className="w-5 h-5" />
            Schemes
          </button>
        </nav>

        <div className="flex items-center gap-2 flex-wrap ml-auto">
          <LanguageSwitcher />
          <button 
            onClick={handleLogout}
            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-600"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
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
              <div className="main-layout h-full w-full max-w-7xl mx-auto px-4 pt-4 md:pt-6">
                <div className="map-hero w-full md:w-2/3">
                  <MapComponent 
                    selectedVillageId={selectedVillageId} 
                    onVillageSelect={handleVillageSelect}
                    simulationRisk={latestRisk}
                  />
                </div>
                
                <div className="flex flex-col gap-4 md:gap-6 w-full md:w-1/3">
                  <div className="village-card">
                    <div className="flex items-center gap-2 mb-4 text-zinc-400">
                      <Search className="w-5 h-5" />
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
                          <ChevronRight className={`w-5 h-5 transition-transform ${selectedVillageId === v.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
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
                          <span className="font-bold text-earth-primary">
                            {typeof baseline.groundwater_level === 'number'
                              ? `${baseline.groundwater_level}m`
                              : baseline.groundwater_level}
                          </span>
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
              <div className={pageContainerClass}>
                <EnhancedVillageMap 
                  selectedVillageId={selectedVillageId}
                  onVillageSelect={handleVillageSelect}
                />
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className={pageContainerClass}>
                <Dashboard 
                  baseline={baseline} 
                  simulation={simulation} 
                  onSimulate={handleSimulate}
                  loading={loading}
                  villages={villages}
                  onVillageSelect={handleVillageSelect}
                  selectedVillageId={selectedVillageId}
                  rainfallInfo={rainfallInfo}
                  formData={formData}
                  setFormData={setFormData}
                />
              </div>
            )}

            {activeTab === 'reports' && (
              <div className={pageContainerClass}>
                <ReportPage 
                  selectedVillageId={selectedVillageId}
                  baseline={baseline}
                />
              </div>
            )}

            {activeTab === 'citizen-queries' && (
              <div className={pageContainerClass}>
                <CitizenQueries
                  selectedVillageId={selectedVillageId}
                />
              </div>
            )}

            {activeTab === 'post-query' && (
              <div className={pageContainerClass}>
                <PostQuery 
                  selectedVillageId={selectedVillageId}
                />
              </div>
            )}

            {activeTab === 'infrastructure' && (
              <div className={pageContainerClass}>
                <InfrastructureRecommendations 
                  selectedVillageId={selectedVillageId}
                  baseline={baseline}
                />
              </div>
            )}

            {activeTab === 'farmer-planning' && (
              <div className={pageContainerClass}>
                <FarmerCropPlanning 
                  villageId={selectedVillageId}
                />
              </div>
            )}

            {activeTab === 'government-schemes' && (
              <div className={pageContainerClass}>
                <GovernmentSchemes 
                  selectedVillageId={selectedVillageId}
                  currentCrop={formData.current_crop}
                />
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 py-6 border-t border-zinc-200 mt-auto flex flex-wrap justify-between items-center gap-2 bg-white/50 backdrop-blur-sm">
        <p className="text-xs text-zinc-500 font-medium">{t('footer.copyright')}</p>
        <div className="flex flex-wrap items-center gap-2 md:gap-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
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

export default AppContent;


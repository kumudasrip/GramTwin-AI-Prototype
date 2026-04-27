import React, { useState, useEffect } from 'react';
import { Play, Droplets, Sprout, Users, MapPin } from 'lucide-react';
import { BaselineData, SimulationResult, VillageListItem } from '../api/client';
import MapComponent from './MapComponent';
import { useTranslation } from '../hooks/useTranslation';

interface DashboardProps {
  baseline: BaselineData | null;
  simulation: SimulationResult | null;
  onSimulate: (formData: { village_id: string; population: number; rainfall_forecast: string; current_crop: string }) => void;
  loading: boolean;
  villages: VillageListItem[];
  onVillageSelect: (id: string) => void;
  selectedVillageId: string;
  rainfallInfo: { avg_rainfall_mm: number; rainfall_category: string } | null;
  formData?: { population: number; rainfall_forecast: string; current_crop: string };
  setFormData?: React.Dispatch<React.SetStateAction<{ population: number; rainfall_forecast: string; current_crop: string }>>;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  baseline, 
  simulation, 
  onSimulate, 
  loading, 
  villages, 
  onVillageSelect,
  selectedVillageId,
  rainfallInfo,
  formData: parentFormData,
  setFormData: setParentFormData
}) => {
  const { t } = useTranslation();
  const [localFormData, setLocalFormData] = useState({
    population: 4500,
    rainfall_forecast: 'Below normal',
    current_crop: 'Paddy'
  });

  useEffect(() => {
    if (baseline) {
      const updated = {
        population: baseline.population,
        rainfall_forecast: localFormData.rainfall_forecast,
        current_crop: baseline.main_crop
      };
      setLocalFormData(updated);
      if (setParentFormData) setParentFormData(updated);
    }
  }, [baseline]);

  useEffect(() => {
    if (rainfallInfo) {
      const updated = {
        ...localFormData,
        rainfall_forecast: rainfallInfo.rainfall_category
      };
      setLocalFormData(updated);
      if (setParentFormData) setParentFormData(updated);
    }
  }, [rainfallInfo]);

  const getGroundwaterStatus = (pop: number) => {
    if (pop < 100) return { label: t('dashboard.excellent'), color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (pop <= 1000) return { label: t('dashboard.good'), color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
    if (pop <= 5000) return { label: t('dashboard.moderate'), color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
    if (pop <= 10000) return { label: t('dashboard.stressed'), color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
    return { label: t('dashboard.critical'), color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
  };

  const gwStatus = getGroundwaterStatus(localFormData.population);

  if (!baseline) return <div className="p-8 text-center">{t('dashboard.loadingVillageProfile')}</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (setParentFormData) setParentFormData(localFormData);
    onSimulate({ ...localFormData, village_id: selectedVillageId });
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      {/* Village Selection & About */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
        <div className="w-full lg:w-2/3 space-y-6">
          <div className="dashboard-card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-5 h-5 text-earth-primary" />
                <h2 className="text-xl md:text-2xl font-bold text-earth-primary">{t('dashboard.selectVillage')}</h2>
              </div>
              {baseline.village_name && (
                <div className="text-right">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('dashboard.dataSource')}</p>
                  <p className="text-xs text-zinc-500">{t('dashboard.censusIMD')}</p>
                </div>
              )}
            </div>
            <select
              value={selectedVillageId}
              onChange={(e) => onVillageSelect(e.target.value)}
              className="select-input"
            >
              {villages.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            
            {baseline.district && (
              <div className="mt-6 flex flex-wrap gap-2 md:gap-4 text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                <span className="px-3 py-1.5 bg-zinc-50 rounded-lg border border-zinc-100">{t('dashboard.district')}: {baseline.district}</span>
                <span className="px-3 py-1.5 bg-zinc-50 rounded-lg border border-zinc-100">{t('dashboard.state')}: {baseline.state}</span>
              </div>
            )}
          </div>

          {/* Map Preview */}
          <div className="map-dashboard">
            <MapComponent 
              selectedVillageId={selectedVillageId} 
              onVillageSelect={onVillageSelect} 
              simulationRisk={simulation?.timeline[simulation.timeline.length - 1]?.risk}
            />
          </div>

          {/* Village Profile Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 md:gap-6">
            <div className="dashboard-card !mb-0 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 bg-earth-primary/10 rounded-2xl flex items-center justify-center text-earth-primary border border-earth-primary/10">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('dashboard.population')}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-2xl xl:text-3xl font-bold text-earth-primary leading-none break-words">{localFormData.population.toLocaleString()}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${localFormData.population > 5000 ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {t('dashboard.live')}
                  </span>
                </div>
              </div>
            </div>
            <div className="dashboard-card !mb-0 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 bg-earth-secondary/10 rounded-2xl flex items-center justify-center text-earth-secondary border border-earth-secondary/10">
                <Sprout className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('dashboard.mainCrop')}</p>
                <p className="text-2xl xl:text-3xl font-bold text-earth-primary break-words leading-none">{localFormData.current_crop}</p>
              </div>
            </div>
            <div className="dashboard-card !mb-0 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
              <div className={`w-14 h-14 ${gwStatus.bg} rounded-2xl flex items-center justify-center ${gwStatus.color} border ${gwStatus.border}`}>
                <Droplets className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('dashboard.groundwater')}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <p className={`text-xl xl:text-2xl font-bold ${gwStatus.color} leading-none break-words`}>{gwStatus.label}</p>
                  <span className={`${gwStatus.color} leading-none`}>✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 md:gap-6">
          <div className="dashboard-card bg-white border-earth-primary/10 shadow-xl flex flex-col justify-center min-h-[280px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-earth-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-6 leading-tight text-earth-primary">GramTwin AI <br/><span className="text-earth-gold">{t('dashboard.intelligence')}</span></h2>
              <p className="text-sm md:text-base text-zinc-600 leading-relaxed">
                {t('dashboard.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Form */}
      <div className="dashboard-card">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-6 md:mb-8">
          <h3 className="card-title !mb-0 !border-none">{t('dashboard.simulationScenarios')}</h3>
          {rainfallInfo && (
            <div className="text-left md:text-right">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('dashboard.historicalRainfall')}</p>
              <p className="text-sm md:text-lg font-bold text-earth-gold">{rainfallInfo.avg_rainfall_mm} mm → {rainfallInfo.rainfall_category}</p>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row md:flex-wrap gap-4 md:gap-8 md:items-end">
          <div className="space-y-3 w-full md:flex-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t('dashboard.rainfallForecast')}</label>
            <select
              value={localFormData.rainfall_forecast}
              onChange={(e) => {
                const updated = {...localFormData, rainfall_forecast: e.target.value};
                setLocalFormData(updated);
                if (setParentFormData) setParentFormData(updated);
              }}
              className="select-input !py-4"
            >
              <option value="Below normal">{t('dashboard.below_normal')}</option>
              <option value="Normal">{t('dashboard.normal')}</option>
              <option value="Above normal">{t('dashboard.above_normal')}</option>
            </select>
          </div>
          <div className="space-y-3 w-full md:flex-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t('dashboard.population')}</label>
            <input
              type="number"
              value={localFormData.population}
              onChange={(e) => {
                const updated = {...localFormData, population: parseInt(e.target.value) || 0};
                setLocalFormData(updated);
                if (setParentFormData) setParentFormData(updated);
              }}
              className="select-input !py-4"
            />
          </div>
          <div className="space-y-3 w-full md:flex-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t('dashboard.mainCrop')}</label>
            <select
              value={localFormData.current_crop}
              onChange={(e) => {
                const updated = {...localFormData, current_crop: e.target.value};
                setLocalFormData(updated);
                if (setParentFormData) setParentFormData(updated);
              }}
              className="select-input !py-4"
            >
              <option value="Paddy">Paddy</option>
              <option value="Millets">Millets</option>
              <option value="Pulses">Pulses</option>
            </select>
          </div>
          <div className="w-full flex justify-center mt-4 md:mt-8">
            <button
              type="submit"
              disabled={loading}
              className="primary-btn w-full md:w-auto"
            >
              <div className="flex items-center justify-center gap-3">
                <Play className={`w-5 h-5 ${loading ? 'animate-pulse' : ''}`} />
                {loading ? t('dashboard.processingSimulation') : t('dashboard.executeSimulation')}
              </div>
            </button>
          </div>
        </form>
      </div>

      {/* Results Tables */}
      {simulation && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          {/* Water Risk Timeline */}
          <div className="dashboard-card !p-0 overflow-hidden">
            <div className="px-3 md:px-4 pt-3 md:pt-4">
              <h3 className="card-title">{t('dashboard.waterRiskTimeline')}</h3>
            </div>
            <div className="px-3 md:px-4 pb-3 md:pb-4 overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('dashboard.month')}</th>
                    <th>{t('dashboard.waterStock')}</th>
                    <th className="text-right">{t('dashboard.riskLevel')}</th>
                  </tr>
                </thead>
                <tbody>
                  {simulation.timeline.map((item, idx) => (
                    <tr key={idx}>
                      <td className="font-bold text-lg">{item.month}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-3 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${
                                item.water_stock >= 70 ? 'bg-emerald-500' :
                                item.water_stock >= 40 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${item.water_stock}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono font-bold w-10">{item.water_stock}%</span>
                        </div>
                      </td>
                      <td className="text-right">
                        <span className={`status-badge ${
                          item.risk === 'Low' ? 'status-low' :
                          item.risk === 'Medium' ? 'status-medium' :
                          'status-high'
                        }`}>
                          {item.risk === 'Low' ? t('dashboard.low') : 
                           item.risk === 'Medium' ? t('dashboard.medium') : t('dashboard.high')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Crop Recommendations */}
          <div className="dashboard-card !p-0 overflow-hidden">
            <div className="px-3 md:px-4 pt-3 md:pt-4">
              <h3 className="card-title">{t('dashboard.cropRecommendations')}</h3>
            </div>
            <div className="px-3 md:px-4 pb-3 md:pb-4 overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('dashboard.crop')}</th>
                    <th>{t('dashboard.suitability')}</th>
                    <th>Market Value</th>
                    <th>{t('dashboard.reason')}</th>
                  </tr>
                </thead>
                <tbody>
                  {simulation.crop_recommendations.map((item, idx) => (
                    <tr key={idx}>
                      <td className="font-bold text-lg">{item.crop}</td>
                      <td>
                        <span className={`status-badge ${
                          item.suitability === 'High' ? 'status-low' :
                          item.suitability === 'Medium' ? 'status-medium' :
                          'status-high'
                        }`}>
                          {item.suitability === 'High' ? t('dashboard.high') : 
                           item.suitability === 'Medium' ? t('dashboard.medium') : t('dashboard.low')}
                        </span>
                      </td>
                      <td className="font-semibold text-earth-primary">{item.market_value || 'N/A'}</td>
                      <td className="text-sm text-zinc-500 leading-relaxed">{item.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;


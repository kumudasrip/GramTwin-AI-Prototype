import React, { useState, useEffect } from 'react';
import { Play, Droplets, Sprout, Users, MapPin } from 'lucide-react';
import { BaselineData, SimulationResult, VillageListItem } from '../api/client';
import MapComponent from './MapComponent';

interface DashboardProps {
  baseline: BaselineData | null;
  simulation: SimulationResult | null;
  onSimulate: (formData: { village_id: string; population: number; rainfall_forecast: string; current_crop: string }) => void;
  loading: boolean;
  villages: VillageListItem[];
  onVillageSelect: (id: string) => void;
  selectedVillageId: string;
  rainfallInfo: { avg_rainfall_mm: number; rainfall_category: string } | null;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  baseline, 
  simulation, 
  onSimulate, 
  loading, 
  villages, 
  onVillageSelect,
  selectedVillageId,
  rainfallInfo
}) => {
  const [formData, setFormData] = useState({
    population: 4500,
    rainfall_forecast: 'Below normal',
    current_crop: 'Paddy'
  });

  useEffect(() => {
    if (baseline) {
      setFormData(prev => ({
        ...prev,
        population: baseline.population,
        current_crop: baseline.main_crop
      }));
    }
  }, [baseline]);

  useEffect(() => {
    if (rainfallInfo) {
      setFormData(prev => ({
        ...prev,
        rainfall_forecast: rainfallInfo.rainfall_category
      }));
    }
  }, [rainfallInfo]);

  if (!baseline) return <div className="p-8 text-center">Loading village profile...</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSimulate({ ...formData, village_id: selectedVillageId });
  };

  return (
    <div className="space-y-8">
      {/* Village Selection & About */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold">Select Village</h2>
              </div>
              {baseline.village_name && (
                <div className="text-right">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Data Source</p>
                  <p className="text-[10px] text-zinc-500">Census-style & IMD-style CSV</p>
                </div>
              )}
            </div>
            <select
              value={selectedVillageId}
              onChange={(e) => onVillageSelect(e.target.value)}
              className="w-full p-3 rounded-xl border border-black/10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              {villages.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            
            {baseline.district && (
              <div className="mt-4 flex gap-4 text-xs text-zinc-500 font-medium">
                <span className="px-2 py-1 bg-zinc-100 rounded-md">District: {baseline.district}</span>
                <span className="px-2 py-1 bg-zinc-100 rounded-md">State: {baseline.state}</span>
              </div>
            )}
          </div>

          {/* Map Preview */}
          <div className="h-64">
            <MapComponent 
              selectedVillageId={selectedVillageId} 
              onVillageSelect={onVillageSelect} 
              simulationRisk={simulation?.timeline[simulation.timeline.length - 1]?.risk}
            />
          </div>

          {/* Village Profile Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Population</p>
                <p className="text-2xl font-semibold">{baseline.population}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Main Crop</p>
                <p className="text-2xl font-semibold">{baseline.main_crop}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Groundwater</p>
                <p className="text-2xl font-semibold">{baseline.groundwater_level}</p>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-indigo-600 text-white p-8 rounded-2xl shadow-lg flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-4">About GramTwin AI</h2>
          <p className="text-indigo-100 leading-relaxed">
            A village-scale digital twin prototype for rural India. 
            It simulates water, crop, and risk impacts using historical rainfall patterns and census data to help communities build climate resilience.
          </p>
        </div>
      </div>

      {/* Simulation Form */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-black/5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Simulation Scenarios</h3>
          {rainfallInfo && (
            <div className="text-right">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Historical Rainfall (Last 12m)</p>
              <p className="text-sm font-semibold text-indigo-600">{rainfallInfo.avg_rainfall_mm} mm → {rainfallInfo.rainfall_category}</p>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Rainfall Forecast</label>
            <select
              value={formData.rainfall_forecast}
              onChange={(e) => setFormData({ ...formData, rainfall_forecast: e.target.value })}
              className="w-full p-3 rounded-xl border border-black/10 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="Below normal">Below normal</option>
              <option value="Normal">Normal</option>
              <option value="Above normal">Above normal</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Population</label>
            <input
              type="number"
              value={formData.population}
              onChange={(e) => setFormData({ ...formData, population: parseInt(e.target.value) || 0 })}
              className="w-full p-3 rounded-xl border border-black/10 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Main Crop</label>
            <select
              value={formData.current_crop}
              onChange={(e) => setFormData({ ...formData, current_crop: e.target.value })}
              className="w-full p-3 rounded-xl border border-black/10 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="Paddy">Paddy</option>
              <option value="Millets">Millets</option>
              <option value="Pulses">Pulses</option>
            </select>
          </div>
          <div className="md:col-span-3 flex justify-center mt-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex items-center gap-2 px-12 py-4 bg-black text-white rounded-full font-medium transition-all hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
              {loading ? 'Simulating...' : 'Run Simulation'}
            </button>
          </div>
        </form>
      </div>

      {/* Results Tables */}
      {simulation && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Water Risk Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
            <div className="p-6 border-b border-black/5 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Water Risk Timeline</h3>
              <span className="text-xs text-zinc-400">3 Month Projection</span>
            </div>
            <div className="p-6 space-y-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    <th className="pb-3">Month</th>
                    <th className="pb-3">Water Stock</th>
                    <th className="pb-3 text-right">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {simulation.timeline.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-4 font-medium">{item.month}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${
                                item.water_stock >= 70 ? 'bg-emerald-500' :
                                item.water_stock >= 40 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${item.water_stock}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono w-8">{item.water_stock}%</span>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.risk === 'Low' ? 'bg-emerald-100 text-emerald-800' :
                          item.risk === 'Medium' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Crop Recommendations */}
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
            <div className="p-6 border-b border-black/5">
              <h3 className="font-semibold text-lg">Crop Recommendations</h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Crop</th>
                  <th className="px-6 py-3">Suitability</th>
                  <th className="px-6 py-3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {simulation.crop_recommendations.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 font-medium">{item.crop}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.suitability === 'High' ? 'bg-emerald-100 text-emerald-800' :
                        item.suitability === 'Medium' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.suitability}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

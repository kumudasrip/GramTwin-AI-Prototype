import React, { useState, useEffect } from 'react';
import { AlertTriangle, Droplets, TrendingDown, Users, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface FarmerCrop {
  farmerId: string;
  farmerName: string;
  selectedCrop: string;
  timestamp: number;
}

const FarmerCropPlanning: React.FC<{ villageId: string }> = ({ villageId }) => {
  const { t } = useTranslation();
  const [farmerCrops, setFarmerCrops] = useState<FarmerCrop[]>([]);
  const [cropStats, setCropStats] = useState<Record<string, number>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [farmerNameInput, setFarmerNameInput] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [editingFarmerId, setEditingFarmerId] = useState<string | null>(null);
  const [editFarmerName, setEditFarmerName] = useState('');
  const [editCrop, setEditCrop] = useState('');
  const [editError, setEditError] = useState('');

  const crops = ['Paddy', 'Millets', 'Pulses', 'Wheat', 'Cotton'];
  const waterIntensiveCrops = ['Paddy', 'Sugarcane', 'Cotton'];
  const [selectedCropInput, setSelectedCropInput] = useState(crops[0]);

  const normalizeName = (name: string) => name.trim().toLowerCase();

  const isDuplicateName = (name: string, excludeFarmerId?: string): boolean => {
    const normalized = normalizeName(name);
    return farmerCrops.some(
      (farmer) => farmer.farmerId !== excludeFarmerId && normalizeName(farmer.farmerName) === normalized
    );
  };

  // Load farmer crop choices from localStorage
  useEffect(() => {
    const storageKey = `farmerCrops_${villageId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const crops = JSON.parse(stored);
      setFarmerCrops(crops);
      calculateStats(crops);
    }
  }, [villageId]);

  // Calculate crop statistics and generate warnings
  const calculateStats = (crops: FarmerCrop[]) => {
    const stats: Record<string, number> = {};
    crops.forEach(crop => {
      stats[crop.selectedCrop] = (stats[crop.selectedCrop] || 0) + 1;
    });
    setCropStats(stats);

    // Generate warnings
    const newWarnings: string[] = [];
    const totalFarmers = crops.length;

    if (totalFarmers > 0) {
      // Check for overcrowding
      Object.entries(stats).forEach(([crop, count]) => {
        const percentage = (count / totalFarmers) * 100;
        if (percentage >= 50) {
          newWarnings.push(
            `⚠️ Market Alert: ${Math.round(percentage)}% of farmers chose ${crop}. High risk of market saturation and reduced profits!`
          );
        } else if (percentage >= 33) {
          newWarnings.push(
            `📊 Market Warning: ${Math.round(percentage)}% of farmers chose ${crop}. Monitor market prices carefully.`
          );
        }
      });

      // Check for water scarcity risk
      let waterIntensiveCount = 0;
      let waterIntensiveCropsList: string[] = [];
      Object.entries(stats).forEach(([crop, count]) => {
        if (waterIntensiveCrops.includes(crop)) {
          waterIntensiveCount += count;
          waterIntensiveCropsList.push(`${crop} (${count})`);
        }
      });

      if (waterIntensiveCount / totalFarmers >= 0.6) {
        newWarnings.push(
          `💧 Water Scarcity Alert: ${waterIntensiveCropsList.join(
            ', '
          )} selected by ${waterIntensiveCount} farmers. High water demand risk! Consider drought-resistant alternatives.`
        );
      }
    }

    setWarnings(newWarnings);
  };

  const handleRemoveFarmer = (farmerId: string) => {
    const updated = farmerCrops.filter(fc => fc.farmerId !== farmerId);
    const storageKey = `farmerCrops_${villageId}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setFarmerCrops(updated);
    calculateStats(updated);
    if (editingFarmerId === farmerId) {
      setEditingFarmerId(null);
      setEditFarmerName('');
      setEditCrop('');
      setEditError('');
    }
  };

  const handleRegisterFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    const cleanedName = farmerNameInput.trim();
    if (!cleanedName) return;

    if (isDuplicateName(cleanedName)) {
      setRegisterError('This farmer name is already registered for this village.');
      return;
    }

    const newFarmer: FarmerCrop = {
      farmerId: `farmer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      farmerName: cleanedName,
      selectedCrop: selectedCropInput,
      timestamp: Date.now(),
    };

    const updated = [newFarmer, ...farmerCrops];
    const storageKey = `farmerCrops_${villageId}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setFarmerCrops(updated);
    calculateStats(updated);
    setFarmerNameInput('');
    setSelectedCropInput(crops[0]);
  };

  const startEditingFarmer = (farmer: FarmerCrop) => {
    setEditingFarmerId(farmer.farmerId);
    setEditFarmerName(farmer.farmerName);
    setEditCrop(farmer.selectedCrop);
    setEditError('');
  };

  const cancelEditingFarmer = () => {
    setEditingFarmerId(null);
    setEditFarmerName('');
    setEditCrop('');
    setEditError('');
  };

  const saveEditedFarmer = () => {
    if (!editingFarmerId) return;
    const cleanedName = editFarmerName.trim();
    if (!cleanedName) {
      setEditError('Farmer name is required.');
      return;
    }

    if (isDuplicateName(cleanedName, editingFarmerId)) {
      setEditError('Another farmer with this name already exists.');
      return;
    }

    const updated = farmerCrops.map((farmer) =>
      farmer.farmerId === editingFarmerId
        ? { ...farmer, farmerName: cleanedName, selectedCrop: editCrop || farmer.selectedCrop }
        : farmer
    );

    const storageKey = `farmerCrops_${villageId}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setFarmerCrops(updated);
    calculateStats(updated);
    cancelEditingFarmer();
  };

  const getCropWarning = (crop: string): string | null => {
    const count = cropStats[crop] || 0;
    const totalFarmers = farmerCrops.length;

    if (totalFarmers === 0) return null;

    const percentage = (count / totalFarmers) * 100;

    if (percentage >= 50) {
      return `Very High Overcrowding Risk (${count}/${totalFarmers} farmers)`;
    } else if (percentage >= 33) {
      return `Moderate Overcrowding Risk (${count}/${totalFarmers} farmers)`;
    } else if (waterIntensiveCrops.includes(crop) && count > totalFarmers * 0.4) {
      return 'Water Scarcity Risk';
    }

    return null;
  };

  // Generate pie chart data
  const generatePieChartData = () => {
    const totalFarmers = farmerCrops.length;
    if (totalFarmers === 0) return [];

    return crops
      .map((crop) => ({
        crop,
        count: cropStats[crop] || 0,
        percentage: ((cropStats[crop] || 0) / totalFarmers) * 100,
      }))
      .filter((item) => item.count > 0);
  };

  // Calculate risk distribution
  const getRiskDistribution = () => {
    let lowRisk = 0;
    let moderateRisk = 0;
    let highRisk = 0;

    farmerCrops.forEach((fc) => {
      const warning = getCropWarning(fc.selectedCrop);
      if (!warning) {
        lowRisk++;
      } else if (warning.includes('Moderate')) {
        moderateRisk++;
      } else {
        highRisk++;
      }
    });

    return { lowRisk, moderateRisk, highRisk };
  };

  const cropColors: Record<string, string> = {
    Paddy: '#3B82F6',
    Millets: '#F59E0B',
    Pulses: '#8B5CF6',
    Wheat: '#EC4899',
    Cotton: '#06B6D4',
  };

  // Get color based on crop adoption percentage (risk level) - Modern attractive colors
  const getColorByRisk = (percentage: number): string => {
    if (percentage >= 50) {
      return '#FF6B6B'; // Rose Red - High risk (vibrant red)
    } else if (percentage >= 33) {
      return '#FF9F43'; // Vibrant Orange - Moderate risk
    } else {
      return '#10B981'; // Emerald Green - Low risk (fresh)
    }
  };

  // Get gradient colors for progress bars
  const getGradientByRisk = (percentage: number): string => {
    if (percentage >= 50) {
      return 'from-orange-400 via-red-500 to-rose-600'; // High risk gradient
    } else if (percentage >= 33) {
      return 'from-yellow-400 via-orange-400 to-orange-500'; // Moderate gradient
    } else {
      return 'from-emerald-400 via-teal-500 to-cyan-600'; // Low risk gradient
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-5 h-5 bg-green-100 rounded-lg flex items-center justify-center border border-green-200">
          <Users className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-earth-primary">Farmer Crop Planning</h2>
          <p className="text-sm text-zinc-500">Coordinate crop choices to avoid market saturation and water scarcity</p>
        </div>
      </div>

        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-earth-primary mb-4">Register Farmer Crop</h3>
          <form onSubmit={handleRegisterFarmer} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-zinc-600 block mb-1">Farmer Name</label>
              <input
                type="text"
                value={farmerNameInput}
                onChange={(e) => setFarmerNameInput(e.target.value)}
                placeholder="Enter farmer name"
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-earth-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-600 block mb-1">Crop</label>
              <select
                value={selectedCropInput}
                onChange={(e) => setSelectedCropInput(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-earth-primary/30"
              >
                {crops.map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={!farmerNameInput.trim()}
                className="w-full px-4 py-2 bg-earth-primary text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Register
              </button>
            </div>
          </form>
          {registerError && (
            <p className="text-xs text-red-600 mt-3 font-semibold">{registerError}</p>
          )}
        </div>

      {/* Alerts Section */}
      {warnings.length > 0 && (
        <div className="space-y-3">
          {warnings.map((warning, idx) => (
            <div key={idx} className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">{warning}</p>
            </div>
          ))}
        </div>
      )}

      {/* Visual Analysis Charts */}
      {farmerCrops.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - Crop Distribution */}
          <div className="dashboard-card bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-100 to-emerald-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Crop Distribution</h3>
            </div>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative w-56 h-56 flex items-center justify-center">
                <svg width="220" height="220" viewBox="0 0 220 220" className="drop-shadow-lg">
                  <defs>
                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
                    </filter>
                  </defs>
                  {(() => {
                    const pieData = generatePieChartData();
                    let currentAngle = -90;

                    return pieData.map((item, idx) => {
                      const sliceAngle = (item.percentage / 100) * 360;
                      const startAngle = currentAngle;
                      const endAngle = currentAngle + sliceAngle;

                      const startRad = (startAngle * Math.PI) / 180;
                      const endRad = (endAngle * Math.PI) / 180;

                      const x1 = 110 + 75 * Math.cos(startRad);
                      const y1 = 110 + 75 * Math.sin(startRad);
                      const x2 = 110 + 75 * Math.cos(endRad);
                      const y2 = 110 + 75 * Math.sin(endRad);

                      // Better centered label position
                      const midAngle = (startAngle + endAngle) / 2;
                      const midRad = (midAngle * Math.PI) / 180;
                      const labelX = 110 + 55 * Math.cos(midRad);
                      const labelY = 110 + 55 * Math.sin(midRad);

                      const largeArc = sliceAngle > 180 ? 1 : 0;

                      const pathData = [
                        `M 110 110`,
                        `L ${x1.toFixed(2)} ${y1.toFixed(2)}`,
                        `A 75 75 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
                        'Z',
                      ].join(' ');

                      currentAngle = endAngle;
                      // Use risk-based color instead of crop color
                      const baseColor = getColorByRisk(item.percentage);

                      return (
                        <g key={idx}>
                          <path
                            d={pathData}
                            fill={baseColor}
                            stroke="white"
                            strokeWidth="3"
                            opacity="0.95"
                            filter="url(#shadow)"
                            className="hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                            style={{ filter: 'url(#shadow)' }}
                          />
                          {item.percentage > 8 && (
                            <text
                              x={labelX}
                              y={labelY}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="text-sm font-bold fill-white"
                              style={{ 
                                pointerEvents: 'none',
                                textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                                letterSpacing: '0.5px'
                              }}
                            >
                              {Math.round(item.percentage)}%
                            </text>
                          )}
                        </g>
                      );
                    });
                  })()}
                </svg>
                {/* Center circle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-white rounded-full shadow-lg flex flex-col items-center justify-center border-4 border-emerald-50">
                    <div className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-600 bg-clip-text text-transparent">{farmerCrops.length}</div>
                    <div className="text-xs text-slate-500 font-medium">Farmers</div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Legend */}
              <div className="w-full mt-8 space-y-3 bg-white bg-opacity-60 rounded-xl p-4">
                {generatePieChartData().map((item) => (
                  <div key={item.crop} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="w-5 h-5 rounded-full shadow-sm flex-shrink-0"
                        style={{ backgroundColor: getColorByRisk(item.percentage) }}
                      />
                      <span className="text-sm font-semibold text-slate-700">{item.crop}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{Math.round(item.percentage)}%</span>
                      <span className="text-sm font-bold text-slate-900">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Distribution Chart */}
          <div className="dashboard-card bg-gradient-to-br from-slate-50 via-orange-50 to-rose-50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-rose-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Risk Analysis</h3>
            </div>
            
            <div className="space-y-5 py-4">
              {(() => {
                const { lowRisk, moderateRisk, highRisk } = getRiskDistribution();
                const total = farmerCrops.length;
                const riskData = [
                  { 
                    label: 'Low Risk', 
                    count: lowRisk, 
                    percentage: (lowRisk / total) * 100, 
                    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
                    icon: CheckCircle,
                    bgColor: 'bg-emerald-50 border-emerald-200',
                    color: '#10B981'
                  },
                  {
                    label: 'Moderate Risk',
                    count: moderateRisk,
                    percentage: (moderateRisk / total) * 100,
                    gradient: 'from-yellow-400 via-orange-400 to-orange-500',
                    icon: AlertTriangle,
                    bgColor: 'bg-orange-50 border-orange-200',
                    color: '#FF9F43'
                  },
                  { 
                    label: 'High Risk', 
                    count: highRisk, 
                    percentage: (highRisk / total) * 100, 
                    gradient: 'from-orange-400 via-red-500 to-rose-600',
                    icon: AlertCircle,
                    bgColor: 'bg-rose-50 border-rose-200',
                    color: '#FF6B6B'
                  },
                ];

                return riskData.map((risk) => {
                  const IconComponent = risk.icon;
                  return (
                    <div key={risk.label} className={`p-4 rounded-xl border-2 ${risk.bgColor} transition-all hover:shadow-md`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-5 h-5" style={{
                            color: risk.color
                          }} />
                          <span className="font-semibold text-slate-800">{risk.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-sm font-bold text-slate-900">{risk.count}</div>
                            <div className="text-xs text-slate-500">{Math.round(risk.percentage)}%</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Gradient Progress Bar */}
                      <div className="w-full bg-white rounded-full h-4 overflow-hidden shadow-sm border border-slate-200">
                        <div
                          className={`h-4 rounded-full bg-gradient-to-r ${risk.gradient} transition-all duration-500 ease-out shadow-sm`}
                          style={{ width: `${risk.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}

              {/* Summary Stats */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mt-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-700">Total Farmers:</span>
                    <span className="text-lg font-bold text-slate-900">{farmerCrops.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">Overall Risk Score:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-orange-400 to-rose-600 transition-all"
                          style={{
                            width: `${(() => {
                              const { lowRisk, moderateRisk, highRisk } = getRiskDistribution();
                              const total = farmerCrops.length;
                              if (total === 0) return 0;
                              return ((moderateRisk * 50 + highRisk * 100) / (total * 100)) * 100;
                            })()}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        {(() => {
                          const { lowRisk, moderateRisk, highRisk } = getRiskDistribution();
                          const total = farmerCrops.length;
                          if (total === 0) return 'N/A';
                          const riskScore = (moderateRisk * 1 + highRisk * 2) / total;
                          return riskScore.toFixed(1);
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Crop Statistics */}
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-earth-primary mb-4">Village Crop Stats</h3>
          <div className="space-y-3">
            {farmerCrops.length === 0 ? (
              <p className="text-zinc-500 text-sm">No farmers registered yet</p>
            ) : (
              <>
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-2xl font-bold text-blue-600">{farmerCrops.length}</p>
                  <p className="text-xs text-blue-700">Total Farmers</p>
                </div>
                {crops.map((crop) => {
                  const count = cropStats[crop] || 0;
                  const percentage = farmerCrops.length > 0 ? (count / farmerCrops.length) * 100 : 0;
                  const warning = getCropWarning(crop);

                  return count > 0 ? (
                    <div key={crop} className="p-3 bg-zinc-50 rounded border border-zinc-200">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-sm text-zinc-900">{crop}</div>
                        <span className="text-xs font-bold text-earth-primary">{Math.round(percentage)}%</span>
                      </div>
                      <div className="w-full bg-zinc-200 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            percentage >= 50
                              ? 'bg-red-500'
                              : percentage >= 33
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-zinc-600">{count} farmers</p>
                      {warning && (
                        <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3" /> {warning}
                        </p>
                      )}
                    </div>
                  ) : null;
                })}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Farmer List */}
      {farmerCrops.length > 0 && (
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-earth-primary mb-4">Registered Farmers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-zinc-700">Farmer Name</th>
                  <th className="px-4 py-2 text-left font-semibold text-zinc-700">Selected Crop</th>
                  <th className="px-4 py-2 text-left font-semibold text-zinc-700">Risk Level</th>
                  <th className="px-4 py-2 text-center font-semibold text-zinc-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {farmerCrops.map((fc) => {
                  const warning = getCropWarning(fc.selectedCrop);
                  const isEditing = editingFarmerId === fc.farmerId;
                  return (
                    <tr key={fc.farmerId} className="border-b border-zinc-100 hover:bg-zinc-50">
                      <td className="px-4 py-3 font-medium text-zinc-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFarmerName}
                            onChange={(e) => setEditFarmerName(e.target.value)}
                            className="w-full px-2 py-1 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-earth-primary/30"
                          />
                        ) : (
                          fc.farmerName
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-700">
                        {isEditing ? (
                          <select
                            value={editCrop}
                            onChange={(e) => setEditCrop(e.target.value)}
                            className="w-full px-2 py-1 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-earth-primary/30"
                          >
                            {crops.map((crop) => (
                              <option key={crop} value={crop}>
                                {crop}
                              </option>
                            ))}
                          </select>
                        ) : (
                          fc.selectedCrop
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {warning ? (
                          <span className="inline-flex items-center gap-2 px-2 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded">
                            <AlertTriangle className="w-3 h-3" /> {warning}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded">
                            Low Risk
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={saveEditedFarmer}
                              className="text-emerald-600 hover:text-emerald-700 font-semibold text-xs underline"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditingFarmer}
                              className="text-zinc-600 hover:text-zinc-700 font-semibold text-xs underline"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => startEditingFarmer(fc)}
                              className="text-blue-600 hover:text-blue-700 font-semibold text-xs underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleRemoveFarmer(fc.farmerId)}
                              className="text-red-600 hover:text-red-700 font-semibold text-xs underline"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {editError && (
            <p className="text-xs text-red-600 mt-3 font-semibold">{editError}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FarmerCropPlanning;


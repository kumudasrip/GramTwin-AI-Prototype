import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { fetchVillageBoundaries, fetchVillageFields, fetchVillageWells, fetchVillageMetadata, VillageMetadata } from '../api/client';
import { Map as MapIcon, Leaf } from 'lucide-react';

// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface EnhancedVillageMapProps {
  selectedVillageId: string;
  onVillageSelect: (id: string) => void;
}

const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
};

// Separate component for soil markers to avoid hooks violations
interface SoilMarkerProps {
  soil: SoilDataPoint;
  idx: number;
  soilColorInfo: { color: string; description: string };
}

const SoilMarker: React.FC<SoilMarkerProps> = ({ soil, idx, soilColorInfo }) => {
  const markerRef = React.useRef<any>(null);

  const popupContent = `
    <div style="width: 320px; font-size: 14px; color: #18181b;">
      <h4 style="font-weight: bold; font-size: 18px; margin-bottom: 8px; color: #b45309;">${soil.soilType}</h4>
      <div style="background-color: #f3f4f6; padding: 8px; border-radius: 4px; margin-bottom: 8px;">
        <p style="color: #374151; font-weight: 600; font-size: 11px; text-transform: uppercase;">Region: ${soil.region}</p>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; font-size: 12px;">
        <div style="background-color: #dbeafe; padding: 8px; border-radius: 4px;">
          <p style="color: #4b5563;">Fertility</p>
          <p style="font-weight: bold; color: #1e40af;">${soil.fertility}</p>
        </div>
        <div style="background-color: #f3e8ff; padding: 8px; border-radius: 4px;">
          <p style="color: #4b5563;">pH Level</p>
          <p style="font-weight: bold; color: #6b21a8;">${soil.pH.toFixed(1)}</p>
        </div>
        <div style="background-color: #dcfce7; padding: 8px; border-radius: 4px;">
          <p style="color: #4b5563;">Water Retention</p>
          <p style="font-weight: bold; color: #15803d;">${soil.waterRetention}</p>
        </div>
        <div style="background-color: #fed7aa; padding: 8px; border-radius: 4px;">
          <p style="color: #4b5563;">Organic Matter</p>
          <p style="font-weight: bold; color: #b45309;">${soil.organicMatter || 'N/A'}%</p>
        </div>
      </div>

      ${soil.nitrogen ? `
      <div style="background-color: #fef3c7; padding: 8px; border-radius: 4px; margin-bottom: 12px; font-size: 12px;">
        <p style="font-weight: 600; color: #374151; margin-bottom: 4px;">NPK Values:</p>
        <p>N: ${soil.nitrogen} mg/kg | P: ${soil.phosphorus} mg/kg | K: ${soil.potassium} mg/kg</p>
      </div>
      ` : ''}

      <div style="background-color: #f3f4f6; padding: 8px; border-radius: 4px; margin-bottom: 8px;">
        <p style="font-weight: 600; font-size: 12px; margin-bottom: 4px; color: #374151;">Suitable Crops:</p>
        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
          ${soil.crops.map((crop) => `<span style="background-color: #bbf7d0; color: #166534; font-size: 12px; padding: 4px 8px; border-radius: 4px;">${crop}</span>`).join('')}
        </div>
      </div>

      <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 4px; padding: 8px; font-size: 12px; color: #854d0e;">
        <p style="font-weight: 600;">${soilColorInfo.description}</p>
      </div>
    </div>
  `;

  return (
    <CircleMarker
      key={`soil-${idx}`}
      center={soil.coordinates}
      radius={35}
      fillColor={soilColorInfo.color}
      fillOpacity={0.7}
      weight={3}
      opacity={1}
      color="#000"
      pathOptions={{}}
      eventHandlers={{
        click: () => {
          markerRef.current?.openPopup();
        }
      }}
      ref={markerRef}
    >
      <Popup autoClose={false} closeButton={true}>
        <div dangerouslySetInnerHTML={{ __html: popupContent }} />
      </Popup>
    </CircleMarker>
  );
};

const SOIL_COLORS: Record<string, string> = {
  loamy: '#8B7355',
  clayey: '#A0522D',
  sandy: '#D2B48C',
  reddish: '#CD5C5C',
  alluvial: '#D3D3D3'
};

const SOIL_NAMES: Record<string, string> = {
  loamy: 'Loamy Soil',
  clayey: 'Clayey Soil',
  sandy: 'Sandy Soil',
  reddish: 'Red Soil',
  alluvial: 'Alluvial Soil'
};

// Soil type definitions with advanced colors
const ADVANCED_SOIL_TYPES = {
  'Black Soil': { color: '#2C2C2C', description: 'High fertility, good for cotton, sugarcane' },
  'Red Soil': { color: '#CD5C5C', description: 'Moderate fertility, good for groundnuts, pulses' },
  'Red Loam': { color: '#D2691E', description: 'Well-draining, moderate fertility for cotton and millets' },
  'Mixed Alluvial-Loam': { color: '#CD8500', description: 'High fertility, excellent for rice and pulses' },
  'Laterite Soil': { color: '#CD853F', description: 'Good for coconut, cashew' },
  'Alluvial Soil': { color: '#F4A460', description: 'Highly fertile, good for rice, wheat' },
  'Clayey Soil': { color: '#8B7355', description: 'Good water retention, crops need drainage' },
  'Sandy Soil': { color: '#DAA520', description: 'Low fertility, good for groundnuts, millets' }
};

interface SoilDataPoint {
  region: string;
  soilType: string;
  coordinates: [number, number];
  crops: string[];
  pH: number;
  fertility: 'Low' | 'Medium' | 'High';
  waterRetention: 'Low' | 'Medium' | 'High';
  organicMatter?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
}

export default function EnhancedVillageMap({ selectedVillageId, onVillageSelect }: EnhancedVillageMapProps) {
  const [boundaries, setBoundaries] = useState<any>(null);
  const [fields, setFields] = useState<any>(null);
  const [wells, setWells] = useState<any>(null);
  const [metadata, setMetadata] = useState<VillageMetadata | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([14.03, 76.19]);
  const [showSoilLayer, setShowSoilLayer] = useState(true);
  const [showCropsLayer, setShowCropsLayer] = useState(true);
  const [mapView, setMapView] = useState<'default' | 'satellite' | 'terrain'>('default');
  const [soilData, setSoilData] = useState<SoilDataPoint[]>([]);

  // Generate soil data for the selected village
  const generateSoilData = (villageId: string): SoilDataPoint[] => {
    const soilDataMap: { [key: string]: SoilDataPoint[] } = {
      'NARSING_BATLA': [
        {
          region: 'North Zone',
          soilType: 'Black Soil',
          coordinates: [17.053, 79.170],
          crops: ['Paddy', 'Cotton', 'Sugarcane'],
          pH: 7.2,
          fertility: 'High',
          waterRetention: 'High',
          organicMatter: 3.8,
          nitrogen: 280,
          phosphorus: 20,
          potassium: 210
        },
        {
          region: 'East Zone',
          soilType: 'Red Loam',
          coordinates: [17.048, 79.173],
          crops: ['Cotton', 'Millets', 'Groundnuts'],
          pH: 6.5,
          fertility: 'Medium',
          waterRetention: 'Medium',
          organicMatter: 2.4,
          nitrogen: 200,
          phosphorus: 14,
          potassium: 165
        },
        {
          region: 'Central Zone',
          soilType: 'Mixed Alluvial-Loam',
          coordinates: [17.045, 79.168],
          crops: ['Paddy', 'Pulses', 'Vegetables'],
          pH: 6.8,
          fertility: 'High',
          waterRetention: 'High',
          organicMatter: 3.5,
          nitrogen: 310,
          phosphorus: 24,
          potassium: 225
        },
        {
          region: 'South Zone',
          soilType: 'Red Soil',
          coordinates: [17.038, 79.165],
          crops: ['Millets', 'Pulses', 'Groundnuts'],
          pH: 6.4,
          fertility: 'Medium',
          waterRetention: 'Medium',
          organicMatter: 2.2,
          nitrogen: 185,
          phosphorus: 12,
          potassium: 150
        }
      ],
      'V001': [
        {
          region: 'North Zone',
          soilType: 'Black Soil',
          coordinates: [14.034, 76.188],
          crops: ['Cotton', 'Sugarcane', 'Jowar'],
          pH: 7.2,
          fertility: 'High',
          waterRetention: 'High',
          organicMatter: 3.5,
          nitrogen: 245,
          phosphorus: 18,
          potassium: 182
        },
        {
          region: 'East Zone',
          soilType: 'Red Soil',
          coordinates: [14.032, 76.195],
          crops: ['Groundnuts', 'Pulses', 'Millets'],
          pH: 6.5,
          fertility: 'Medium',
          waterRetention: 'Medium',
          organicMatter: 2.1,
          nitrogen: 180,
          phosphorus: 12,
          potassium: 145
        },
        {
          region: 'South Zone',
          soilType: 'Alluvial Soil',
          coordinates: [14.027, 76.192],
          crops: ['Rice', 'Wheat', 'Sugarcane'],
          pH: 6.8,
          fertility: 'High',
          waterRetention: 'High',
          organicMatter: 4.2,
          nitrogen: 320,
          phosphorus: 22,
          potassium: 210
        },
        {
          region: 'West Zone',
          soilType: 'Sandy Soil',
          coordinates: [14.030, 76.185],
          crops: ['Groundnuts', 'Millets', 'Castor'],
          pH: 7.0,
          fertility: 'Low',
          waterRetention: 'Low',
          organicMatter: 1.2,
          nitrogen: 95,
          phosphorus: 8,
          potassium: 78
        }
      ],
      'V002': [
        {
          region: 'North Zone',
          soilType: 'Laterite Soil',
          coordinates: [14.044, 76.218],
          crops: ['Coconut', 'Cashew', 'Arecanut'],
          pH: 5.5,
          fertility: 'Medium',
          waterRetention: 'High',
          organicMatter: 2.8,
          nitrogen: 210,
          phosphorus: 14,
          potassium: 165
        },
        {
          region: 'Central Zone',
          soilType: 'Clayey Soil',
          coordinates: [14.040, 76.220],
          crops: ['Rice', 'Cotton', 'Sugarcane'],
          pH: 6.2,
          fertility: 'Medium',
          waterRetention: 'High',
          organicMatter: 3.1,
          nitrogen: 265,
          phosphorus: 19,
          potassium: 195
        }
      ],
      'V003': [
        {
          region: 'North Zone',
          soilType: 'Red Soil',
          coordinates: [14.052, 76.230],
          crops: ['Jowar', 'Pulses', 'Groundnuts'],
          pH: 6.4,
          fertility: 'Medium',
          waterRetention: 'Medium',
          organicMatter: 2.3,
          nitrogen: 195,
          phosphorus: 13,
          potassium: 155
        },
        {
          region: 'South Zone',
          soilType: 'Sandy Soil',
          coordinates: [14.048, 76.232],
          crops: ['Millets', 'Castor', 'Groundnuts'],
          pH: 7.1,
          fertility: 'Low',
          waterRetention: 'Low',
          organicMatter: 1.1,
          nitrogen: 88,
          phosphorus: 7,
          potassium: 72
        }
      ]
    };

    return soilDataMap[villageId] || soilDataMap['V001'];
  };

  useEffect(() => {
    fetchVillageBoundaries().then(setBoundaries);
  }, []);

  useEffect(() => {
    if (selectedVillageId) {
      Promise.all([
        fetchVillageFields(selectedVillageId),
        fetchVillageWells(selectedVillageId),
        fetchVillageMetadata(selectedVillageId)
      ]).then(([f, w, m]) => {
        setFields(f);
        setWells(w);
        setMetadata(m);
      });

      // Generate soil data for the village
      const soil = generateSoilData(selectedVillageId);
      console.log("Generated soil data for", selectedVillageId, ":", soil);
      setSoilData(soil);

      if (boundaries) {
        const feature = boundaries.features.find((f: any) => f.properties.village_id === selectedVillageId);
        if (feature) {
          const coords = feature.geometry.coordinates[0][0];
          setMapCenter([coords[1], coords[0]]);
        }
      }
    }
  }, [selectedVillageId, boundaries]);

  const villageStyle = (feature: any) => {
    const isSelected = feature.properties.village_id === selectedVillageId;
    return {
      fillColor: '#1e3a8a',
      weight: isSelected ? 4 : 2,
      opacity: 1,
      color: 'white',
      fillOpacity: isSelected ? 0.2 : 0.05
    };
  };

  const fieldStyle = (feature: any) => {
    const crop = feature.properties.crop_type;
    let color = '#047857';
    if (crop === "Paddy") color = '#1e3a8a';
    else if (crop === "Millets") color = '#d97706';
    
    return {
      fillColor: color,
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.6
    };
  };

  const getSoilPercentageText = (): string[] => {
    if (!metadata) return [];
    return metadata.soilComposition.map(s => `${SOIL_NAMES[s.soilType]}: ${s.percentage}%`);
  };

  const getCropRecommendations = (): Array<{ name: string; season: string; waterNeeds: string }> => {
    if (!metadata) return [];
    return metadata.suitableCrops.slice(0, 3).map(crop => ({
      name: crop.crop,
      season: crop.season,
      waterNeeds: crop.waterNeeds
    }));
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Map */}
      <div className="dashboard-card overflow-hidden">
        <div className="relative" style={{ height: '400px' }}>
          <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
            {mapView === 'default' && (
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            )}
            {mapView === 'satellite' && (
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="&copy; Esri"
                maxZoom={18}
              />
            )}
            {mapView === 'terrain' && (
              <TileLayer
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenTopoMap contributors'
                maxZoom={17}
              />
            )}
            <MapUpdater center={mapCenter} />
            
            {boundaries && (
              <GeoJSON 
                data={boundaries} 
                style={villageStyle}
                eventHandlers={{
                  click: (e) => {
                    const id = e.propagatedFrom.feature.properties.village_id;
                    onVillageSelect(id);
                  }
                }}
              />
            )}

            {showCropsLayer && fields && <GeoJSON data={fields} style={fieldStyle} />}

            {wells && wells.features.map((well: any, idx: number) => (
              <CircleMarker
                key={idx}
                center={[well.geometry.coordinates[1], well.geometry.coordinates[0]]}
                radius={6}
                pathOptions={{
                  fillColor: well.properties.status === "Good" ? "#047857" : "#dc2626",
                  color: 'white',
                  weight: 2,
                  fillOpacity: 0.8
                }}
              >
                <Popup>
                  <div className="text-xs text-zinc-900">
                    <p className="font-bold">Well: {well.properties.well_id}</p>
                    <p>Level: {well.properties.groundwater_level}m</p>
                    <p>Status: {well.properties.status}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {/* Soil Data Points - Clickable */}
            {showSoilLayer && soilData && soilData.length > 0 && soilData.map((soil, idx) => {
              const soilColorInfo = ADVANCED_SOIL_TYPES[soil.soilType as keyof typeof ADVANCED_SOIL_TYPES];
              return (
                <SoilMarker 
                  key={`soil-${idx}`}
                  soil={soil} 
                  idx={idx} 
                  soilColorInfo={soilColorInfo} 
                />
              );
            })}
          </MapContainer>

          {/* Map View Controls */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 z-[400] flex gap-1">
            <button
              onClick={() => setMapView('default')}
              className={`px-3 py-2 rounded text-xs font-semibold transition-all ${
                mapView === 'default'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Default
            </button>
            <button
              onClick={() => setMapView('satellite')}
              className={`px-3 py-2 rounded text-xs font-semibold transition-all ${
                mapView === 'satellite'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapView('terrain')}
              className={`px-3 py-2 rounded text-xs font-semibold transition-all ${
                mapView === 'terrain'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Terrain
            </button>
          </div>

          {/* Legend */}
          <div className="legend-panel">
            <h4 className="legend-title">Map Legend</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-[#1e3a8a] bg-[#1e3a8a]/20" />
                <span>Village Boundary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#1e3a8a]/60 border border-white" />
                <span>Paddy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#d97706]/60 border border-white" />
                <span>Millets</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#047857] border border-white" />
                <span>Good Well</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#dc2626] border border-white" />
                <span>Stressed Well</span>
              </div>
              <hr className="my-2" />
              <p className="font-semibold text-gray-700 mb-1">Soil Types (Click for details):</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#2C2C2C] border border-white" />
                <span>Black Soil</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#CD5C5C] border border-white" />
                <span>Red Soil</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#F4A460] border border-white" />
                <span>Alluvial Soil</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#DAA520] border border-white" />
                <span>Sandy Soil</span>
              </div>
            </div>
          </div>
        </div>

        {/* Layer Controls */}
        <div className="p-4 border-t border-zinc-100 flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCropsLayer}
              onChange={(e) => setShowCropsLayer(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-zinc-700">Show Crop Fields</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showSoilLayer}
              onChange={(e) => setShowSoilLayer(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-zinc-700">Show Soil Info</span>
          </label>
        </div>
      </div>

      {/* Soil & Crops Information Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Soil Composition */}
        <motion.div 
          className="dashboard-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-zinc-100">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <MapIcon className="w-5 h-5 text-amber-700" />
            </div>
            <h3 className="font-semibold text-earth-primary">Soil Composition</h3>
          </div>

          {metadata ? (
            <div className="space-y-4">
              {metadata.soilComposition.map((soil, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: SOIL_COLORS[soil.soilType] }}
                      />
                      <span className="text-sm font-medium text-zinc-700">{SOIL_NAMES[soil.soilType]}</span>
                    </div>
                    <span className="text-sm font-bold text-earth-primary">{soil.percentage}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${soil.percentage}%`,
                        backgroundColor: SOIL_COLORS[soil.soilType]
                      }}
                    />
                  </div>
                </div>
              ))}
              
              {metadata.soilComposition.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-100">
                  <p className="text-xs text-zinc-500 font-medium mb-2">Key Characteristics:</p>
                  <ul className="text-xs text-zinc-600 space-y-1">
                    <li>• Well-draining and fertile for balanced crops</li>
                    <li>• Suitable for mixed farming methods</li>
                    <li>• Regular soil testing recommended</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Loading soil data...</p>
          )}
        </motion.div>

        {/* Crop Recommendations */}
        <motion.div 
          className="dashboard-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-zinc-100">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-green-700" />
            </div>
            <h3 className="font-semibold text-earth-primary">Suitable Crops</h3>
          </div>

          {metadata && metadata.suitableCrops.length > 0 ? (
            <div className="space-y-3">
              {getCropRecommendations().map((crop, idx) => (
                <div key={idx} className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-earth-primary">{crop.name}</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      crop.waterNeeds === "Low" ? 'bg-green-100 text-green-700' :
                      crop.waterNeeds === "Medium" ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {crop.waterNeeds} Water
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600">
                    <span className="font-medium">Season:</span> {crop.season}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Loading crop recommendations...</p>
          )}

          {metadata && (
            <div className="mt-4 pt-4 border-t border-zinc-100">
              <p className="text-xs text-zinc-500 font-medium mb-2">Status:</p>
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-1 rounded font-medium ${
                  metadata.currentWaterStatus === "Good" ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  Water: {metadata.currentWaterStatus}
                </span>
                <span className={`text-xs px-2 py-1 rounded font-medium ${
                  metadata.currentClimateStatus === "Good" ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                }`}>
                  Climate: {metadata.currentClimateStatus}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

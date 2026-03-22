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

export default function EnhancedVillageMap({ selectedVillageId, onVillageSelect }: EnhancedVillageMapProps) {
  const [boundaries, setBoundaries] = useState<any>(null);
  const [fields, setFields] = useState<any>(null);
  const [wells, setWells] = useState<any>(null);
  const [metadata, setMetadata] = useState<VillageMetadata | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([14.03, 76.19]);
  const [showSoilLayer, setShowSoilLayer] = useState(true);
  const [showCropsLayer, setShowCropsLayer] = useState(true);

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
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
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
          </MapContainer>

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

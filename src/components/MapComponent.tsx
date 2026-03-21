import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { fetchVillageBoundaries, fetchVillageFields, fetchVillageWells, fetchVillageFloodRisk } from '../api/client';

// Fix Leaflet icon issue
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

interface MapComponentProps {
  selectedVillageId: string;
  onVillageSelect: (id: string) => void;
  simulationRisk?: "Low" | "Medium" | "High";
}

const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ selectedVillageId, onVillageSelect, simulationRisk }) => {
  const [boundaries, setBoundaries] = useState<any>(null);
  const [fields, setFields] = useState<any>(null);
  const [wells, setWells] = useState<any>(null);
  const [floodRisk, setFloodRisk] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([14.03, 76.19]);

  useEffect(() => {
    fetchVillageBoundaries().then(setBoundaries);
  }, []);

  useEffect(() => {
    if (selectedVillageId) {
      Promise.all([
        fetchVillageFields(selectedVillageId),
        fetchVillageWells(selectedVillageId),
        fetchVillageFloodRisk(selectedVillageId)
      ]).then(([f, w, fr]) => {
        setFields(f);
        setWells(w);
        setFloodRisk(fr);
      });

      // Update center based on selected village
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
    let color = "#6366f1"; // indigo-500
    let weight = 2;
    
    if (isSelected) {
      weight = 4;
      if (simulationRisk === "High") color = "#ef4444"; // red-500
      else if (simulationRisk === "Medium") color = "#f59e0b"; // amber-500
      else color = "#10b981"; // emerald-500
    }

    return {
      fillColor: color,
      weight: weight,
      opacity: 1,
      color: 'white',
      fillOpacity: isSelected ? 0.3 : 0.1
    };
  };

  const fieldStyle = (feature: any) => {
    const crop = feature.properties.crop_type;
    let color = "#10b981"; // emerald-500
    if (crop === "Paddy") color = "#3b82f6"; // blue-500
    else if (crop === "Millets") color = "#f59e0b"; // amber-500
    
    return {
      fillColor: color,
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.6
    };
  };

  const floodRiskStyle = (feature: any) => {
    const risk = feature.properties.risk_level;
    let color = "#ef4444"; // red-500
    if (risk === "Medium") color = "#f59e0b"; // amber-500
    else if (risk === "Low") color = "#10b981"; // emerald-500
    
    return {
      fillColor: color,
      weight: 0,
      fillOpacity: 0.4
    };
  };

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-black/5 shadow-sm relative z-0">
      <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

        {fields && <GeoJSON data={fields} style={fieldStyle} />}
        
        {floodRisk && <GeoJSON data={floodRisk} style={floodRiskStyle} />}

        {wells && wells.features.map((well: any, idx: number) => (
          <CircleMarker
            key={idx}
            center={[well.geometry.coordinates[1], well.geometry.coordinates[0]]}
            radius={6}
            pathOptions={{
              fillColor: well.properties.status === "Good" ? "#10b981" : "#ef4444",
              color: 'white',
              weight: 2,
              fillOpacity: 0.8
            }}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-bold">Well: {well.properties.well_id}</p>
                <p>Level: {well.properties.groundwater_level}m</p>
                <p>Status: {well.properties.status}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg z-[1000] border border-black/5 text-[10px] font-medium space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500 opacity-30 border border-indigo-500" />
          <span>Village Boundary</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500 opacity-60" />
          <span>Paddy Fields</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500 opacity-60" />
          <span>Millet Fields</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500 opacity-40" />
          <span>Flood Risk Zone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 border border-white" />
          <span>Healthy Well</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 border border-white" />
          <span>Stressed/Dry Well</span>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { fetchVillageBoundaries, fetchVillageFields, fetchVillageWells, fetchVillageFloodRisk } from '../api/client';
import { useTranslation } from '../hooks/useTranslation';

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
  const { t } = useTranslation();
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
    let color = "#1e3a8a"; // earth-primary
    let weight = 2;
    
    if (isSelected) {
      weight = 4;
      if (simulationRisk === "High") color = "#dc2626"; // earth-accent
      else if (simulationRisk === "Medium") color = "#d97706"; // earth-gold
      else color = "#047857"; // earth-secondary
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
    let color = "#047857"; // earth-secondary
    if (crop === "Paddy") color = "#1e3a8a"; // earth-primary
    else if (crop === "Millets") color = "#d97706"; // earth-gold
    
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
    let color = "#dc2626"; // earth-accent
    if (risk === "Medium") color = "#d97706"; // earth-gold
    else if (risk === "Low") color = "#047857"; // earth-secondary
    
    return {
      fillColor: color,
      weight: 0,
      fillOpacity: 0.4
    };
  };

  return (
    <div className="h-full w-full relative z-0">
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
              fillColor: well.properties.status === "Good" ? "#047857" : "#dc2626",
              color: 'white',
              weight: 2,
              fillOpacity: 0.8
            }}
          >
            <Popup>
              <div className="text-xs text-zinc-900">
                <p className="font-bold">{t('mapComponent.well')}: {well.properties.well_id}</p>
                <p>{t('mapComponent.level')}: {well.properties.groundwater_level}m</p>
                <p>{t('mapComponent.status')}: {well.properties.status}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      
      {/* Legend */}
      <div className="legend-panel">
        <h4 className="legend-title">{t('mapComponent.legend')}</h4>
        <div className="space-y-3">
          <div className="legend-item">
            <div className="w-5 h-5 rounded-full bg-[#1e3a8a]/30 border border-[#1e3a8a] shadow-sm" />
            <span className="font-medium">{t('mapComponent.villageBoundary')}</span>
          </div>
          <div className="legend-item">
            <div className="w-5 h-5 rounded bg-[#1e3a8a]/60 border border-white shadow-sm" />
            <span className="font-medium">{t('mapComponent.paddyFields')}</span>
          </div>
          <div className="legend-item">
            <div className="w-5 h-5 rounded bg-[#d97706]/60 border border-white shadow-sm" />
            <span className="font-medium">{t('mapComponent.milletFields')}</span>
          </div>
          <div className="legend-item">
            <div className="w-5 h-5 rounded bg-[#dc2626]/40 border border-white shadow-sm" />
            <span className="font-medium">{t('mapComponent.floodRiskZone')}</span>
          </div>
          <div className="legend-item">
            <div className="w-5 h-5 rounded-full bg-[#047857] border-2 border-white shadow-sm" />
            <span className="font-medium">{t('mapComponent.healthyWell')}</span>
          </div>
          <div className="legend-item">
            <div className="w-5 h-5 rounded-full bg-[#dc2626] border-2 border-white shadow-sm" />
            <span className="font-medium">{t('mapComponent.stressedWell')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;

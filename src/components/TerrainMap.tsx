import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, useMap, Rectangle, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { fetchVillageBoundaries, fetchVillageFields } from '../api/client';
import { MapPin, Layers, AlertCircle } from 'lucide-react';

// Soil type definitions
const SOIL_TYPES = {
  'Black Soil': { color: '#2C2C2C', rgb: 'rgb(44, 44, 44)', description: 'High fertility, good for cotton, sugarcane' },
  'Red Soil': { color: '#CD5C5C', rgb: 'rgb(205, 92, 92)', description: 'Moderate fertility, good for groundnuts, pulses' },
  'Red Loam': { color: '#D2691E', rgb: 'rgb(210, 105, 30)', description: 'Well-draining, moderate fertility for cotton and millets' },
  'Mixed Alluvial-Loam': { color: '#CD8500', rgb: 'rgb(205, 133, 0)', description: 'High fertility, excellent for rice and pulses' },
  'Laterite Soil': { color: '#CD853F', rgb: 'rgb(205, 133, 63)', description: 'Good for coconut, cashew' },
  'Alluvial Soil': { color: '#F4A460', rgb: 'rgb(244, 164, 96)', description: 'Highly fertile, good for rice, wheat' },
  'Clayey Soil': { color: '#8B7355', rgb: 'rgb(139, 115, 85)', description: 'Good water retention, crops need drainage' },
  'Sandy Soil': { color: '#DAA520', rgb: 'rgb(218, 165, 32)', description: 'Low fertility, good for groundnuts, millets' }
};

interface SoilData {
  region: string;
  soilType: keyof typeof SOIL_TYPES;
  coordinates: [number, number];
  crops: string[];
  pH: number;
  fertility: 'Low' | 'Medium' | 'High';
  waterRetention: 'Low' | 'Medium' | 'High';
}

interface TerrainMapProps {
  selectedVillageId: string;
}

const TerrainInfoLegend: React.FC = () => {
  return (
    <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[400] max-w-sm">
      <h3 className="font-bold text-lg mb-3 text-gray-800 flex items-center gap-2">
        <Layers size={18} />
        Soil Types & Fertility
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {Object.entries(SOIL_TYPES).map(([name, info]) => (
          <div key={name} className="flex items-start gap-3">
            <div
              className="w-5 h-5 rounded flex-shrink-0 border border-gray-300"
              style={{ backgroundColor: info.color }}
            />
            <div className="text-sm">
              <p className="font-semibold text-gray-700">{name}</p>
              <p className="text-gray-600 text-xs">{info.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SoilInfoPopup: React.FC<{ soilData: SoilData }> = ({ soilData }) => {
  const soilInfo = SOIL_TYPES[soilData.soilType];
  
  return (
    <div className="text-sm w-64">
      <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
        <div
          className="w-5 h-5 rounded"
          style={{ backgroundColor: soilInfo.color }}
        />
        {soilData.soilType}
      </h4>
      
      <div className="bg-gray-50 p-2 rounded mb-2">
        <p className="text-gray-700 font-semibold text-xs uppercase">Region: {soilData.region}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="bg-blue-50 p-2 rounded">
          <p className="text-gray-600">Fertility</p>
          <p className="font-bold text-blue-700">{soilData.fertility}</p>
        </div>
        <div className="bg-purple-50 p-2 rounded">
          <p className="text-gray-600">pH Level</p>
          <p className="font-bold text-purple-700">{soilData.pH.toFixed(1)}</p>
        </div>
        <div className="bg-green-50 p-2 rounded">
          <p className="text-gray-600">Water Retention</p>
          <p className="font-bold text-green-700">{soilData.waterRetention}</p>
        </div>
        <div className="bg-orange-50 p-2 rounded">
          <p className="text-gray-600">Crop Suitability</p>
          <p className="font-bold text-orange-700">{soilData.crops.length} crops</p>
        </div>
      </div>

      <div className="bg-gray-100 p-2 rounded">
        <p className="font-semibold text-xs mb-1 text-gray-700">Suitable Crops:</p>
        <div className="flex flex-wrap gap-1">
          {soilData.crops.map((crop) => (
            <span key={crop} className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded">
              {crop}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
        <p className="font-semibold flex items-center gap-2">
          <AlertCircle size={14} />
          {soilInfo.description}
        </p>
      </div>
    </div>
  );
};

const TerrainMap: React.FC<TerrainMapProps> = ({ selectedVillageId }) => {
  const [boundaries, setBoundaries] = useState<any>(null);
  const [soilData, setSoilData] = useState<SoilData[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([14.03, 76.19]);
  const [fields, setFields] = useState<any>(null);
  const [showTerrain, setShowTerrain] = useState(false);

  // Generate mock soil data for the village
  const generateSoilData = (villageId: string): SoilData[] => {
    const soilDataMap: { [key: string]: SoilData[] } = {
      'NARSING_BATLA': [
        {
          region: 'North Zone',
          soilType: 'Black Soil',
          coordinates: [17.053, 79.170],
          crops: ['Paddy', 'Cotton', 'Sugarcane'],
          pH: 7.2,
          fertility: 'High',
          waterRetention: 'High'
        },
        {
          region: 'East Zone',
          soilType: 'Red Soil',
          coordinates: [17.048, 79.173],
          crops: ['Cotton', 'Millets', 'Groundnuts'],
          pH: 6.5,
          fertility: 'Medium',
          waterRetention: 'Medium'
        },
        {
          region: 'Central Zone',
          soilType: 'Alluvial Soil',
          coordinates: [17.045, 79.168],
          crops: ['Paddy', 'Pulses', 'Vegetables'],
          pH: 6.8,
          fertility: 'High',
          waterRetention: 'High'
        },
        {
          region: 'South Zone',
          soilType: 'Red Soil',
          coordinates: [17.038, 79.165],
          crops: ['Millets', 'Pulses', 'Groundnuts'],
          pH: 6.4,
          fertility: 'Medium',
          waterRetention: 'Medium'
        }
      ],
      'V001': [
        {
          region: 'North Zone',
          soilType: 'Black Soil',
          coordinates: [14.04, 76.18],
          crops: ['Cotton', 'Sugarcane', 'Jowar'],
          pH: 7.2,
          fertility: 'High',
          waterRetention: 'High'
        },
        {
          region: 'East Zone',
          soilType: 'Red Soil',
          coordinates: [14.03, 76.20],
          crops: ['Groundnuts', 'Pulses', 'Millets'],
          pH: 6.5,
          fertility: 'Medium',
          waterRetention: 'Medium'
        },
        {
          region: 'South Zone',
          soilType: 'Alluvial Soil',
          coordinates: [14.02, 76.19],
          crops: ['Rice', 'Wheat', 'Sugarcane'],
          pH: 6.8,
          fertility: 'High',
          waterRetention: 'High'
        },
        {
          region: 'West Zone',
          soilType: 'Sandy Soil',
          coordinates: [14.03, 76.17],
          crops: ['Groundnuts', 'Millets', 'Castor'],
          pH: 7.0,
          fertility: 'Low',
          waterRetention: 'Low'
        }
      ],
      'V002': [
        {
          region: 'North Zone',
          soilType: 'Laterite Soil',
          coordinates: [14.05, 76.21],
          crops: ['Coconut', 'Cashew', 'Arecanut'],
          pH: 5.5,
          fertility: 'Medium',
          waterRetention: 'High'
        },
        {
          region: 'Central Zone',
          soilType: 'Clayey Soil',
          coordinates: [14.04, 76.22],
          crops: ['Rice', 'Cotton', 'Sugarcane'],
          pH: 6.2,
          fertility: 'Medium',
          waterRetention: 'High'
        }
      ],
      'V003': [
        {
          region: 'North Zone',
          soilType: 'Red Soil',
          coordinates: [14.06, 76.23],
          crops: ['Jowar', 'Pulses', 'Groundnuts'],
          pH: 6.4,
          fertility: 'Medium',
          waterRetention: 'Medium'
        },
        {
          region: 'South Zone',
          soilType: 'Sandy Soil',
          coordinates: [14.05, 76.24],
          crops: ['Millets', 'Castor', 'Groundnuts'],
          pH: 7.1,
          fertility: 'Low',
          waterRetention: 'Low'
        }
      ]
    };

    return soilDataMap[villageId] || soilDataMap['V001'];
  };

  useEffect(() => {
    Promise.all([
      fetchVillageBoundaries(),
      fetchVillageFields(selectedVillageId)
    ]).then(([boundariesData, fieldsData]) => {
      setBoundaries(boundariesData);
      setFields(fieldsData);
    });

    const soil = generateSoilData(selectedVillageId);
    setSoilData(soil);

    // Update map center based on village
    const centerMap: { [key: string]: [number, number] } = {
      'NARSING_BATLA': [17.049, 79.170],
      'V001': [14.03, 76.19],
      'V002': [14.04, 76.22],
      'V003': [14.05, 76.23]
    };
    setMapCenter(centerMap[selectedVillageId] || [14.03, 76.19]);
  }, [selectedVillageId]);

  const fieldStyle = (feature: any) => {
    return {
      fillColor: '#90EE90',
      weight: 2,
      opacity: 0.8,
      color: '#228B22',
      dashArray: '5, 5',
      fillOpacity: 0.3,
    };
  };

  const boundaryStyle = () => {
    return {
      fillColor: 'none',
      weight: 3,
      opacity: 1,
      color: '#1E40AF',
      dashArray: '8, 4',
    };
  };

  const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(center, 14);
    }, [center, map]);
    return null;
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Top Controls */}
      <div className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MapPin size={24} className="text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            Terrain & Soil Map - {selectedVillageId}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTerrain(!showTerrain)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              !showTerrain
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {!showTerrain ? 'Satellite View' : 'Terrain View'}
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer
          center={mapCenter}
          zoom={14}
          className="w-full h-full"
        >
          {!showTerrain ? (
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="&copy; Esri"
              maxZoom={18}
            />
          ) : (
            <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenTopoMap contributors'
              maxZoom={17}
            />
          )}

          <MapUpdater center={mapCenter} />

          {/* Village Boundaries */}
          {boundaries && (
            <GeoJSON data={boundaries} style={boundaryStyle} />
          )}

          {/* Agricultural Fields */}
          {fields && (
            <GeoJSON data={fields} style={fieldStyle} />
          )}

          {/* Soil Data Points */}
          {soilData.map((soil, idx) => (
            <CircleMarker
              key={idx}
              center={soil.coordinates}
              radius={40}
              fillColor={SOIL_TYPES[soil.soilType].color}
              fillOpacity={0.7}
              weight={3}
              opacity={1}
              color="#000"
              pathOptions={{
                stroke: true,
                strokeWidth: 3,
              }}
            >
              <Popup>
                <SoilInfoPopup soilData={soil} />
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Legend */}
        <TerrainInfoLegend />

        {/* Info Panel */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[350] max-w-xs">
          <h3 className="font-bold text-lg mb-2 text-gray-800">Soil Survey Data</h3>
          <div className="space-y-2 text-sm">
            <div className="bg-blue-50 p-2 rounded">
              <p className="text-gray-600">Total Soil Zones:</p>
              <p className="font-bold text-blue-700">{soilData.length}</p>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <p className="text-gray-600">Agricultural Land:</p>
              <p className="font-bold text-green-700">Click on soil zones to view details</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="bg-white shadow-sm p-3 border-t border-gray-200 text-xs text-gray-600">
        <p>
          💡 Click on colored soil zones to view detailed soil properties, pH levels, fertility status, and suitable crops for each region.
        </p>
      </div>
    </div>
  );
};

export default TerrainMap;


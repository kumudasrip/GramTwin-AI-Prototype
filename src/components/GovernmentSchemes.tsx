import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, AlertCircle, CheckCircle, Filter } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface Scheme {
  scheme_name: string;
  category: string;
  status: string;
  priority: string;
  reason: string;
  eligibility_score: number;
}

interface SchemesResponse {
  villageId: string;
  villageName: string;
  villageState: {
    population: number;
    households: number;
    groundwater_index: number;
    water_risk: string;
    main_crops: string[];
    income_level_approx: string;
  };
  datasets?: {
    provided_dataset?: {
      name: string;
      schemes: Scheme[];
      totalSchemes: number;
    };
    extended_dataset?: {
      name: string;
      schemes: Scheme[];
      totalSchemes: number;
    };
  };
  recommendations?: Scheme[];
  generatedAt: string;
}

interface GovernmentSchemesProps {
  selectedVillageId: string;
  currentCrop?: string;
}

const GovernmentSchemes: React.FC<GovernmentSchemesProps> = ({ selectedVillageId, currentCrop }) => {
  const { t } = useTranslation();
  const [schemes, setSchemes] = useState<SchemesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDataset, setActiveDataset] = useState<'both' | 'provided' | 'extended'>('both');

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      setError(null);
      try {
        const cropParam = currentCrop ? `?crop=${encodeURIComponent(currentCrop)}` : '';
        const response = await fetch(`/api/village/${selectedVillageId}/schemes${cropParam}`);
        if (!response.ok) throw new Error('Failed to fetch schemes');
        const data = await response.json();
        setSchemes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setSchemes(null);
      } finally {
        setLoading(false);
      }
    };

    if (selectedVillageId) {
      fetchSchemes();
    }
  }, [selectedVillageId, currentCrop]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'Medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'Low':
        return 'bg-green-50 border-green-200 text-green-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      water: '💧',
      employment: '💼',
      housing: '🏠',
      agriculture: '🌾',
      health: '🏥',
    };
    return icons[category] || '📋';
  };

  const renderSchemeCard = (scheme: Scheme, index: number) => (
    <div
      key={index}
      className={`border-l-4 p-4 rounded-lg mb-3 ${getPriorityColor(scheme.priority)}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{getCategoryIcon(scheme.category)}</span>
            <h3 className="font-bold text-lg">{scheme.scheme_name}</h3>
            <span className="text-xs px-2 py-1 bg-white bg-opacity-60 rounded-full">
              {scheme.category}
            </span>
          </div>
          <p className="text-sm mb-2 opacity-90">{scheme.reason}</p>
          <div className="flex gap-4 text-xs">
            <span className="font-semibold">Status: {scheme.status}</span>
            <span className="font-semibold">Priority: {scheme.priority}</span>
          </div>
        </div>
        <div className="ml-4 text-right">
          <div className="text-2xl font-bold">{(scheme.eligibility_score * 100).toFixed(0)}%</div>
          <div className="text-xs opacity-75">Eligibility</div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 text-earth-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-bold">Error Loading Schemes</h3>
        </div>
        <p>{error}</p>
      </div>
    );
  }

  if (!schemes) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-gray-600 text-center">
        No schemes data available
      </div>
    );
  }

  const hasBothDatasets = schemes.datasets?.provided_dataset && schemes.datasets?.extended_dataset;

  return (
    <div className="space-y-6 pb-8">
      {/* Village Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-600 font-bold uppercase mb-1">Population</p>
          <p className="text-2xl font-bold text-blue-700">{schemes.villageState.population.toLocaleString()}</p>
          <p className="text-xs text-blue-600 mt-1">{schemes.villageState.households} households</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-xs text-green-600 font-bold uppercase mb-1">Water Status</p>
          <p className="text-2xl font-bold text-green-700">{schemes.villageState.water_risk}</p>
          <p className="text-xs text-green-600 mt-1">GW Index: {schemes.villageState.groundwater_index.toFixed(2)}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-xs text-purple-600 font-bold uppercase mb-1">Income Level</p>
          <p className="text-2xl font-bold text-purple-700">{schemes.villageState.income_level_approx}</p>
          <p className="text-xs text-purple-600 mt-1">Primary Crops: {schemes.villageState.main_crops.join(', ')}</p>
        </div>
      </div>

      {/* Dataset Filter */}
      {hasBothDatasets && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-earth-primary" />
            <h3 className="font-bold text-gray-700">View Datasets</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveDataset('both')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                activeDataset === 'both'
                  ? 'bg-earth-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Both Datasets
            </button>
            <button
              onClick={() => setActiveDataset('provided')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                activeDataset === 'provided'
                  ? 'bg-earth-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              User-Provided Only
            </button>
            <button
              onClick={() => setActiveDataset('extended')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                activeDataset === 'extended'
                  ? 'bg-earth-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Extended Only
            </button>
          </div>
        </div>
      )}

      {/* Schemes Display */}
      {hasBothDatasets ? (
        <>
          {(activeDataset === 'both' || activeDataset === 'provided') && schemes.datasets?.provided_dataset && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-bold text-gray-800">
                  {schemes.datasets.provided_dataset.name}
                </h2>
                <span className="ml-auto text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {schemes.datasets.provided_dataset.totalSchemes} schemes
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Schemes from your user-provided dataset</p>
              <div className="space-y-2">
                {schemes.datasets.provided_dataset.schemes.map((scheme, idx) =>
                  renderSchemeCard(scheme, idx)
                )}
              </div>
            </div>
          )}

          {(activeDataset === 'both' || activeDataset === 'extended') && schemes.datasets?.extended_dataset && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-bold text-gray-800">
                  {schemes.datasets.extended_dataset.name}
                </h2>
                <span className="ml-auto text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {schemes.datasets.extended_dataset.totalSchemes} schemes
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Enhanced scheme list with additional programs</p>
              <div className="space-y-2">
                {schemes.datasets.extended_dataset.schemes.map((scheme, idx) =>
                  renderSchemeCard(scheme, idx)
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-6 h-6 text-earth-primary" />
            <h2 className="text-xl font-bold text-gray-800">Government Schemes</h2>
            <span className="ml-auto text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {schemes.recommendations?.length || 0} schemes
            </span>
          </div>
          <div className="space-y-2">
            {schemes.recommendations?.map((scheme, idx) => renderSchemeCard(scheme, idx))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="text-xs text-gray-500 text-center">
        Generated: {new Date(schemes.generatedAt).toLocaleString()}
      </div>
    </div>
  );
};

export default GovernmentSchemes;

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, Upload, AlertCircle, MapPin, Zap, TrendingUp } from 'lucide-react';
import { fetchInfrastructureRecommendations, uploadDumpyardPhoto, InfrastructureRecommendation, BaselineData } from '../api/client';
import { useTranslation } from '../hooks/useTranslation';

interface InfrastructureRecommendationsProps {
  selectedVillageId: string;
  baseline: BaselineData | null;
}

const PRIORITY_COLORS = {
  High: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100' },
  Medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100' },
  Low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100' }
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  'Water Management': <Zap className="w-5 h-5" />,
  'Soil Improvement': <AlertCircle className="w-5 h-5" />,
  'Climate Adaptation': <TrendingUp className="w-5 h-5" />,
  'General Infrastructure': <Settings className="w-5 h-5" />,
  'Dumpyard Management': <MapPin className="w-5 h-5" />,
};

export default function InfrastructureRecommendations({ 
  selectedVillageId, 
  baseline 
}: InfrastructureRecommendationsProps) {
  const { t } = useTranslation();

  const TYPE_ICONS: Record<string, React.ReactNode> = {
    [t('infrastructure.waterManagement')]: <Zap className="w-5 h-5" />,
    [t('infrastructure.soilImprovement')]: <AlertCircle className="w-5 h-5" />,
    [t('infrastructure.climateAdaptation')]: <TrendingUp className="w-5 h-5" />,
    [t('infrastructure.generalInfrastructure')]: <Settings className="w-5 h-5" />,
    [t('infrastructure.dumpyardManagement')]: <MapPin className="w-5 h-5" />,
  };
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [recommendations, setRecommendations] = useState<InfrastructureRecommendation[]>([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const recs = await fetchInfrastructureRecommendations(selectedVillageId);
        setRecommendations(recs);
      } catch (err) {
        console.error('Failed to fetch recommendations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [selectedVillageId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    } else {
      alert('Please select a valid image file');
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const newRecs = await uploadDumpyardPhoto(selectedVillageId, selectedFile);
      setRecommendations([...recommendations, ...newRecs]);
      setSelectedFile(null);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center border border-purple-200">
          <Settings className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-earth-primary">{t('infrastructure.title')}</h1>
          <p className="text-zinc-500">{t('infrastructure.developmentPriorities')} {baseline?.village_name || selectedVillageId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Photo Upload Section */}
        <div className="lg:col-span-1">
          <motion.div 
            className="dashboard-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-earth-primary mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              {t('infrastructure.photoAnalysis')}
            </h3>

            <p className="text-sm text-zinc-600 mb-4">
              {t('infrastructure.uploadPhotoDescription')}
            </p>

            <div className="space-y-4">
              {/* File Input */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="block w-full p-6 border-2 border-dashed border-zinc-300 rounded-lg hover:border-earth-primary/50 hover:bg-earth-primary/5 cursor-pointer transition-colors text-center"
                >
                  <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-zinc-700">{t('infrastructure.clickToUpload')}</p>
                  <p className="text-xs text-zinc-500">{t('infrastructure.fileInfo')}</p>
                </label>
              </div>

              {/* Selected File */}
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                  <p className="text-sm font-medium text-blue-900 truncate mb-3">{selectedFile.name}</p>
                  <button
                    onClick={handlePhotoUpload}
                    disabled={uploading}
                    className="w-full py-2 bg-earth-primary text-white font-medium rounded hover:bg-earth-primary/90 disabled:bg-zinc-400 transition-colors text-sm"
                  >
                    {uploading ? t('infrastructure.analyzingPhoto') : t('infrastructure.analyzePhoto')}
                  </button>
                </motion.div>
              )}

              {uploadSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700"
                >
                  {t('infrastructure.photosAnalyzed')}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recommendations List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-zinc-500">{t('infrastructure.loadingRecommendations')}</p>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec, idx) => {
                const colors = PRIORITY_COLORS[rec.priority];
                return (
                  <motion.div
                    key={rec.id}
                    className={`dashboard-card border-l-4 ${colors.border}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-earth-primary flex-shrink-0 ${colors.badge}`}>
                        {TYPE_ICONS[rec.type] || <Settings className="w-5 h-5" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-earth-primary">{rec.type}</h4>
                            <p className={`text-xs font-semibold ${colors.text} ${colors.badge} inline-block px-2 py-1 rounded mt-1`}>
                              {rec.priority} Priority
                            </p>
                          </div>
                          <span className="text-xs text-zinc-400 font-medium">{rec.source}</span>
                        </div>

                        <p className="text-sm text-zinc-700 mb-3">{rec.description}</p>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          {rec.estimatedCost && (
                            <div>
                              <p className="text-zinc-500 font-medium">{t('infrastructure.estimatedCost')}</p>
                              <p className="text-earth-primary font-semibold">{rec.estimatedCost}</p>
                            </div>
                          )}
                          {rec.implementation && (
                            <div>
                              <p className="text-zinc-500 font-medium">{t('infrastructure.implementation')}</p>
                              <p className="text-earth-primary font-semibold">{rec.implementation}</p>
                            </div>
                          )}
                        </div>

                        {rec.statusCondition && (
                          <p className="text-xs text-zinc-500 mt-3 pt-3 border-t border-zinc-100">
                            <span className="font-medium">{t('infrastructure.basedOn')}</span> {rec.statusCondition}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div 
              className="dashboard-card text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Settings className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-zinc-700 mb-2">{t('infrastructure.noRecommendations')}</h3>
              <p className="text-sm text-zinc-500 mb-4">
                {t('infrastructure.uploadForRecommendations')}
              </p>
              <p className="text-xs text-zinc-400">
                {t('infrastructure.recommendationsHint')}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

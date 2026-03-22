import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { submitVillageReport, fetchLatestReport, VillageReport, BaselineData } from '../api/client';

interface ReportPageProps {
  selectedVillageId: string;
  baseline: BaselineData | null;
}

const WATER_STATUS_OPTIONS = ["Excellent", "Good", "Moderate", "Poor", "Critical"];
const CLIMATE_STATUS_OPTIONS = ["Excellent", "Good", "Moderate", "Challenging", "Critical"];
const SUBMITTER_TYPES = ["Panchayat", "NGO", "Government"];
const CHALLENGES = [
  "Water scarcity",
  "Poor soil quality",
  "Irregular rainfall",
  "Crop diseases",
  "livestock issues",
  "Limited irrigation",
  "Market access",
  "Infrastructure gap"
];

export default function ReportPage({ selectedVillageId, baseline }: ReportPageProps) {
  const [formData, setFormData] = useState({
    submittedBy: '',
    submitterType: 'Panchayat' as 'Panchayat' | 'NGO' | 'Government',
    waterStatus: 'Good' as const,
    waterDetails: '',
    climateStatus: 'Good' as const,
    climateDetails: '',
    currentChallenges: [] as string[],
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [latestReport, setLatestReport] = useState<VillageReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const report = await fetchLatestReport(selectedVillageId);
        setLatestReport(report);
      } catch (err) {
        console.error('Failed to fetch latest report', err);
      }
    };
    fetchReport();
  }, [selectedVillageId]);

  const handleChallengeToggle = (challenge: string) => {
    setFormData(prev => ({
      ...prev,
      currentChallenges: prev.currentChallenges.includes(challenge)
        ? prev.currentChallenges.filter(c => c !== challenge)
        : [...prev.currentChallenges, challenge]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.submittedBy.trim()) {
      setError('Please enter submitter name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const report = await submitVillageReport({
        villageId: selectedVillageId,
        ...formData
      });
      
      setLatestReport(report);
      setSubmitted(true);
      
      // Reset form
      setFormData({
        submittedBy: '',
        submitterType: 'Panchayat',
        waterStatus: 'Good',
        waterDetails: '',
        climateStatus: 'Good',
        climateDetails: '',
        currentChallenges: [],
        notes: ''
      });

      // Hide success message after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError('Failed to submit report. Please try again.');
      console.error('Submission failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-earth-primary">Village Status Report</h1>
          <p className="text-zinc-500">Submit water, climate, and infrastructure status for {baseline?.village_name || selectedVillageId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <motion.div 
            className="dashboard-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Submitter Info */}
              <div className="space-y-4 pb-6 border-b border-zinc-100">
                <h3 className="text-lg font-semibold text-earth-primary">Submitter Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.submittedBy}
                      onChange={(e) => setFormData(prev => ({ ...prev, submittedBy: e.target.value }))}
                      placeholder="Enter your name"
                      className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-earth-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Organization Type</label>
                    <select
                      value={formData.submitterType}
                      onChange={(e) => setFormData(prev => ({ ...prev, submitterType: e.target.value as any }))}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-earth-primary/50"
                    >
                      {SUBMITTER_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Water Status */}
              <div className="space-y-4 pb-6 border-b border-zinc-100">
                <h3 className="text-lg font-semibold text-earth-primary">Water Status</h3>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-3">Current Water Condition</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {WATER_STATUS_OPTIONS.map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, waterStatus: status as any }))}
                        className={`py-2 px-3 rounded-lg font-medium transition-all text-sm ${
                          formData.waterStatus === status
                            ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Water Details</label>
                  <textarea
                    value={formData.waterDetails}
                    onChange={(e) => setFormData(prev => ({ ...prev, waterDetails: e.target.value }))}
                    placeholder="Describe the current water situation: groundwater levels, wells status, water quality, etc."
                    className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-earth-primary/50 h-24 resize-none"
                  />
                </div>
              </div>

              {/* Climate Status */}
              <div className="space-y-4 pb-6 border-b border-zinc-100">
                <h3 className="text-lg font-semibold text-earth-primary">Climate Status</h3>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-3">Current Climate Condition</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {CLIMATE_STATUS_OPTIONS.map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, climateStatus: status as any }))}
                        className={`py-2 px-3 rounded-lg font-medium transition-all text-sm ${
                          formData.climateStatus === status
                            ? 'bg-orange-600 text-white ring-2 ring-orange-300'
                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Climate Details</label>
                  <textarea
                    value={formData.climateDetails}
                    onChange={(e) => setFormData(prev => ({ ...prev, climateDetails: e.target.value }))}
                    placeholder="Describe the current climate: rainfall, temperature, wind, crop conditions, etc."
                    className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-earth-primary/50 h-24 resize-none"
                  />
                </div>
              </div>

              {/* Current Challenges */}
              <div className="space-y-4 pb-6 border-b border-zinc-100">
                <h3 className="text-lg font-semibold text-earth-primary">Current Challenges</h3>
                <p className="text-sm text-zinc-600">Select all that apply</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CHALLENGES.map(challenge => (
                    <button
                      key={challenge}
                      type="button"
                      onClick={() => handleChallengeToggle(challenge)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium text-left ${
                        formData.currentChallenges.includes(challenge)
                          ? 'border-earth-primary bg-earth-primary/10 text-earth-primary'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:border-earth-primary/50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-all ${
                          formData.currentChallenges.includes(challenge)
                            ? 'bg-earth-primary border-earth-primary'
                            : 'border-zinc-300'
                        }`}>
                          {formData.currentChallenges.includes(challenge) && (
                            <span className="text-white text-xs">✓</span>
                          )}
                        </span>
                        {challenge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-zinc-700">Additional Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional information or recommendations..."
                  className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-earth-primary/50 h-20 resize-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-earth-primary text-white font-semibold rounded-lg hover:bg-earth-primary/90 disabled:bg-zinc-400 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </motion.div>

          {/* Success State */}
          {submitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-green-700">Report submitted successfully!</p>
            </motion.div>
          )}
        </div>

        {/* Latest Report Sidebar */}
        <div className="lg:col-span-1">
          {latestReport ? (
            <motion.div 
              className="dashboard-card sticky top-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold text-earth-primary mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Latest Report
              </h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-zinc-500 font-medium">Submitted By</p>
                  <p className="text-earth-primary font-semibold">{latestReport.submittedBy}</p>
                  <p className="text-xs text-zinc-400">{latestReport.submitterType}</p>
                </div>

                <div className="pt-4 border-t border-zinc-100">
                  <p className="text-zinc-500 font-medium mb-2">Water Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    latestReport.waterStatus === 'Excellent' ? 'bg-emerald-100 text-emerald-700' :
                    latestReport.waterStatus === 'Good' ? 'bg-green-100 text-green-700' :
                    latestReport.waterStatus === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                    latestReport.waterStatus === 'Poor' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {latestReport.waterStatus}
                  </span>
                </div>

                <div className="pt-2 border-t border-zinc-100">
                  <p className="text-zinc-500 font-medium mb-2">Climate Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    latestReport.climateStatus === 'Excellent' ? 'bg-blue-100 text-blue-700' :
                    latestReport.climateStatus === 'Good' ? 'bg-cyan-100 text-cyan-700' :
                    latestReport.climateStatus === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                    latestReport.climateStatus === 'Challenging' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {latestReport.climateStatus}
                  </span>
                </div>

                {latestReport.currentChallenges.length > 0 && (
                  <div className="pt-4 border-t border-zinc-100">
                    <p className="text-zinc-500 font-medium mb-2">Challenges</p>
                    <div className="flex flex-wrap gap-1">
                      {latestReport.currentChallenges.map(c => (
                        <span key={c} className="text-xs bg-zinc-100 text-zinc-700 px-2 py-1 rounded">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-zinc-400 pt-4 border-t border-zinc-100">
                  Submitted: {new Date(latestReport.reportDate).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="dashboard-card sticky top-8 text-center py-8">
              <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">No reports submitted yet</p>
              <p className="text-xs text-zinc-400 mt-2">Submit your first report to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

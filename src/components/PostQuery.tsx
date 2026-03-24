import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface PostQueryProps {
  selectedVillageId: string;
}

export default function PostQuery({ selectedVillageId }: PostQueryProps) {
  const { t } = useTranslation();
  const [queryText, setQueryText] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submittedQueries, setSubmittedQueries] = useState<Array<{
    id: string;
    text: string;
    category: string;
    timestamp: string;
    status: 'submitted' | 'answered';
  }>>([]);

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'water', label: 'Water Management' },
    { value: 'crops', label: 'Crops & Agriculture' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!queryText.trim()) {
      setError(t('postQuery.queryRequired'));
      return;
    }

    if (queryText.length < 10) {
      setError(t('postQuery.queryMinLength'));
      return;
    }

    setLoading(true);
    try {
      // Simulate API call to submit query
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Add query to list
      const newQuery = {
        id: `query_${Date.now()}`,
        text: queryText,
        category: category,
        timestamp: new Date().toLocaleString(),
        status: 'submitted' as const,
      };

      setSubmittedQueries([newQuery, ...submittedQueries]);
      setSuccess(true);
      setQueryText('');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-earth-primary mb-2">
          {t('postQuery.title')}
        </h1>
        <p className="text-gray-600">{t('postQuery.description')}</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-6">
        {/* Query Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-2 bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('postQuery.askQuestion')}
          </h2>

          <form onSubmit={handleSubmitQuery} className="space-y-5">
            {/* Category */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {t('postQuery.category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-earth-primary transition-colors"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500">{t('postQuery.categoryHelp')}</p>
            </div>

            {/* Query Text */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {t('postQuery.yourQuery')}
              </label>
              <textarea
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder={t('postQuery.queryPlaceholder')}
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-earth-primary focus:ring-2 focus:ring-earth-primary/20 transition-all resize-none"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">{t('postQuery.minChars')}</p>
                <span className={`text-xs font-medium ${
                  queryText.length >= 10 
                    ? 'text-earth-primary' 
                    : 'text-gray-400'
                }`}>
                  {queryText.length} / 500
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <p className="text-sm text-emerald-700">{t('postQuery.querySubmitted')}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || queryText.length < 10}
              className="w-full py-3 bg-gradient-to-r from-earth-primary to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('postQuery.submitting')}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {t('postQuery.submitQuery')}
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-earth-primary/10 to-emerald-100/10 rounded-2xl p-6 border border-earth-primary/20 h-fit"
        >
          <h3 className="text-lg font-bold text-earth-primary mb-4">
            {t('postQuery.responseTime')}
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-earth-primary mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700">{t('postQuery.responseInfo1')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-earth-primary mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700">{t('postQuery.responseInfo2')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-earth-primary mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700">{t('postQuery.responseInfo3')}</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg border border-earth-primary/20">
            <p className="text-xs text-gray-600 leading-relaxed">
              <span className="font-semibold text-earth-primary">💡 {t('postQuery.tip')}:</span> {t('postQuery.tipText')}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Submitted Queries List */}
      {submittedQueries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('postQuery.yourQueries')} ({submittedQueries.length})
          </h2>

          <div className="space-y-4">
            {submittedQueries.map((query) => (
              <motion.div
                key={query.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 border border-gray-200 rounded-lg hover:border-earth-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-earth-primary/10 text-earth-primary text-xs font-semibold rounded-full">
                        {categories.find(c => c.value === query.category)?.label || query.category}
                      </span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        query.status === 'answered'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {query.status === 'answered' ? '✓ Answered' : '⏳ Submitted'}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">{query.text}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{query.timestamp}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

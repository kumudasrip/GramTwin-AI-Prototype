import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, AlertCircle, Search, Filter } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import type { CitizenQuery } from './PostQuery';

interface CitizenQueriesProps {
  selectedVillageId: string;
}

export default function CitizenQueries({ selectedVillageId }: CitizenQueriesProps) {
  const { t } = useTranslation();
  const [allQueries, setAllQueries] = useState<CitizenQuery[]>([]);
  const [filteredQueries, setFilteredQueries] = useState<CitizenQuery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const categories = [
    { value: 'general', label: t('postQuery.categoryGeneral') },
    { value: 'water', label: t('postQuery.categoryWater') },
    { value: 'crops', label: t('postQuery.categoryCrops') },
    { value: 'infrastructure', label: t('postQuery.categoryInfrastructure') },
    { value: 'other', label: t('postQuery.categoryOther') },
  ];

  // Load queries from localStorage
  useEffect(() => {
    const savedQueries = localStorage.getItem('citizen_queries');
    if (savedQueries) {
      try {
        const queries = JSON.parse(savedQueries);
        setAllQueries(queries);
        setFilteredQueries(queries);
      } catch (err) {
        console.error('Failed to load queries', err);
      }
    }
    setLoading(false);
  }, []);

  // Filter queries based on search and filters
  useEffect(() => {
    let filtered = allQueries;

    // Filter by village
    filtered = filtered.filter(q => q.villageId === selectedVillageId);

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(q => q.category === categoryFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => q.status === statusFilter);
    }

    setFilteredQueries(filtered);
  }, [searchTerm, categoryFilter, statusFilter, allQueries, selectedVillageId]);

  const handleUpdateStatus = (queryId: string, newStatus: 'submitted' | 'answered') => {
    const updated = allQueries.map(q =>
      q.id === queryId ? { ...q, status: newStatus } : q
    );
    setAllQueries(updated);
    localStorage.setItem('citizen_queries', JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-5 h-5 border-4 border-earth-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-4xl font-bold text-earth-primary mb-2 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          {t('citizenQueries.title')}
        </h1>
        <p className="text-sm md:text-base text-gray-600">{t('citizenQueries.description')}</p>
      </motion.div>

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-3 md:p-4 border border-gray-100 w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('common.search')}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('citizenQueries.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-earth-primary transition-colors"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('postQuery.category')}
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-earth-primary transition-colors"
            >
              <option value="all">{t('citizenQueries.allCategories')}</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('postQuery.queryStatus')}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-earth-primary transition-colors"
            >
              <option value="all">{t('citizenQueries.allStatuses')}</option>
              <option value="submitted">{t('postQuery.open')}</option>
              <option value="answered">{t('postQuery.answered')}</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Queries List */}
      {filteredQueries.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            {t('citizenQueries.queriesCount')}: {filteredQueries.length}
          </div>

          {filteredQueries.map((query, idx) => (
            <motion.div
              key={query.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:border-earth-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {/* Query ID */}
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-mono rounded-full">
                      {query.id}
                    </span>

                    {/* Category Badge */}
                    <span className="px-3 py-1 bg-earth-primary/10 text-earth-primary text-xs font-semibold rounded-full">
                      {categories.find(c => c.value === query.category)?.label || query.category}
                    </span>

                    {/* Status Badge */}
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-2 ${
                      query.status === 'answered'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {query.status === 'answered' ? '✓' : '⏳'} {query.status === 'answered' ? t('postQuery.answered') : t('postQuery.open')}
                    </span>
                  </div>

                  {/* Query Text */}
                  <p className="text-gray-900 text-base leading-relaxed mb-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    {query.text}
                  </p>

                  {/* Timestamp and Citizen ID */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-gray-500">
                    <span>{t('postQuery.queryDate')}: {query.timestamp}</span>
                    <span>Citizen ID: {query.citizenId}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleUpdateStatus(query.id, query.status === 'submitted' ? 'answered' : 'submitted')}
                  className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold text-sm md:text-base transition-all ${
                    query.status === 'submitted'
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {query.status === 'submitted'
                    ? t('citizenQueries.markAnswered')
                    : t('citizenQueries.markOpen')}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-4 md:p-8 border border-gray-100 text-center"
        >
          <MessageSquare className="w-5 h-5 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('citizenQueries.noQueries')}
          </h3>
          <p className="text-gray-600">{t('citizenQueries.noQueriesDescription')}</p>
        </motion.div>
      )}
    </div>
  );
}


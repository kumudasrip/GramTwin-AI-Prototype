import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Building2, MapPin, Key, AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { LanguageSwitcher } from './LanguageSwitcher';

interface LoginProps {
  onLogin: (organizationType: string, placeName: string, verificationCode: string) => Promise<void>;
  loading?: boolean;
}

const ORGANIZATION_TYPES = [
  'Panchayat',
  'NGO',
  'Government',
  'Municipality',
  'Research Institute',
  'Private Organization'
];

export default function Login({ onLogin, loading = false }: LoginProps) {
  const { t } = useTranslation();
  const [organizationType, setOrganizationType] = useState('Panchayat');
  const [placeName, setPlaceName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!organizationType.trim()) {
      setError(t('login.orgTypeRequired'));
      return;
    }

    if (!placeName.trim()) {
      setError(t('login.placeNameRequired'));
      return;
    }

    if (!verificationCode.trim()) {
      setError(t('login.verificationCodeRequired'));
      return;
    }

    if (verificationCode.length < 6) {
      setError(t('login.verificationCodeLength'));
      return;
    }

    // Verification code validation (alphanumeric, 6+ characters)
    if (!/^[A-Z0-9]{6,}$/.test(verificationCode.toUpperCase())) {
      setError(t('login.verificationCodeInvalid'));
      return;
    }

    try {
      setSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      await onLogin(organizationType, placeName, verificationCode);
    } catch (err) {
      setSuccess(false);
      setError(err instanceof Error ? err.message : t('common.error'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-primary/10 via-white to-earth-secondary/10 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-earth-primary/5 rounded-full -mr-48 -mt-48 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-earth-secondary/5 rounded-full -ml-48 -mb-48 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-5 h-5 bg-gradient-to-br from-earth-primary to-earth-secondary rounded-2xl flex items-center justify-center shadow-lg">
              <div className="text-3xl">🌾</div>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-earth-primary mb-2">
            {t('login.gramtwinAI')}
          </h1>
          <p className="text-zinc-600">{t('login.subtitle')}</p>
        </div>

        {/* Language Switcher */}
        <div className="flex justify-end mb-6">
          <LanguageSwitcher />
        </div>

        {/* Login Form */}
        <motion.div
          className="bg-white rounded-2xl shadow-2xl p-8 border border-earth-primary/10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Type */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-zinc-700 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-earth-primary" />
                {t('login.organizationType')}
              </label>
              <select
                value={organizationType}
                onChange={(e) => setOrganizationType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-zinc-200 rounded-lg focus:outline-none focus:border-earth-primary transition-colors bg-white font-medium"
              >
                {ORGANIZATION_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Place Name */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-zinc-700 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-earth-primary" />
                {t('login.placeName')}
              </label>
              <input
                type="text"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                placeholder={t('login.placeNamePlaceholder')}
                className="w-full px-4 py-3 border-2 border-zinc-200 rounded-lg focus:outline-none focus:border-earth-primary focus:ring-2 focus:ring-earth-primary/20 transition-all"
              />
              <p className="text-xs text-zinc-500">{t('login.placeNameHelp')}</p>
            </div>

            {/* Verification Code */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-zinc-700 flex items-center gap-2">
                <Key className="w-5 h-5 text-earth-primary" />
                {t('login.verificationCode')}
              </label>
              <input
                type="password"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                placeholder={t('login.verificationCodePlaceholder')}
                className="w-full px-4 py-3 border-2 border-zinc-200 rounded-lg focus:outline-none focus:border-earth-primary focus:ring-2 focus:ring-earth-primary/20 transition-all font-mono tracking-widest"
              />
              <p className="text-xs text-zinc-500">{t('login.verificationCodeHelp')}</p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-50 border-l-4 border-green-500 rounded flex items-gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">{t('login.verificationSuccess')}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 bg-gradient-to-r from-earth-primary to-earth-secondary text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock className="w-5 h-5" />
              {loading ? t('login.verifying') : t('login.login')}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-earth-primary/5 rounded-lg border border-earth-primary/20">
            <p className="text-xs text-zinc-600 leading-relaxed">
              <span className="font-semibold text-earth-primary">🔒 {t('login.securityNote')}:</span> {t('login.securityMessage')}
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-zinc-500">
          <p>© 2026 GramTwin AI. {t('login.securePlatform')}</p>
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mail, Building2, MapPin, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, Globe, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onCitizenLogin: () => void;
  onOrgLogin: (email: string, orgType: string, placeName: string, role: 'org') => Promise<void>;
}

type UserMode = 'citizen' | 'organization' | null;
type FormStep = 'mode-select' | 'org-form' | 'otp-verification';

const ORG_TYPES = [
  'Panchayat',
  'NGO',
  'Government',
  'Municipality',
  'Research Institute',
  'Private Organization',
  'Agricultural Cooperative',
  'Community Group',
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'te', label: 'తెలుగు' },
];

export default function LoginPage({ onCitizenLogin, onOrgLogin }: LoginPageProps) {
  // Language state
  const [language, setLanguage] = useState<'en' | 'te'>('en');

  // Form state
  const [userMode, setUserMode] = useState<UserMode>(null);
  const [formStep, setFormStep] = useState<FormStep>('mode-select');
  const [formData, setFormData] = useState({
    email: '',
    orgType: 'Panchayat',
    placeName: '',
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Translations
  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        'title': 'GramTwin AI',
        'subtitle': 'Village Digital Twin Platform',
        'selectMode': 'Choose your access level',
        'continueCitizen': 'Continue as Citizen',
        'citizenDesc': 'View map, soil & crops, infrastructure',
        'loginOrg': 'Login as Organization',
        'orgDesc': 'Full access with data editing & reports',
        'email': 'Email',
        'orgType': 'Organization Type',
        'placeName': 'Place Name (Village/District)',
        'placePlaceholder': 'e.g., Narsing Batla, Vikarabad',
        'password': 'Temporary Password (if provided)',
        'sendOtp': 'Send OTP',
        'sending': 'Sending...',
        'otpSent': 'OTP sent to your email',
        'otpCode': 'Enter 6-digit OTP',
        'verify': 'Verify OTP',
        'verifying': 'Verifying...',
        'emailRequired': 'Email is required',
        'emailInvalid': 'Please enter a valid email',
        'orgTypeRequired': 'Organization type is required',
        'placeNameRequired': 'Place name is required',
        'otpRequired': 'OTP is required',
        'otpInvalid': 'OTP must be 6 digits',
        'loginSuccess': 'Login successful! Redirecting...',
        'security': 'Security Notice',
        'securityMsg': 'This platform protects village data with verified codes. Unauthorized access denied.',
        'permissions': 'Permissions',
        'citizenCan': 'Citizen can',
        'orgCan': 'Organization can',
        'viewMap': 'View interactive map',
        'soilCrops': 'View soil & crop data',
        'infrastructure': 'View infrastructure',
        'multilingual': 'Access in multiple languages',
        'dashboard': 'Access dashboard',
        'editData': 'Edit village data',
        'generateReports': 'Generate & submit reports',
        'back': 'Back',
        'backToMode': 'Back to mode selection',
        'resendOtp': 'Resend OTP',
      },
      te: {
        'title': 'గ్రామ్ ట్విన్ AI',
        'subtitle': 'గ్రామ డిజిటల్ ట్విన్ ప్లాట్‌ఫారమ్',
        'selectMode': 'మీ యాక్సెస్ స్థాయి ఎంచుకోండి',
        'continueCitizen': 'నాగరికుడిగా కొనసాగండి',
        'citizenDesc': 'మ్యాప్, మట్టి & పంటలు, ఆధారభూత సంరచన చూడండి',
        'loginOrg': 'సంస్థగా లాగిన్ చేయండి',
        'orgDesc': 'డేటా సవరణ & నివేదనలతో పూర్ణ యాక్సెస్',
        'email': 'ఇమెయిల్',
        'orgType': 'సంస్థ రకం',
        'placeName': 'స్థల పేరు (గ్రామం/జిల్లా)',
        'placePlaceholder': 'ఉ.దా., నార్సింగ్ బట్ల, వికారాబాద్',
        'password': 'తాత్కాలిక పాస్‌వర్డ్ (అందిస్తే)',
        'sendOtp': 'OTP పంపండి',
        'sending': 'పంపుతున్నాము...',
        'otpSent': 'OTP మీ ఇమెయిల్‌కు పంపబడింది',
        'otpCode': '6-అంకె OTP నమోదు చేయండి',
        'verify': 'OTP ధృవీకరించండి',
        'verifying': 'ధృవీకరిస్తున్నాము...',
        'emailRequired': 'ఇమెయిల్ అవసరం',
        'emailInvalid': 'దయచేసి చెల్లుబాటు అయిన ఇమెయిల్ నమోదు చేయండి',
        'orgTypeRequired': 'సంస్థ రకం అవసరం',
        'placeNameRequired': 'స్థల పేరు అవసరం',
        'otpRequired': 'OTP అవసరం',
        'otpInvalid': 'OTP 6 అంకెలు ఉండాలి',
        'loginSuccess': 'లాగిన్ విజయవంతమైంది! దిశ మార్పు చేస్తున్నాము...',
        'security': 'సంరక్షణ గమనిక',
        'securityMsg': 'ఈ ప్లాట్‌ఫారమ్ గ్రామ డేటాను ధృవీకృత కోడ్‌లతో రక్షిస్తుంది. అననిర్దేశిత ప్రవేశం నిషేధించబడింది.',
        'permissions': 'అనుమతులు',
        'citizenCan': 'నాగరికుడు చేయగలరు',
        'orgCan': 'సంస్థ చేయగలదు',
        'viewMap': 'ఇంటరాక్టివ్ మ్యాప్ చూడండి',
        'soilCrops': 'మట్టి & పంటల డేటా చూడండి',
        'infrastructure': 'ఆధారభూత సంరచన చూడండి',
        'multilingual': 'బహుభాషిక ఎంపికలు యాక్సెస్ చేయండి',
        'dashboard': 'డ్యాష్‌బోర్డ్ యాక్సెస్ చేయండి',
        'editData': 'గ్రామ డేటా సవరించండి',
        'generateReports': 'నివేదనలు రూపొందించండి & సమర్పించండి',
        'back': 'వెనుకకు',
        'backToMode': 'మోడ్ ఎంపిక కు వెనుకకు',
        'resendOtp': 'OTP తిరిగి పంపండి',
      },
    };
    return translations[language]?.[key] || key;
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleCitizenMode = () => {
    setLoading(true);
    setTimeout(() => {
      onCitizenLogin();
    }, 500);
  };

  const handleOrgModeSelect = () => {
    setUserMode('organization');
    setFormStep('org-form');
    setError(null);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.email.trim()) {
      setError(t('emailRequired'));
      return;
    }
    if (!validateEmail(formData.email)) {
      setError(t('emailInvalid'));
      return;
    }
    if (!formData.orgType.trim()) {
      setError(t('orgTypeRequired'));
      return;
    }
    if (!formData.placeName.trim()) {
      setError(t('placeNameRequired'));
      return;
    }

    setLoading(true);
    try {
      // Simulate API call to send OTP
      // In production: await fetch('/auth/org-signup', { ... })
      await new Promise(resolve => setTimeout(resolve, 1200));

      setOtpSent(true);
      setFormStep('otp-verification');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp.trim()) {
      setError(t('otpRequired'));
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setError(t('otpInvalid'));
      return;
    }

    setLoading(true);
    try {
      // Simulate API call to verify OTP
      // In production: await fetch('/auth/verify-otp', { ... })
      await new Promise(resolve => setTimeout(resolve, 1200));

      setSuccess(true);
      setTimeout(async () => {
        await onOrgLogin(formData.email, formData.orgType, formData.placeName, 'org');
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setFormStep('org-form');
    setOtp('');
    setOtpSent(false);
    setError(null);
  };

  const handleBackToMode = () => {
    setUserMode(null);
    setFormStep('mode-select');
    setFormData({ email: '', orgType: 'Panchayat', placeName: '' });
    setOtp('');
    setOtpSent(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/30 rounded-full -mr-48 -mt-48 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full -ml-48 -mb-48 blur-3xl" />

      {/* Language toggle */}
      <div className="absolute top-6 right-6 z-20">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code as 'en' | 'te')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-2 ${
                language === lang.code
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Globe className="w-3 h-3" />
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl shadow-lg mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-3xl">🌾</div>
          </motion.div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600 text-lg">{t('subtitle')}</p>
        </div>

        <AnimatePresence mode="wait">
          {/* Mode Selection */}
          {formStep === 'mode-select' && (
            <motion.div
              key="mode-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 mb-8"
            >
              <p className="text-center text-gray-600 font-medium mb-6">{t('selectMode')}</p>

              {/* Citizen Mode */}
              <motion.button
                whileHover={{ y: -4 }}
                onClick={handleCitizenMode}
                disabled={loading}
                className="w-full p-6 bg-white rounded-2xl border-2 border-emerald-500 hover:shadow-lg transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-emerald-700">{t('continueCitizen')}</h3>
                  <motion.div
                    animate={loading ? { rotate: 360 } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5 text-emerald-600" />
                  </motion.div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{t('citizenDesc')}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    ✓ {t('viewMap')}
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    ✓ {t('soilCrops')}
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    ✓ {t('multilingual')}
                  </span>
                </div>
              </motion.button>

              {/* Organization Mode */}
              <motion.button
                whileHover={{ y: -4 }}
                onClick={handleOrgModeSelect}
                className="w-full p-6 bg-white rounded-2xl border-2 border-blue-500 hover:shadow-lg transition-all text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-blue-700">{t('loginOrg')}</h3>
                  <ArrowRight className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-gray-600 text-sm mb-4">{t('orgDesc')}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    ✓ {t('editData')}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    ✓ {t('generateReports')}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    ✓ {t('dashboard')}
                  </span>
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* Organization Form */}
          {formStep === 'org-form' && (
            <motion.div
              key="org-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <form onSubmit={handleSendOTP} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">{t('email')}</label>
                  <input
                    type="email"
                    autoFocus
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Organization Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    {t('orgType')}
                  </label>
                  <select
                    value={formData.orgType}
                    onChange={e => setFormData({ ...formData, orgType: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    {ORG_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Place Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {t('placeName')}
                  </label>
                  <input
                    type="text"
                    value={formData.placeName}
                    onChange={e => setFormData({ ...formData, placeName: e.target.value })}
                    placeholder={t('placePlaceholder')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-center gap-2"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </motion.div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleBackToMode}
                    className="flex-1 px-4 py-3 text-blue-600 font-semibold border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    {t('back')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('sending')}
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        {t('sendOtp')}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* OTP Verification */}
          {formStep === 'otp-verification' && (
            <motion.div
              key="otp-verification"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-6">
                <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-3" />
                <p className="text-emerald-700 font-semibold">{t('otpSent')}</p>
                <p className="text-gray-600 text-sm mt-1">{formData.email}</p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-5">
                {/* OTP Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">{t('otpCode')}</label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-4 py-4 text-center text-2xl font-bold tracking-widest border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <div className="flex gap-1 justify-center">
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i < otp.length ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-center gap-2"
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
                    className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <p className="text-sm text-emerald-700">{t('loginSuccess')}</p>
                  </motion.div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleBackToForm}
                    disabled={loading}
                    className="flex-1 px-4 py-3 text-emerald-600 font-semibold border-2 border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50"
                  >
                    {t('back')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('verifying')}
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        {t('verify')}
                      </>
                    )}
                  </button>
                </div>

                {/* Resend OTP */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleBackToForm}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {t('resendOtp')}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Permissions Info */}
        {formStep === 'mode-select' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-8 grid grid-cols-2 gap-4"
          >
            {/* Citizen Permissions */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-emerald-200">
              <h4 className="font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {t('citizenCan')}
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">✓</span>
                  <span>{t('viewMap')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">✓</span>
                  <span>{t('soilCrops')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>{t('editData')}</span>
                </li>
              </ul>
            </div>

            {/* Organization Permissions */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {t('orgCan')}
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span>{t('editData')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span>{t('generateReports')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">✓</span>
                  <span>{t('dashboard')}</span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-8 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-lg"
        >
          <p className="text-xs font-semibold text-amber-900 mb-2">🔒 {t('security')}</p>
          <p className="text-sm text-amber-800 leading-relaxed">{t('securityMsg')}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}

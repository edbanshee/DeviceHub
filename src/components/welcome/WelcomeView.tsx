import React from 'react';
import {
  Cpu,
  HardDrive,
  Gamepad2,
  Package,
  Cloud,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Globe,
  Database,
  Layers,
  Lock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface WelcomeViewProps {
  onEnterGuest: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onEnterGuest }) => {
  const { signInWithGoogle, isSigningIn, authError, clearAuthError } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fb] dark:bg-[#0e0e10] text-slate-900 dark:text-[#f4f4f5] transition-colors duration-200 selection:bg-purple-600 selection:text-white relative overflow-hidden">
      {/* Background Subtle Ambient Glows */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-purple-500/10 via-indigo-500/15 to-violet-500/10 dark:from-purple-900/20 dark:via-indigo-900/25 dark:to-violet-900/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[400px] bg-purple-500/10 dark:bg-purple-950/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header Bar */}
      <header className="w-full border-b border-slate-200/80 dark:border-[#232328] bg-white/70 dark:bg-[#121214]/70 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-[#f4f4f5] leading-none">
                {t('appName')}
              </span>
              <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 tracking-wider uppercase mt-0.5">
                Vault & Matrix
              </span>
            </div>
          </div>

          {/* Quick Controls: Theme & Language */}
          <div className="flex items-center gap-2">
            {/* Language Switch */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-[#d4d4d8] bg-slate-100 dark:bg-[#1c1c20] hover:bg-slate-200 dark:hover:bg-[#282830] border border-slate-200/80 dark:border-[#2d2d34] transition-colors cursor-pointer"
              title="Cambiar idioma / Change language"
            >
              <Globe className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="uppercase">{language}</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-[#1c1c20] text-slate-700 dark:text-[#d4d4d8] hover:bg-slate-200 dark:hover:bg-[#282830] border border-slate-200/80 dark:border-[#2d2d34] transition-colors cursor-pointer"
              title="Alternar tema claro / oscuro"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-purple-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col justify-center">
        {/* Auth Error Banner if present */}
        {authError && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                  {authError.startsWith('auth/unauthorized-domain')
                    ? t('authUnauthorizedDomainTitle')
                    : 'Error de Autenticación'}
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5 max-w-2xl leading-relaxed">
                  {authError.startsWith('auth/unauthorized-domain:')
                    ? t('authUnauthorizedDomainDesc', { domain: authError.split(':')[1] || window.location.hostname })
                    : authError}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearAuthError}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 hover:bg-amber-300 transition-colors"
            >
              Cerrar aviso
            </button>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 text-xs font-bold mb-6 shadow-xs animate-in fade-in slide-in-from-top-3 duration-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>{t('welcomeBadge')}</span>
          </div>

          {/* Hero Title */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-[#f4f4f5] leading-tight sm:leading-tight mb-5">
            {t('welcomeHeroTitle')}
          </h1>

          {/* Hero Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-[#a1a1aa] leading-relaxed max-w-2xl mx-auto mb-8 font-normal">
            {t('welcomeHeroSubtitle')}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            {/* Primary Google Login CTA */}
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              disabled={isSigningIn}
              className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-lg shadow-purple-600/25 dark:shadow-purple-900/40 transition-all transform active:scale-98 cursor-pointer ${
                isSigningIn ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSigningIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('authSyncing')}</span>
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4" />
                  <span>{t('welcomeBtnGoogle')}</span>
                </>
              )}
            </button>

            {/* Secondary Guest / Demo CTA */}
            <button
              type="button"
              onClick={onEnterGuest}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-sm text-slate-700 dark:text-[#d4d4d8] bg-white dark:bg-[#18181c] hover:bg-slate-100 dark:hover:bg-[#222226] border border-slate-300 dark:border-[#2d2d34] shadow-sm transition-all transform active:scale-98 cursor-pointer"
            >
              <span>{t('welcomeBtnGuest')}</span>
              <ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </button>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-3">
            {t('welcomeBtnGuestTip')}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-12">
          {/* Feature 1: Devices */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#161619] border border-slate-200/90 dark:border-[#242429] shadow-xs hover:border-purple-300 dark:hover:border-purple-800/60 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-4 border border-purple-200/60 dark:border-purple-800/40 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-[#f4f4f5] mb-1.5">
              {t('welcomeFeatureDevicesTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a1a1aa] leading-relaxed">
              {t('welcomeFeatureDevicesDesc')}
            </p>
          </div>

          {/* Feature 2: Storage */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#161619] border border-slate-200/90 dark:border-[#242429] shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800/60 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center mb-4 border border-indigo-200/60 dark:border-indigo-800/40 group-hover:scale-105 transition-transform">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-[#f4f4f5] mb-1.5">
              {t('welcomeFeatureStorageTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a1a1aa] leading-relaxed">
              {t('welcomeFeatureStorageDesc')}
            </p>
          </div>

          {/* Feature 3: Matrix */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#161619] border border-slate-200/90 dark:border-[#242429] shadow-xs hover:border-violet-300 dark:hover:border-violet-800/60 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 flex items-center justify-center mb-4 border border-violet-200/60 dark:border-violet-800/40 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-[#f4f4f5] mb-1.5">
              {t('welcomeFeatureMatrixTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a1a1aa] leading-relaxed">
              {t('welcomeFeatureMatrixDesc')}
            </p>
          </div>

          {/* Feature 4: Accessories */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#161619] border border-slate-200/90 dark:border-[#242429] shadow-xs hover:border-pink-300 dark:hover:border-pink-800/60 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300 flex items-center justify-center mb-4 border border-pink-200/60 dark:border-pink-800/40 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-[#f4f4f5] mb-1.5">
              {t('welcomeFeatureAccessoriesTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#a1a1aa] leading-relaxed">
              {t('welcomeFeatureAccessoriesDesc')}
            </p>
          </div>
        </div>

        {/* Key Guarantees Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 py-4 border-t border-slate-200/70 dark:border-[#232328] text-xs text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/70 dark:bg-[#16161a] border border-slate-200/60 dark:border-[#242429]">
            <Cloud className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>{t('welcomePillCloud')}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/70 dark:bg-[#16161a] border border-slate-200/60 dark:border-[#242429]">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('welcomePillPrivacy')}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/70 dark:bg-[#16161a] border border-slate-200/60 dark:border-[#242429]">
            <Database className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{t('welcomePillExport')}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/70 dark:bg-[#16161a] border border-slate-200/60 dark:border-[#242429]">
            <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t('welcomePillOffline')}</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-[#232328] py-5 text-center text-xs text-slate-400 dark:text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <span>{t('welcomeFooter')}</span>
        </div>
      </footer>
    </div>
  );
};

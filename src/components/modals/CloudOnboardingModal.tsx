import React from 'react';
import { Cloud, CloudUpload, Sparkles, Check } from 'lucide-react';
import { useStorage } from '../../context/StorageContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const CloudOnboardingModal: React.FC = () => {
  const {
    showOnboardingModal,
    closeOnboardingModal,
    confirmCloudImport,
    confirmCloudFresh,
    pendingImportCounts,
  } = useStorage();
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!showOnboardingModal) return null;

  // Determine actual local counts to import
  const getLocalCounts = () => {
    if (pendingImportCounts && (pendingImportCounts.devices > 0 || pendingImportCounts.drives > 0)) {
      return pendingImportCounts;
    }
    try {
      const bDevs =
        localStorage.getItem('storage_tracker_guest_backup_devices') ||
        localStorage.getItem('storage_tracker_devices');
      const bDrives =
        localStorage.getItem('storage_tracker_guest_backup_drives') ||
        localStorage.getItem('storage_tracker_drives');
      const devs = bDevs ? JSON.parse(bDevs) : [];
      const drvs = bDrives ? JSON.parse(bDrives) : [];
      return {
        devices: Array.isArray(devs) ? devs.length : 0,
        drives: Array.isArray(drvs) ? drvs.length : 0,
      };
    } catch {
      return { devices: 0, drives: 0 };
    }
  };

  const counts = getLocalCounts();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-indigo-200 dark:border-indigo-900/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Glow Header */}
        <div className="relative p-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white text-center overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner mb-3">
              <Cloud className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-extrabold tracking-tight">
              {t('onboardingTitle')}
            </h3>
            <p className="text-xs text-indigo-100/90 mt-1.5 max-w-sm">
              {t('onboardingSubtitle', { email: user?.email || 'tu cuenta de Google' })}
            </p>
          </div>
          {/* Background circles */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-purple-500/20 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Question & Options */}
        <div className="p-6 space-y-4">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {t('onboardingQuestion')}
          </p>

          <div className="space-y-3">
            {/* Option A: Import local data */}
            <button
              type="button"
              onClick={confirmCloudImport}
              className="w-full text-left p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/30 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm mt-0.5 group-hover:scale-105 transition-transform">
                  <CloudUpload className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {t('onboardingOptionSyncTitle')}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/80 dark:text-indigo-200">
                      {t('onboardingBadgeRecommended')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {t('onboardingOptionSyncDesc', {
                      deviceCount: counts.devices,
                      driveCount: counts.drives,
                    })}
                  </p>
                </div>
              </div>
            </button>

            {/* Option B: Start clean */}
            <button
              type="button"
              onClick={confirmCloudFresh}
              className="w-full text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm mt-0.5 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {t('onboardingOptionFreshTitle')}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t('onboardingOptionFreshDesc')}
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={closeOnboardingModal}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline cursor-pointer"
            >
              {t('onboardingDecideLater')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

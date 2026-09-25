import React, { useState, useMemo } from 'react';
import {
  Gamepad2,
  Search,
  Star,
  Sparkles,
  Info,
  Filter,
  CheckCircle2,
  X,
  Layers,
  LayoutGrid,
  Table as TableIcon,
  HelpCircle,
} from 'lucide-react';
import { Device, EmulationSystem } from '../../types';
import { useStorage } from '../../context/StorageContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  EMULATION_SYSTEMS,
  EMULATION_GROUPS,
  RATING_DESCRIPTIONS,
} from '../../data/emulationCatalog';

export const EmulationMatrixView: React.FC = () => {
  const { devices, updateEmulationScore, clearEmulationScore } = useStorage();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [searchPlatform, setSearchPlatform] = useState('');
  const [searchConsole, setSearchConsole] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [onlyEvaluated, setOnlyEvaluated] = useState(false);
  const [matrixViewMode, setMatrixViewMode] = useState<'detailed' | 'horizontal'>('detailed');

  // Active rating popover
  const [activeCell, setActiveCell] = useState<{
    deviceId: string;
    systemId: string;
    currentScore: number;
    systemName: string;
    deviceName: string;
  } | null>(null);

  // Only devices where isGamingDevice === true are permitted in the matrix!
  const gamingDevices = useMemo(() => {
    return devices.filter((d) => {
      if (!d.isGamingDevice) return false;
      if (searchConsole.trim()) {
        const q = searchConsole.toLowerCase();
        const matchName = d.name.toLowerCase().includes(q);
        const matchSys = d.system.toLowerCase().includes(q);
        const matchCpu = (d.cpu || '').toLowerCase().includes(q);
        if (!matchName && !matchSys && !matchCpu) return false;
      }
      return true;
    });
  }, [devices, searchConsole]);

  // Filtered systems list
  const filteredSystems = useMemo(() => {
    return EMULATION_SYSTEMS.filter((sys) => {
      // Group filter
      if (selectedGroup !== 'all' && sys.groupId !== selectedGroup) return false;

      // Text search
      if (searchPlatform.trim()) {
        const q = searchPlatform.toLowerCase();
        const matchName = sys.name.toLowerCase().includes(q);
        const matchAlt = sys.shortName?.toLowerCase().includes(q);
        const matchManufacturer = sys.manufacturer?.toLowerCase().includes(q);
        if (!matchName && !matchAlt && !matchManufacturer) return false;
      }

      // Only evaluated filter
      if (onlyEvaluated) {
        const hasAnyScore = gamingDevices.some(
          (d) => d.emulationScores && d.emulationScores[sys.id] !== undefined
        );
        if (!hasAnyScore) return false;
      }

      return true;
    });
  }, [selectedGroup, searchPlatform, onlyEvaluated, gamingDevices]);

  const handleRate = async (deviceId: string, systemId: string, rating: number) => {
    try {
      await updateEmulationScore(deviceId, systemId, rating);
      showToast(t('toastScoreUpdated'), 'success');
      setActiveCell(null);
    } catch (err: any) {
      showToast(err?.message || 'Error al actualizar calificación', 'error');
    }
  };

  const handleClear = async (deviceId: string, systemId: string) => {
    try {
      await clearEmulationScore(deviceId, systemId);
      showToast('Calificación eliminada.', 'info');
      setActiveCell(null);
    } catch (err: any) {
      showToast(err?.message || 'Error al eliminar calificación', 'error');
    }
  };

  // Group styling helper
  const getGroupBadgeColor = (groupId: string) => {
    switch (groupId) {
      case 'gen2':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-700/60';
      case 'gen3':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border-orange-300 dark:border-orange-700/60';
      case 'gen4':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60';
      case 'gen5':
        return 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
      case 'gen6':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border-sky-300 dark:border-sky-700/60';
      case 'gen7':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-700/60';
      case 'modern':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700/60';
      case 'arcade_ports':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-300 dark:border-teal-700/60';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
    }
  };

  const getScoreChip = (score?: number) => {
    if (!score) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-6 rounded-md font-mono text-[11px] font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700/60">
          -
        </span>
      );
    }
    if (score === 5) {
      return (
        <span className="inline-flex items-center justify-center px-1.5 h-6 rounded-md font-mono text-[11px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40">
          5
        </span>
      );
    }
    if (score === 4) {
      return (
        <span className="inline-flex items-center justify-center px-1.5 h-6 rounded-md font-mono text-[11px] font-extrabold bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/40">
          4
        </span>
      );
    }
    if (score === 3) {
      return (
        <span className="inline-flex items-center justify-center px-1.5 h-6 rounded-md font-mono text-[11px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/40">
          3
        </span>
      );
    }
    if (score === 2) {
      return (
        <span className="inline-flex items-center justify-center px-1.5 h-6 rounded-md font-mono text-[11px] font-extrabold bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/40">
          2
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center px-1.5 h-6 rounded-md font-mono text-[11px] font-extrabold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/40">
        1
      </span>
    );
  };

  if (devices.filter((d) => d.isGamingDevice).length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-4">
          <Gamepad2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {t('matrixNoGamingDevicesTitle')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
          {t('matrixNoGamingDevicesDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. Header with Title & Rating Scale Chips (Screenshot 3) */}
      <div className="p-5 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800/60 shrink-0">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('matrixGlobalTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('matrixGlobalSubtitle', { count: gamingDevices.length })}
            </p>
          </div>
        </div>

        {/* Rating Scale Legend Chips directly on header */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono">
          <span className="px-2 py-1 rounded-lg font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            5 = {t('matrixScaleFullSpeed')}
          </span>
          <span className="px-2 py-1 rounded-lg font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
            4 = {t('matrixScaleVeryGood')}
          </span>
          <span className="px-2 py-1 rounded-lg font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            3 = {t('matrixScalePlayable')}
          </span>
          <span className="px-2 py-1 rounded-lg font-bold bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">
            2 = {t('matrixScaleSlow')}
          </span>
          <span className="px-2 py-1 rounded-lg font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            1 = {t('matrixScaleUnplayable')}
          </span>
          <span className="px-2 py-1 rounded-lg font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
            - = {t('matrixScaleUntested')}
          </span>
        </div>
      </div>

      {/* 2. Generation Filter Tabs (Screenshot 3) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <button
          type="button"
          onClick={() => setSelectedGroup('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedGroup === 'all'
              ? 'bg-purple-600 text-white shadow-xs font-bold'
              : 'bg-white dark:bg-[#18181c] text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#f4f4f5] border border-slate-200 dark:border-[#27272b]'
          }`}
        >
          {t('matrixTabAllGenerations')} ({EMULATION_SYSTEMS.length})
        </button>

        {EMULATION_GROUPS.map((grp) => {
          const count = EMULATION_SYSTEMS.filter((s) => s.groupId === grp.id).length;
          const groupName =
            typeof grp.name === 'string'
              ? grp.name
              : (grp.name as any)[language] || (grp.name as any).es;

          return (
            <button
              key={grp.id}
              type="button"
              onClick={() => setSelectedGroup(grp.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedGroup === grp.id
                  ? 'bg-purple-600 text-white shadow-xs font-bold'
                  : 'bg-white dark:bg-[#18181c] text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#f4f4f5] border border-slate-200 dark:border-[#27272b]'
              }`}
            >
              {groupName} ({count})
            </button>
          );
        })}
      </div>

      {/* 3. Search & View Mode Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          {/* Console search */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-[#71717a]" />
            <input
              type="text"
              maxLength={60}
              value={searchConsole}
              onChange={(e) => setSearchConsole(e.target.value)}
              placeholder={t('matrixSearchPlaceholder')}
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] rounded-xl text-xs text-slate-900 dark:text-[#f4f4f5] placeholder:text-slate-400 dark:placeholder:text-[#71717a] focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
            />
          </div>

          {/* Platform filter */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-[#71717a]" />
            <input
              type="text"
              maxLength={60}
              value={searchPlatform}
              onChange={(e) => setSearchPlatform(e.target.value)}
              placeholder={t('matrixFilterPlatformPlaceholder')}
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] rounded-xl text-xs text-slate-900 dark:text-[#f4f4f5] placeholder:text-slate-400 dark:placeholder:text-[#71717a] focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
            />
          </div>
        </div>

        {/* View mode toggle & only evaluated */}
        <div className="flex items-center gap-2 justify-end">
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] rounded-xl text-xs font-medium text-slate-700 dark:text-[#d4d4d8] cursor-pointer shadow-xs">
            <input
              type="checkbox"
              checked={onlyEvaluated}
              onChange={(e) => setOnlyEvaluated(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            <span>{t('matrixOnlyEvaluated')}</span>
          </label>

          <div className="flex items-center p-1 bg-slate-100 dark:bg-[#18181c] rounded-xl border border-slate-200 dark:border-[#27272b] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMatrixViewMode('detailed')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                matrixViewMode === 'detailed'
                  ? 'bg-white dark:bg-[#222226] text-purple-600 dark:text-purple-300 shadow-xs border border-slate-200/60 dark:border-[#323238]'
                  : 'text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#f4f4f5]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('matrixViewDetailed')}</span>
            </button>
            <button
              type="button"
              onClick={() => setMatrixViewMode('horizontal')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                matrixViewMode === 'horizontal'
                  ? 'bg-white dark:bg-[#222226] text-purple-600 dark:text-purple-300 shadow-xs border border-slate-200/60 dark:border-[#323238]'
                  : 'text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#f4f4f5]'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('matrixViewHorizontal')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main Matrix Rendering */}
      {matrixViewMode === 'detailed' ? (
        /* Detailed Catalog View (Favorite version with platform metadata & console scores) */
        <div className="bg-white dark:bg-[#18181c] rounded-2xl border border-slate-200 dark:border-[#27272b] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 sm:px-6 w-56">Plataforma / Sistema</th>
                  <th className="py-3 px-4 w-32">Generación</th>
                  <th className="py-3 px-4 w-32">Fabricante</th>
                  <th className="py-3 px-4 w-24">Año</th>
                  {gamingDevices.map((dev) => (
                    <th key={dev.id} className="py-3 px-4 text-center min-w-[140px]">
                      <div className="font-extrabold font-mono text-purple-600 dark:text-purple-400 truncate">
                        {dev.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate font-normal">
                        {dev.cpu || '-'}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredSystems.map((sys) => {
                  const grp = EMULATION_GROUPS.find((g) => g.id === sys.groupId);
                  const groupName = grp
                    ? typeof grp.name === 'string'
                      ? grp.name
                      : (grp.name as any)[language] || (grp.name as any).es
                    : sys.groupId;

                  return (
                    <tr
                      key={sys.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Platform info */}
                      <td className="py-3 px-4 sm:px-6">
                        <div className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                          {sys.name}
                        </div>
                        {sys.shortName && sys.shortName !== sys.name && (
                          <div className="text-[10px] text-slate-400">
                            aka {sys.shortName}
                          </div>
                        )}
                      </td>

                      {/* Generation badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${getGroupBadgeColor(
                            sys.groupId
                          )}`}
                        >
                          {groupName}
                        </span>
                      </td>

                      {/* Manufacturer */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">
                        {sys.manufacturer || '-'}
                      </td>

                      {/* Year */}
                      <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                        {sys.year || '-'}
                      </td>

                      {/* Console Ratings */}
                      {gamingDevices.map((dev) => {
                        const score = dev.emulationScores?.[sys.id];
                        return (
                          <td key={dev.id} className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveCell({
                                  deviceId: dev.id,
                                  systemId: sys.id,
                                  currentScore: score || 0,
                                  systemName: sys.name,
                                  deviceName: dev.name,
                                })
                              }
                              className="group/btn inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                              title={`Calificar ${sys.name} en ${dev.name}`}
                            >
                              {getScoreChip(score)}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Horizontal Matrix (Consoles on rows, Platforms on columns) */
        <div className="bg-white dark:bg-[#18181c] rounded-2xl border border-slate-200 dark:border-[#27272b] shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-w-full scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#27272b] bg-slate-50/70 dark:bg-[#1f1f23]/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#a1a1aa]">
                  <th className="py-3 px-4 sm:px-6 sticky left-0 bg-slate-100 dark:bg-[#1f1f23] z-10 w-48 shadow-xs">
                    {t('matrixColConsole')}
                  </th>
                  <th className="py-3 px-4 w-40">{t('matrixColOS')}</th>
                  <th className="py-3 px-4 w-48">{t('matrixColCpu')}</th>
                  {filteredSystems.map((sys) => (
                    <th key={sys.id} className="py-3 px-2 text-center min-w-[50px]">
                      <span
                        title={sys.name}
                        className="font-mono text-[10px] text-slate-700 dark:text-[#d4d4d8] font-bold block truncate max-w-[70px]"
                      >
                        {sys.shortName || sys.name.slice(0, 8)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#27272b]">
                {gamingDevices.map((dev) => (
                  <tr
                    key={dev.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-[#222226]/50 transition-colors"
                  >
                    <td className="py-3 px-4 sm:px-6 sticky left-0 bg-white dark:bg-[#18181c] z-10 font-bold font-mono text-purple-600 dark:text-purple-400 shadow-xs border-r border-slate-200 dark:border-[#27272b]">
                      {dev.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-[#a1a1aa]">
                      {dev.system}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 dark:text-[#a1a1aa] truncate max-w-[200px]">
                      {dev.cpu || '-'}
                    </td>
                    {filteredSystems.map((sys) => {
                      const score = dev.emulationScores?.[sys.id];
                      return (
                        <td key={sys.id} className="py-3 px-2 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveCell({
                                deviceId: dev.id,
                                systemId: sys.id,
                                currentScore: score || 0,
                                systemName: sys.name,
                                deviceName: dev.name,
                              })
                            }
                            className="inline-flex items-center justify-center hover:scale-110 transition-transform"
                          >
                            {getScoreChip(score)}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Rating Modal / Popover */}
      {activeCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-[#18181c] rounded-2xl border border-slate-200 dark:border-[#27272b] shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#27272b]">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-[#f4f4f5]">
                  {activeCell.systemName}
                </h4>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  {activeCell.deviceName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCell(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-[#f4f4f5] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-[#a1a1aa] block">
                {t('matrixRatePrompt')}
              </span>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((stars) => (
                  <button
                    key={stars}
                    type="button"
                    onClick={() =>
                      handleRate(activeCell.deviceId, activeCell.systemId, stars)
                    }
                    className={`py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border font-mono font-bold text-xs transition-all ${
                      activeCell.currentScore === stars
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-[#222226] text-slate-700 dark:text-[#d4d4d8] border-slate-200 dark:border-[#2f2f36] hover:border-purple-400'
                    }`}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        activeCell.currentScore >= stars
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-400'
                      }`}
                    />
                    <span>{stars}★</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-[#27272b]">
              {activeCell.currentScore > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    handleClear(activeCell.deviceId, activeCell.systemId)
                  }
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors"
                >
                  {t('matrixClearRating')}
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveCell(null)}
                className="ml-auto px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-[#222226] text-slate-700 dark:text-[#d4d4d8] hover:bg-slate-200 dark:hover:bg-[#2a2a30] transition-colors"
              >
                {t('btnClose')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

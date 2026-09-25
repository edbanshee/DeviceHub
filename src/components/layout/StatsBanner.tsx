import React from 'react';
import {
  Cpu,
  Gamepad2,
  Layers,
  Database,
  HardDrive,
  Cloud,
  Clock,
  Package,
  Star,
} from 'lucide-react';
import { ActiveView } from '../../types';
import { useStorage } from '../../context/StorageContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatStorageGB } from '../../utils/formatters';
import { getRatingConfig, getSafeRating } from '../../utils/ratingColors';

interface StatsBannerProps {
  activeView: ActiveView;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ activeView }) => {
  const { devices, drives, accessories } = useStorage();
  const { t } = useLanguage();

  if (activeView === 'matrix') {
    return null;
  }

  // Device view metrics
  const gamingDevices = devices.filter((d) => d.isGamingDevice);
  const generalDevices = devices.filter((d) => !d.isGamingDevice);

  // Collect unique OS and unique CPUs
  const uniqueOS = new Set(devices.map((d) => d.system?.trim()).filter(Boolean)).size;
  const uniqueCPUs = new Set(devices.map((d) => d.cpu?.trim()).filter(Boolean)).size;

  // Best emulation performance summary
  let topEmulationSystem = 'PlayStation 2 / GameCube';
  if (gamingDevices.length > 0) {
    const scores = gamingDevices[0].emulationScores || {};
    if (scores['Nintendo Switch'] && scores['Nintendo Switch'] >= 3) {
      topEmulationSystem = 'Nintendo Switch';
    } else if (scores['PlayStation 3'] && scores['PlayStation 3'] >= 3) {
      topEmulationSystem = 'PlayStation 3';
    } else if (scores['PlayStation 2'] && scores['PlayStation 2'] >= 3) {
      topEmulationSystem = 'PlayStation 2 / GameCube';
    } else if (scores['Dreamcast'] && scores['Dreamcast'] >= 3) {
      topEmulationSystem = 'Dreamcast / PSP';
    } else if (scores['PlayStation'] && scores['PlayStation'] >= 4) {
      topEmulationSystem = 'PS1 / N64';
    }
  }

  // Category distribution
  const categoryCounts: Record<string, number> = {};
  devices.forEach((d) => {
    categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
  });

  const categoryPalette = [
    '#8b5cf6', // purple
    '#14b8a6', // teal
    '#3b82f6', // blue
    '#f59e0b', // amber
    '#ec4899', // pink
    '#10b981', // emerald
  ];

  // Storage metrics
  let totalCapacity = 0;
  let totalUsed = 0;
  let physicalCap = 0;
  let physicalUsed = 0;
  let physicalDrivesCount = 0;
  let cloudCap = 0;
  let cloudUsed = 0;
  let cloudDrivesCount = 0;

  const typeCounts: Record<string, number> = {};

  drives.forEach((dr) => {
    const cap = dr.capacity || 0;
    const usd = dr.used || 0;
    totalCapacity += cap;
    totalUsed += usd;

    typeCounts[dr.driveType] = (typeCounts[dr.driveType] || 0) + cap;

    if (dr.storageMedium === 'cloud_network') {
      cloudCap += cap;
      cloudUsed += usd;
      cloudDrivesCount++;
    } else {
      physicalCap += cap;
      physicalUsed += usd;
      physicalDrivesCount++;
    }
  });

  const physicalFree = Math.max(0, physicalCap - physicalUsed);
  const cloudFree = Math.max(0, cloudCap - cloudUsed);
  const totalFree = Math.max(0, totalCapacity - totalUsed);
  const globalUsedPercent = totalCapacity > 0 ? Math.min(100, Math.round((totalUsed / totalCapacity) * 100)) : 0;
  const globalFreePercent = 100 - globalUsedPercent;
  const physicalUsedPercent = physicalCap > 0 ? Math.min(100, Math.round((physicalUsed / physicalCap) * 100)) : 0;
  const cloudUsedPercent = cloudCap > 0 ? Math.min(100, Math.round((cloudUsed / cloudCap) * 100)) : 0;

  // Accessories metrics
  const assignedAccessories = accessories.filter((a) => a.device && a.device.trim() !== '');
  const unassignedAccessories = accessories.filter((a) => !a.device || a.device.trim() === '');
  const avgNum =
    accessories.length > 0
      ? accessories.reduce((sum, a) => sum + getSafeRating(a.rating, 5), 0) / accessories.length
      : 5.0;
  const avgRating = avgNum.toFixed(1);
  const roundedRating = Math.round(avgNum);
  const avgConfig = getRatingConfig(roundedRating);
  const accessoryCategoriesCount = new Set(accessories.map((a) => a.category).filter(Boolean)).size;

  return (
    <section className="mb-6 space-y-4">
      {/* ========================================================================= */}
      {/* VIEW: ACCESSORIES STATS BANNER                                           */}
      {/* ========================================================================= */}
      {activeView === 'accessories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: TOTAL ACCESORIOS */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#a1a1aa]">
                TOTAL ACCESORIOS
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center border border-purple-200 dark:border-purple-800/60">
                <Package className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-3xl font-black font-mono text-slate-900 dark:text-[#f4f4f5]">
                {accessories.length}
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-[#71717a]">
                en inventario
              </span>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#a1a1aa]">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>{accessoryCategoriesCount} categorías distintas</span>
            </div>
          </div>

          {/* Card 2: ASIGNACIÓN */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#a1a1aa]">
                ASIGNACIÓN A DISPOSITIVOS
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/60">
                <Cpu className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-3xl font-black font-mono text-slate-900 dark:text-[#f4f4f5]">
                {assignedAccessories.length}
              </span>
              <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                asignados
              </span>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#a1a1aa]">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{unassignedAccessories.length} independientes / sin asignar</span>
            </div>
          </div>

          {/* Card 3: ESTADO FÍSICO */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#a1a1aa]">
                ESTADO FÍSICO PROMEDIO
              </span>
              <div className={`w-8 h-8 rounded-xl ${avgConfig.badgeBg} ${avgConfig.textColor} flex items-center justify-center border ${avgConfig.badgeBorder}`}>
                <Star className={`w-4 h-4 ${avgConfig.starColor}`} />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className={`text-3xl font-black font-mono flex items-center gap-1.5 ${avgConfig.textColor}`}>
                <Star className={`w-6 h-6 ${avgConfig.starColor}`} />
                <span>{avgRating}</span>
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-[#71717a]">
                / 5.0
              </span>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#a1a1aa]">
              <span className={`w-2 h-2 rounded-full ${avgConfig.dotColor}`} />
              <span>
                {Number(avgRating) >= 4.5
                  ? 'Excelente estado general'
                  : Number(avgRating) >= 3.5
                  ? 'Buen estado general'
                  : Number(avgRating) >= 2.5
                  ? 'Estado regular'
                  : 'Requiere atención'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: DEVICES STATS BANNER                                               */}
      {/* ========================================================================= */}
      {activeView === 'devices' && (
        <>
          {/* Top 3 KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: TOTAL DISPOSITIVOS */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#a1a1aa]">
                  {t('statTotalDevices')}
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center border border-purple-200 dark:border-purple-800/60">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-slate-900 dark:text-[#f4f4f5]">
                  {devices.length}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-[#a1a1aa]">
                  {t('statInInventory')}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-[#27272b]">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                  <span>🎮</span>
                  <span>{gamingDevices.length} {t('devicesPillGaming')}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                  <span>🎧</span>
                  <span>{generalDevices.length} {t('devicesPillGeneral')}</span>
                </span>
              </div>
            </div>

            {/* Card 2: ECOSISTEMA DE EMULACIÓN */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#a1a1aa]">
                  {t('statEmulationEcosystem')}
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center border border-purple-200 dark:border-purple-800/60">
                  <Gamepad2 className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-3xl font-black font-mono text-slate-900 dark:text-[#f4f4f5]">
                  {gamingDevices.length}
                </span>
                <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                  {t('statActiveConsoles')}
                </span>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#27272b]">
                <div className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 truncate">
                  <span>★</span>
                  <span>{t('statUpToRating', { platform: topEmulationSystem })}</span>
                </div>
                <div className="text-[11px] text-slate-400 dark:text-[#71717a] mt-0.5">
                  {t('statRatingsOverPlatforms', { count: 64 })}
                </div>
              </div>
            </div>

            {/* Card 3: HARDWARE & SISTEMAS */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#a1a1aa]">
                  {t('statHardwareAndSystems')}
                </span>
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/60">
                  <Layers className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-slate-900 dark:text-[#f4f4f5]">
                  {uniqueCPUs}
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-[#a1a1aa]">
                  {t('statProcessorsAndOS', { cpus: uniqueCPUs, os: uniqueOS })}
                </span>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#27272b] flex items-center gap-2 text-xs text-slate-600 dark:text-[#a1a1aa]">
                <HardDrive className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>{t('statLinkedDrives', { count: drives.length, capacity: formatStorageGB(totalCapacity) })}</span>
              </div>
            </div>
          </div>

          {/* Lower Card: Distribución de Hardware por Categoría */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-[#d4d4d8]">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>{t('statHardwareDistribution')}</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-[#a1a1aa] font-medium">
                {t('statEquipmentsInCatalog', { count: devices.length })}
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-[#222226] overflow-hidden flex shadow-inner">
              {devices.length === 0 ? (
                <div className="w-full h-full bg-slate-200 dark:bg-[#2a2a30]" />
              ) : (
                Object.entries(categoryCounts).map(([cat, count], idx) => {
                  const pct = Math.round((count / devices.length) * 100);
                  const color = categoryPalette[idx % categoryPalette.length];
                  return (
                    <div
                      key={cat}
                      style={{ width: `${pct}%`, backgroundColor: color }}
                      title={`${cat}: ${count} (${pct}%)`}
                      className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
                    />
                  );
                })
              )}
            </div>

            {/* Legend Pills below Bar */}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {Object.entries(categoryCounts).map(([cat, count], idx) => {
                const color = categoryPalette[idx % categoryPalette.length];
                return (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-[#222226] text-slate-700 dark:text-[#d4d4d8] border border-slate-200 dark:border-[#2f2f36]"
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span>{cat}</span>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-[#a1a1aa] font-mono">
                      ({count})
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW: DRIVES STATS BANNER                                                */}
      {/* ========================================================================= */}
      {activeView === 'drives' && (
        <>
          {/* Top 3 KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: ALMACENAMIENTO GLOBAL */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#a1a1aa]">
                  {t('statGlobalStorage')}
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center border border-purple-200 dark:border-purple-800/60">
                  <Database className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-slate-900 dark:text-[#f4f4f5]">
                  {formatStorageGB(totalCapacity)}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-400 dark:text-[#71717a]">
                  ({totalCapacity.toLocaleString()} GB)
                </span>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#a1a1aa] mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>{drives.length} {drives.length === 1 ? 'unidad' : 'unidades'}</span>
                    <span>•</span>
                    <span>{formatStorageGB(totalUsed)} {t('statSpaceUsed').toLowerCase()} ({globalUsedPercent}%)</span>
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-[#222226] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-purple-600 transition-all duration-300"
                    style={{ width: `${globalUsedPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Card 2: ALMACENAMIENTO FÍSICO/LOCAL */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#a1a1aa]">
                  {t('statPhysicalStorage')}
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center border border-blue-200 dark:border-blue-800/60">
                  <HardDrive className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-3xl font-black font-mono text-slate-900 dark:text-[#f4f4f5]">
                  {formatStorageGB(physicalCap)}
                </span>
                <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                  {t('statPhysicalDrivesCount', { count: physicalDrivesCount })}
                </span>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#a1a1aa] mb-1.5">
                  <span>{formatStorageGB(physicalUsed)} {t('statSpaceUsed').toLowerCase()}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {formatStorageGB(physicalFree)} libre
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-[#222226] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${physicalUsedPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Card 3: ALMACENAMIENTO NUBE/RED */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#a1a1aa]">
                  {t('statCloudStorage')}
                </span>
                <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-300 flex items-center justify-center border border-cyan-200 dark:border-cyan-800/60">
                  <Cloud className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-3xl font-black font-mono text-slate-900 dark:text-[#f4f4f5]">
                  {formatStorageGB(cloudCap)}
                </span>
                <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60">
                  {t('statCloudAccountsCount', { count: cloudDrivesCount })}
                </span>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#a1a1aa] mb-1.5">
                  <span>{formatStorageGB(cloudUsed)} {t('statSpaceUsed').toLowerCase()}</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                    {formatStorageGB(cloudFree)} libre
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-[#222226] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-cyan-500 transition-all duration-300"
                    style={{ width: `${cloudUsedPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lower Card: Distribución Global de Almacenamiento */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-[#d4d4d8]">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>{t('statGlobalDistribution')}</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-[#a1a1aa] font-medium">
                {t('statSpaceInUse', { used: formatStorageGB(totalUsed), total: formatStorageGB(totalCapacity) })}
              </span>
            </div>

            {/* Split Used (Purple) vs Free (Cyan) Bar */}
            <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-[#222226] overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${globalUsedPercent}%` }}
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-300 rounded-l-full"
                title={`Usado: ${formatStorageGB(totalUsed)} (${globalUsedPercent}%)`}
              />
              <div
                style={{ width: `${globalFreePercent}%` }}
                className="h-full bg-teal-500 dark:bg-teal-400 transition-all duration-300 rounded-r-full"
                title={`Disponible: ${formatStorageGB(totalFree)} (${globalFreePercent}%)`}
              />
            </div>

            {/* Bottom Details Legend */}
            <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-[#d4d4d8]">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                  <span>{t('statSpaceUsed')}: {formatStorageGB(totalUsed)} ({globalUsedPercent}%)</span>
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-[#d4d4d8]">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  <span>{t('statSpaceFree')}: {formatStorageGB(totalFree)} ({globalFreePercent}%)</span>
                </span>
              </div>

              {/* By type chips */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500 dark:text-[#a1a1aa]">
                <span className="font-semibold">{t('statByType')}:</span>
                {Object.entries(typeCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([type, cap]) => (
                    <span
                      key={type}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#222226] text-slate-700 dark:text-[#d4d4d8] font-mono font-medium"
                    >
                      {type}: {formatStorageGB(cap)}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

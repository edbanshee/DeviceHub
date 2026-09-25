import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Info,
  Edit2,
  Trash2,
  HardDrive,
  Cloud,
  Gamepad2,
  Laptop,
  Usb,
} from 'lucide-react';
import { StorageDrive } from '../../types';
import { useStorage } from '../../context/StorageContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatStorageGB } from '../../utils/formatters';
import { DriveInfoModal } from '../modals/DriveInfoModal';

interface DrivesViewProps {
  onOpenAddDrive: (deviceName?: string) => void;
  onEditDrive: (drive: StorageDrive) => void;
  onDeleteDrive: (drive: StorageDrive) => void;
}

export const DrivesView: React.FC<DrivesViewProps> = ({
  onOpenAddDrive,
  onEditDrive,
  onDeleteDrive,
}) => {
  const { drives, devices, settings } = useStorage();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [selectedMedium, setSelectedMedium] = useState<'all' | 'physical' | 'cloud_network'>('all');
  const [selectedDriveForInfo, setSelectedDriveForInfo] = useState<StorageDrive | null>(null);

  const isDriveUnassigned = (dr: StorageDrive) => {
    return (
      !dr.device ||
      !dr.device.trim() ||
      dr.device === 'Sin Dispositivo / Unassigned' ||
      dr.device === '__unassigned__'
    );
  };

  const unassignedCount = useMemo(() => {
    return drives.filter(isDriveUnassigned).length;
  }, [drives]);

  // Automatic synchronized options: Always reflect settings AND any existing data in drives
  const availableTypes = useMemo(() => {
    return Array.from(
      new Set([...(settings.driveTypes || []), ...drives.map((d) => d.driveType).filter(Boolean)])
    );
  }, [settings.driveTypes, drives]);

  const availableFormats = useMemo(() => {
    return Array.from(
      new Set([...(settings.formatOptions || []), ...drives.map((d) => d.format).filter(Boolean)])
    );
  }, [settings.formatOptions, drives]);

  const filteredDrives = useMemo(() => {
    return drives.filter((dr) => {
      if (selectedDevice !== 'all') {
        if (selectedDevice === '__unassigned__') {
          if (!isDriveUnassigned(dr)) return false;
        } else {
          if (dr.device !== selectedDevice) return false;
        }
      }
      if (selectedType !== 'all' && dr.driveType !== selectedType) return false;
      if (selectedFormat !== 'all' && dr.format !== selectedFormat) return false;
      if (selectedMedium !== 'all' && dr.storageMedium !== selectedMedium) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDrive = dr.drive.toLowerCase().includes(q);
        const matchLabel = dr.label?.toLowerCase().includes(q);
        const matchDev = dr.device
          ? dr.device.toLowerCase().includes(q)
          : 'sin vincular independiente usb portatil externo'.includes(q);
        const matchMount = dr.mountPoint?.toLowerCase().includes(q);
        const matchEmail = dr.accountEmail?.toLowerCase().includes(q);
        const matchProvider = dr.cloudProvider?.toLowerCase().includes(q);
        const matchNotes = dr.notes?.toLowerCase().includes(q);
        const matchTags = dr.tags?.some((tg) => tg.toLowerCase().includes(q));

        if (!matchDrive && !matchLabel && !matchDev && !matchMount && !matchEmail && !matchProvider && !matchNotes && !matchTags) {
          return false;
        }
      }

      return true;
    });
  }, [drives, selectedDevice, selectedType, selectedFormat, selectedMedium, searchQuery]);

  // Overall totals for filtered view
  const totalCap = filteredDrives.reduce((sum, d) => sum + (d.capacity || 0), 0);
  const totalUsed = filteredDrives.reduce((sum, d) => sum + (d.used || 0), 0);
  const totalFree = Math.max(0, totalCap - totalUsed);

  // Group drives by Device Name or __unassigned__
  const groupedByDevice = useMemo(() => {
    const map = new Map<string, StorageDrive[]>();

    devices.forEach((dev) => {
      if (selectedDevice === 'all' || selectedDevice === dev.name) {
        map.set(dev.name, []);
      }
    });

    if (selectedDevice === 'all' || selectedDevice === '__unassigned__') {
      const hasAnyUnassigned = filteredDrives.some(isDriveUnassigned);
      if (hasAnyUnassigned || selectedDevice === '__unassigned__') {
        map.set('__unassigned__', []);
      }
    }

    filteredDrives.forEach((dr) => {
      const devKey = isDriveUnassigned(dr) ? '__unassigned__' : dr.device || '__unassigned__';
      if (selectedDevice === 'all' || selectedDevice === devKey) {
        if (!map.has(devKey)) {
          map.set(devKey, []);
        }
        map.get(devKey)!.push(dr);
      }
    });

    // Filter out devices that have 0 drives if we are searching or filtering
    if (searchQuery.trim() || selectedType !== 'all' || selectedFormat !== 'all' || selectedMedium !== 'all') {
      const filteredMap = new Map<string, StorageDrive[]>();
      map.forEach((drvList, devName) => {
        if (drvList.length > 0) {
          filteredMap.set(devName, drvList);
        }
      });
      return filteredMap;
    }

    return map;
  }, [devices, filteredDrives, selectedDevice, searchQuery, selectedType, selectedFormat, selectedMedium]);

  return (
    <div className="space-y-6">
      {/* 1. Multi-Filter & Search Toolbar - Unified Height & Clean Grid */}
      <div className="space-y-3">
        {/* Row 1: Search Box & Medium Pills */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          {/* Medium filter pills (Todos, Físico/Local, Nube/Red) */}
          <div className="flex items-center h-10 p-1 bg-slate-100 dark:bg-[#18181c] rounded-xl border border-slate-200 dark:border-[#27272b] text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setSelectedMedium('all')}
              className={`h-full px-3.5 rounded-lg transition-colors cursor-pointer ${
                selectedMedium === 'all'
                  ? 'bg-white dark:bg-[#222226] text-purple-600 dark:text-purple-300 shadow-xs border border-slate-200/80 dark:border-[#323238]'
                  : 'text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#f4f4f5]'
              }`}
            >
              {t('devicesPillAll')}
            </button>
            <button
              type="button"
              onClick={() => setSelectedMedium('physical')}
              className={`h-full px-3.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedMedium === 'physical'
                  ? 'bg-white dark:bg-[#222226] text-purple-600 dark:text-purple-300 shadow-xs border border-slate-200/80 dark:border-[#323238]'
                  : 'text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#f4f4f5]'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5 text-blue-500" />
              <span>{t('drivesTabPhysical')}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedMedium('cloud_network')}
              className={`h-full px-3.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedMedium === 'cloud_network'
                  ? 'bg-white dark:bg-[#222226] text-purple-600 dark:text-purple-300 shadow-xs border border-slate-200/80 dark:border-[#323238]'
                  : 'text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#f4f4f5]'
              }`}
            >
              <Cloud className="w-3.5 h-3.5 text-cyan-500" />
              <span>{t('drivesTabCloud')}</span>
            </button>
          </div>

          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-[#71717a]" />
            <input
              type="text"
              maxLength={80}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('drivesSearchPlaceholder')}
              className="w-full h-10 pl-10 pr-4 bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-[#f4f4f5] placeholder:text-slate-400 dark:placeholder:text-[#71717a] focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
            />
          </div>
        </div>

        {/* Row 2: Compact Dropdowns (Device, Type, Format) + Add Drive Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 min-w-0">
            {/* Device Dropdown */}
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full h-9 px-2.5 bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] rounded-xl text-xs font-semibold text-slate-700 dark:text-[#d4d4d8] focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs cursor-pointer truncate"
            >
              <option value="all">{t('drivesFilterAllDevices', { count: devices.length })}</option>
              {unassignedCount > 0 && (
                <option value="__unassigned__">
                  {t('drivesFilterUnassigned', { count: unassignedCount })}
                </option>
              )}
              {devices.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Type Dropdown */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full h-9 px-2.5 bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] rounded-xl text-xs font-semibold text-slate-700 dark:text-[#d4d4d8] focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs cursor-pointer truncate"
            >
              <option value="all">{t('drivesFilterAllTypes', { count: availableTypes.length })}</option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Format Dropdown */}
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full h-9 px-2.5 bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] rounded-xl text-xs font-semibold text-slate-700 dark:text-[#d4d4d8] focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs cursor-pointer truncate"
            >
              <option value="all">{t('drivesFilterAllFormats', { count: availableFormats.length })}</option>
              {availableFormats.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Add Drive Button */}
          <button
            type="button"
            onClick={() => onOpenAddDrive()}
            className="h-9 px-3.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('actionAddDrive')}</span>
          </button>
        </div>
      </div>

      {/* 2. Grouped By Device Cards */}
      {groupedByDevice.size > 0 ? (
        <div className="space-y-6">
          {Array.from(groupedByDevice.entries()).map(([deviceName, devDrives]) => {
            const isUnassigned = deviceName === '__unassigned__';
            const devObj = isUnassigned ? null : devices.find((d) => d.name === deviceName);
            const devCap = devDrives.reduce((sum, dr) => sum + (dr.capacity || 0), 0);
            const devUsed = devDrives.reduce((sum, dr) => sum + (dr.used || 0), 0);
            const devPercent = devCap > 0 ? Math.min(100, Math.round((devUsed / devCap) * 100)) : 0;

            return (
              <div
                key={deviceName}
                className={`bg-white dark:bg-[#18181c] rounded-2xl border ${
                  isUnassigned
                    ? 'border-amber-200/80 dark:border-amber-900/40 shadow-xs'
                    : 'border-slate-200 dark:border-[#27272b] shadow-xs'
                } overflow-hidden`}
              >
                {/* Device Group Header */}
                <div
                  className={`p-4 sm:p-5 border-b ${
                    isUnassigned
                      ? 'border-amber-100 dark:border-amber-900/30 bg-amber-50/40 dark:bg-amber-950/20'
                      : 'border-slate-100 dark:border-[#27272b] bg-slate-50/50 dark:bg-[#202024]/40'
                  } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isUnassigned
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
                          : 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-800/60'
                      }`}
                    >
                      {isUnassigned ? (
                        <Usb className="w-5 h-5" />
                      ) : devObj?.isGamingDevice ? (
                        <Gamepad2 className="w-5 h-5" />
                      ) : (
                        <Laptop className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-[#f4f4f5] tracking-tight">
                          {isUnassigned ? t('drivesUnassignedTitle') : deviceName}
                        </h3>
                        {isUnassigned ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                            {t('drivesUnassignedBadge')}
                          </span>
                        ) : devObj && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                            {devObj.category}
                          </span>
                        )}
                      </div>
                      {isUnassigned ? (
                        <p className="text-xs text-slate-500 dark:text-[#a1a1aa] mt-0.5">
                          {t('drivesUnassignedSubtitle')}
                        </p>
                      ) : devObj && (
                        <p className="text-xs text-slate-500 dark:text-[#a1a1aa] mt-0.5">
                          {devObj.system}{devObj.cpu ? ` • ${devObj.cpu}` : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Device storage capacity & quick add */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <div
                        className={`text-xs font-black font-mono ${
                          isUnassigned ? 'text-amber-600 dark:text-amber-400' : 'text-purple-600 dark:text-purple-400'
                        }`}
                      >
                        {formatStorageGB(devCap)}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-[#71717a] font-mono">
                        {t('deviceInfoUsed', { used: formatStorageGB(devUsed) })} ({devPercent}%)
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenAddDrive(isUnassigned ? '' : deviceName)}
                      title={t('actionAddDrive')}
                      aria-label={t('actionAddDrive')}
                      className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold ${
                        isUnassigned
                          ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/60'
                          : 'text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/60'
                      } transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Table of Drives */}
                {devDrives.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-[#27272b] bg-slate-50/70 dark:bg-[#1f1f23]/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#a1a1aa]">
                          <th className="py-3 px-4 sm:px-6">{t('drivesColDrive').toUpperCase()}</th>
                          <th className="py-3 px-4">{t('drivesColType').toUpperCase()}</th>
                          <th className="py-3 px-4">{t('drivesColLabel').toUpperCase()}</th>
                          <th className="py-3 px-4">{t('drivesColFormat').toUpperCase()}</th>
                          <th className="py-3 px-4">{t('drivesColCapacityUsage').toUpperCase()}</th>
                          <th className="py-3 px-4">{t('driveFieldTags').toUpperCase()}</th>
                          <th className="py-3 px-4 text-right">{t('drivesColActions').toUpperCase()}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-[#27272b]">
                        {devDrives.map((drive) => {
                          const pct =
                            drive.capacity > 0
                              ? Math.min(100, Math.round((drive.used / drive.capacity) * 100))
                              : 0;
                          const freeGb = Math.max(0, drive.capacity - drive.used);

                          const isCloud = drive.storageMedium === 'cloud_network';

                          return (
                            <tr
                              key={drive.id}
                              className="hover:bg-slate-50/80 dark:hover:bg-[#222226]/50 transition-colors"
                            >
                              {/* 1. UNIDAD */}
                              <td className="py-3.5 px-4 sm:px-6">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                      isCloud
                                        ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-500 border border-cyan-200 dark:border-cyan-800/60'
                                        : isUnassigned ||
                                          drive.driveType?.toLowerCase().includes('usb') ||
                                          drive.driveType?.toLowerCase().includes('pendrive')
                                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 border border-indigo-200 dark:border-indigo-800/60'
                                    }`}
                                  >
                                    {isCloud ? (
                                      <Cloud className="w-3.5 h-3.5" />
                                    ) : isUnassigned ||
                                      drive.driveType?.toLowerCase().includes('usb') ||
                                      drive.driveType?.toLowerCase().includes('pendrive') ? (
                                      <Usb className="w-3.5 h-3.5" />
                                    ) : (
                                      <HardDrive className="w-3.5 h-3.5" />
                                    )}
                                  </div>
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedDriveForInfo(drive)}
                                      className="font-bold font-mono text-slate-800 dark:text-[#f4f4f5] hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-left cursor-pointer"
                                    >
                                      {drive.drive}
                                    </button>
                                    {(drive.cloudProvider || drive.mountPoint || drive.accountEmail) && (
                                      <div className="text-[10px] text-slate-400 dark:text-[#71717a] font-mono">
                                        {drive.cloudProvider ? `${drive.cloudProvider} ` : ''}
                                        {drive.mountPoint ? `[${drive.mountPoint}] ` : ''}
                                        {drive.accountEmail ? `• ${drive.accountEmail}` : ''}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* 2. TIPO */}
                              <td className="py-3.5 px-4">
                                <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-[#222226] text-slate-700 dark:text-[#d4d4d8] font-mono">
                                  {drive.driveType}
                                </span>
                              </td>

                              {/* 3. ETIQUETA */}
                              <td className="py-3.5 px-4">
                                <span className="text-slate-700 dark:text-[#d4d4d8] font-medium">
                                  {drive.label || '-'}
                                </span>
                              </td>

                              {/* 4. FORMATO */}
                              <td className="py-3.5 px-4">
                                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                                  {drive.format}
                                </span>
                              </td>

                              {/* 5. CAPACIDAD Y USO */}
                              <td className="py-3.5 px-4 min-w-[160px]">
                                <div>
                                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                                    <span className="font-bold text-slate-700 dark:text-[#d4d4d8]">
                                      {formatStorageGB(drive.used)} / {formatStorageGB(drive.capacity)}
                                    </span>
                                    <span className="text-slate-400 dark:text-[#71717a]">({pct}%)</span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-[#2a2a30] overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${
                                        pct >= 90
                                          ? 'bg-rose-500'
                                          : pct >= 75
                                          ? 'bg-amber-500'
                                          : isCloud
                                          ? 'bg-cyan-500'
                                          : 'bg-purple-600'
                                      }`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <div className="text-[10px] text-slate-400 dark:text-[#71717a] font-mono mt-0.5">
                                    {t('deviceInfoFreeSpace', { free: formatStorageGB(freeGb) })}
                                  </div>
                                </div>
                              </td>

                              {/* 6. ETIQUETAS */}
                              <td className="py-3.5 px-4">
                                {drive.tags && drive.tags.length > 0 ? (
                                  <div className="flex items-center gap-1 flex-wrap">
                                    {drive.tags.map((tg) => (
                                      <span
                                        key={tg}
                                        className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-[#222226] text-slate-600 dark:text-[#a1a1aa] font-mono"
                                      >
                                        #{tg}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 dark:text-[#71717a]">-</span>
                                )}
                              </td>

                              {/* 7. ACCIONES */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedDriveForInfo(drive)}
                                    title={t('driveInfoBtn')}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-[#f4f4f5] hover:bg-slate-100 dark:hover:bg-[#222226] rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Info className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onEditDrive(drive)}
                                    title={t('btnEdit')}
                                    className="p-1.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-[#222226] rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onDeleteDrive(drive)}
                                    title={t('btnDelete')}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 dark:text-[#71717a]">
                    <p className="text-xs">{t('drivesNoAssociatedDrives')}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-white dark:bg-[#18181c] rounded-2xl border border-slate-200 dark:border-[#27272b] p-8">
          <HardDrive className="w-12 h-12 text-slate-300 dark:text-[#3f3f46] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-[#d4d4d8]">
            {t('drivesEmptyTitle')}
          </h3>
          <p className="text-xs text-slate-400 dark:text-[#71717a] mt-1 max-w-sm mx-auto">
            {t('drivesEmptyDesc')}
          </p>
          <button
            type="button"
            onClick={() => onOpenAddDrive()}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('actionAddDrive')}</span>
          </button>
        </div>
      )}
      {/* Drive Info Modal */}
      <DriveInfoModal
        isOpen={!!selectedDriveForInfo}
        drive={selectedDriveForInfo}
        onClose={() => setSelectedDriveForInfo(null)}
        onEdit={(dr) => {
          setSelectedDriveForInfo(null);
          onEditDrive(dr);
        }}
      />
    </div>
  );
};

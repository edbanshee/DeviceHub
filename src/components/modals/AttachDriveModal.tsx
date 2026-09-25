import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  HardDrive,
  Link2,
  ArrowLeftRight,
  PlusCircle,
  Search,
  Check,
  AlertTriangle,
  Laptop,
  Cloud,
  CheckCircle2,
} from 'lucide-react';
import { useStorage } from '../../context/StorageContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { formatStorageGB } from '../../utils/formatters';
import { StorageDrive } from '../../types';

interface AttachDriveModalProps {
  isOpen: boolean;
  targetDeviceName: string | null;
  onClose: () => void;
  onOpenCreateNewDrive: (targetDeviceName: string) => void;
}

type TabType = 'link' | 'transfer' | 'new';

export const AttachDriveModal: React.FC<AttachDriveModalProps> = ({
  isOpen,
  targetDeviceName,
  onClose,
  onOpenCreateNewDrive,
}) => {
  const { drives, devices, saveDrive } = useStorage();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('link');
  const [selectedUnlinkedDriveId, setSelectedUnlinkedDriveId] = useState<string | null>(null);
  const [selectedTransferDriveId, setSelectedTransferDriveId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceDeviceFilter, setSourceDeviceFilter] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Drives not linked to any device
  const unlinkedDrives = useMemo(() => {
    return drives.filter((d) => !d.device || d.device.trim() === '');
  }, [drives]);

  // Drives linked to OTHER devices
  const otherDeviceDrives = useMemo(() => {
    if (!targetDeviceName) return [];
    return drives.filter(
      (d) => d.device && d.device.trim() !== '' && d.device.trim() !== targetDeviceName.trim()
    );
  }, [drives, targetDeviceName]);

  // Unique source devices for the filter dropdown
  const sourceDevicesList = useMemo(() => {
    const set = new Set(otherDeviceDrives.map((d) => d.device));
    return Array.from(set).sort();
  }, [otherDeviceDrives]);

  // Set default tab when opening
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSourceDeviceFilter('');
      if (unlinkedDrives.length > 0) {
        setActiveTab('link');
        setSelectedUnlinkedDriveId(unlinkedDrives[0].id);
      } else if (otherDeviceDrives.length > 0) {
        setActiveTab('transfer');
        setSelectedTransferDriveId(otherDeviceDrives[0].id);
      } else {
        setActiveTab('new');
      }
    }
  }, [isOpen, unlinkedDrives.length, otherDeviceDrives.length]);

  // Filtered unlinked drives
  const filteredUnlinkedDrives = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return unlinkedDrives;
    return unlinkedDrives.filter(
      (d) =>
        d.drive.toLowerCase().includes(q) ||
        (d.label && d.label.toLowerCase().includes(q)) ||
        d.driveType.toLowerCase().includes(q) ||
        d.format.toLowerCase().includes(q)
    );
  }, [unlinkedDrives, searchQuery]);

  // Filtered transfer drives
  const filteredTransferDrives = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return otherDeviceDrives.filter((d) => {
      const matchDevice = !sourceDeviceFilter || d.device === sourceDeviceFilter;
      const matchQuery =
        !q ||
        d.drive.toLowerCase().includes(q) ||
        (d.label && d.label.toLowerCase().includes(q)) ||
        (d.device && d.device.toLowerCase().includes(q)) ||
        d.driveType.toLowerCase().includes(q) ||
        d.format.toLowerCase().includes(q);
      return matchDevice && matchQuery;
    });
  }, [otherDeviceDrives, searchQuery, sourceDeviceFilter]);

  const selectedUnlinkedDrive = useMemo(
    () => unlinkedDrives.find((d) => d.id === selectedUnlinkedDriveId) || null,
    [unlinkedDrives, selectedUnlinkedDriveId]
  );

  const selectedTransferDrive = useMemo(
    () => otherDeviceDrives.find((d) => d.id === selectedTransferDriveId) || null,
    [otherDeviceDrives, selectedTransferDriveId]
  );

  if (!isOpen || !targetDeviceName) return null;

  // Handle linking an unassigned drive
  const handleLinkDrive = async () => {
    if (!selectedUnlinkedDrive) {
      showToast(t('attachDriveSelectDriveFirst'), 'warning');
      return;
    }
    try {
      setIsProcessing(true);
      await saveDrive({
        ...selectedUnlinkedDrive,
        device: targetDeviceName,
      });
      showToast(
        t('attachDriveSuccessLinked', {
          drive: selectedUnlinkedDrive.drive,
          device: targetDeviceName,
        }),
        'success'
      );
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Error al vincular unidad', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle transferring drive from another device
  const handleTransferDrive = async () => {
    if (!selectedTransferDrive) {
      showToast(t('attachDriveSelectDriveFirst'), 'warning');
      return;
    }
    const fromDevice = selectedTransferDrive.device;
    try {
      setIsProcessing(true);
      await saveDrive({
        ...selectedTransferDrive,
        device: targetDeviceName,
      });
      showToast(
        t('attachDriveSuccessTransferred', {
          drive: selectedTransferDrive.drive,
          fromDevice: fromDevice || '',
          toDevice: targetDeviceName,
        }),
        'success'
      );
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Error al transferir unidad', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#18181c] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#27272b] my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#27272b] bg-slate-50/50 dark:bg-[#202024]/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-[#f4f4f5] flex items-center gap-2">
                <span>{t('attachDriveModalTitle', { name: targetDeviceName })}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#a1a1aa]">
                {t('attachDriveModalSubtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-[#f4f4f5] rounded-lg hover:bg-slate-100 dark:hover:bg-[#222226] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Main Action Tabs */}
        <div className="px-6 pt-5 pb-3">
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-[#202024] rounded-xl border border-slate-200 dark:border-[#27272b]">
            {/* Tab 1: New Drive */}
            <button
              type="button"
              onClick={() => setActiveTab('new')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'new'
                  ? 'bg-white dark:bg-[#18181c] text-purple-600 dark:text-purple-400 shadow-xs border border-slate-200 dark:border-[#2f2f36]'
                  : 'text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#f4f4f5]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4" />
                <span className="font-bold">{t('attachDriveTabNew')}</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">{t('attachDriveTabNewDesc')}</span>
            </button>

            {/* Tab 2: Link Existing Unassigned */}
            <button
              type="button"
              onClick={() => setActiveTab('link')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'link'
                  ? 'bg-white dark:bg-[#18181c] text-purple-600 dark:text-purple-400 shadow-xs border border-slate-200 dark:border-[#2f2f36]'
                  : 'text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#f4f4f5]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Link2 className="w-4 h-4" />
                <span className="font-bold">{t('attachDriveTabLink')}</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {t('attachDriveTabLinkDesc', { count: unlinkedDrives.length })}
              </span>
            </button>

            {/* Tab 3: Transfer from Another Device */}
            <button
              type="button"
              onClick={() => setActiveTab('transfer')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'transfer'
                  ? 'bg-white dark:bg-[#18181c] text-purple-600 dark:text-purple-400 shadow-xs border border-slate-200 dark:border-[#2f2f36]'
                  : 'text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#f4f4f5]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <ArrowLeftRight className="w-4 h-4" />
                <span className="font-bold">{t('attachDriveTabTransfer')}</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {t('attachDriveTabTransferDesc', { count: otherDeviceDrives.length })}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="px-6 pb-6 pt-2">
          {/* TAB 1: CREATE NEW DRIVE */}
          {activeTab === 'new' && (
            <div className="p-6 bg-slate-50 dark:bg-[#202024]/50 rounded-2xl border border-slate-200 dark:border-[#27272b] text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-[#f4f4f5]">
                  {t('attachDriveNewCardTitle')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-[#a1a1aa] leading-relaxed">
                  {t('attachDriveNewCardDesc', { name: targetDeviceName })}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCreateNewDrive(targetDeviceName);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{t('attachDriveOpenFormBtn')}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LINK EXISTING UNASSIGNED DRIVE */}
          {activeTab === 'link' && (
            <div className="space-y-3">
              {unlinkedDrives.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-[#202024]/50 rounded-2xl border border-slate-200 dark:border-[#27272b] space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-[#25252a] text-slate-400 flex items-center justify-center">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-[#d4d4d8]">
                      {t('attachDriveNoUnlinkedTitle')}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-[#71717a] mt-1 max-w-sm mx-auto">
                      {t('attachDriveNoUnlinkedDesc')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('new')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 rounded-xl border border-purple-200 dark:border-purple-800 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{t('attachDriveBtnCreateNew')}</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Search filter if more than 2 drives */}
                  {unlinkedDrives.length > 2 && (
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        maxLength={80}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('attachDriveSearchPlaceholder')}
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272b] rounded-xl text-xs text-slate-900 dark:text-[#f4f4f5] focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Drives List */}
                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                    {filteredUnlinkedDrives.map((d) => {
                      const isSelected = selectedUnlinkedDriveId === d.id;
                      const usedPct =
                        d.capacity > 0 ? Math.round(((d.used || 0) / d.capacity) * 100) : 0;
                      return (
                        <div
                          key={d.id}
                          onClick={() => setSelectedUnlinkedDriveId(d.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-400 dark:border-purple-600 shadow-xs'
                              : 'bg-white dark:bg-[#202024]/60 border-slate-200 dark:border-[#27272b] hover:border-slate-300 dark:hover:border-[#383840]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Selection indicator */}
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'border-purple-600 bg-purple-600 text-white'
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>

                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#25252a] text-slate-600 dark:text-[#a1a1aa] shrink-0">
                              {d.storageMedium === 'cloud_network' ? (
                                <Cloud className="w-4 h-4 text-sky-500" />
                              ) : (
                                <HardDrive className="w-4 h-4 text-purple-500" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-sm text-slate-900 dark:text-[#f4f4f5]">
                                  {d.drive}
                                </span>
                                {d.label && (
                                  <span className="text-xs text-slate-500 dark:text-[#a1a1aa] truncate">
                                    "{d.label}"
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 dark:text-[#71717a] font-mono">
                                <span>{d.driveType}</span>
                                <span>•</span>
                                <span>{d.format}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono text-xs font-bold text-slate-800 dark:text-[#d4d4d8]">
                              {formatStorageGB(d.capacity)}
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {usedPct}% ocupado
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Action Button */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-[#27272b]">
                    <span className="text-xs text-slate-500 dark:text-[#a1a1aa]">
                      {selectedUnlinkedDrive ? (
                        <>
                          Seleccionada:{' '}
                          <strong className="font-mono text-slate-800 dark:text-[#f4f4f5]">
                            {selectedUnlinkedDrive.drive}
                          </strong>{' '}
                          ({formatStorageGB(selectedUnlinkedDrive.capacity)})
                        </>
                      ) : (
                        t('attachDriveSelectDriveFirst')
                      )}
                    </span>
                    <button
                      type="button"
                      disabled={!selectedUnlinkedDrive || isProcessing}
                      onClick={handleLinkDrive}
                      className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>
                        {isProcessing ? t('attachDriveLinking') : t('attachDriveBtnLinkSelected')}
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: TRANSFER DRIVE FROM ANOTHER DEVICE */}
          {activeTab === 'transfer' && (
            <div className="space-y-3">
              {otherDeviceDrives.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-[#202024]/50 rounded-2xl border border-slate-200 dark:border-[#27272b] space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-[#25252a] text-slate-400 flex items-center justify-center">
                    <ArrowLeftRight className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-[#d4d4d8]">
                      {t('attachDriveNoOtherDrivesTitle')}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-[#71717a] mt-1 max-w-sm mx-auto">
                      {t('attachDriveNoOtherDrivesDesc')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('new')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 rounded-xl border border-purple-200 dark:border-purple-800 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{t('attachDriveBtnCreateNew')}</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Search and Origin Device Filter */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        maxLength={80}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('attachDriveSearchPlaceholder')}
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272b] rounded-xl text-xs text-slate-900 dark:text-[#f4f4f5] focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                    {sourceDevicesList.length > 1 && (
                      <select
                        value={sourceDeviceFilter}
                        onChange={(e) => setSourceDeviceFilter(e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272b] rounded-xl text-xs text-slate-900 dark:text-[#f4f4f5] focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      >
                        <option value="">{t('attachDriveAllDevicesFilter')}</option>
                        {sourceDevicesList.map((devName) => (
                          <option key={devName} value={devName}>
                            Dispositivo: {devName}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Drives List */}
                  <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1">
                    {filteredTransferDrives.map((d) => {
                      const isSelected = selectedTransferDriveId === d.id;
                      const usedPct =
                        d.capacity > 0 ? Math.round(((d.used || 0) / d.capacity) * 100) : 0;
                      return (
                        <div
                          key={d.id}
                          onClick={() => setSelectedTransferDriveId(d.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600 shadow-xs'
                              : 'bg-white dark:bg-[#202024]/60 border-slate-200 dark:border-[#27272b] hover:border-slate-300 dark:hover:border-[#383840]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Selection indicator */}
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'border-amber-600 bg-amber-600 text-white'
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>

                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#25252a] text-slate-600 dark:text-[#a1a1aa] shrink-0">
                              <HardDrive className="w-4 h-4 text-amber-500" />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-sm text-slate-900 dark:text-[#f4f4f5]">
                                  {d.drive}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                                  <Laptop className="w-3 h-3" />
                                  <span>{d.device}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 dark:text-[#71717a] font-mono">
                                {d.label && <span>"{d.label}" • </span>}
                                <span>{d.driveType}</span>
                                <span>•</span>
                                <span>{d.format}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono text-xs font-bold text-slate-800 dark:text-[#d4d4d8]">
                              {formatStorageGB(d.capacity)}
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {usedPct}% ocupado
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Transfer Notice */}
                  {selectedTransferDrive && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5 animate-in fade-in duration-150">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        {t('attachDriveTransferWarning', {
                          drive: selectedTransferDrive.drive,
                          capacity: selectedTransferDrive.capacity,
                          fromDevice: selectedTransferDrive.device || '',
                          toDevice: targetDeviceName,
                        })}
                      </p>
                    </div>
                  )}

                  {/* Bottom Action Button */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-[#27272b]">
                    <span className="text-xs text-slate-500 dark:text-[#a1a1aa]">
                      {selectedTransferDrive ? (
                        <>
                          Mover:{' '}
                          <strong className="font-mono text-slate-800 dark:text-[#f4f4f5]">
                            {selectedTransferDrive.drive}
                          </strong>{' '}
                          (de {selectedTransferDrive.device})
                        </>
                      ) : (
                        t('attachDriveSelectDriveFirst')
                      )}
                    </span>
                    <button
                      type="button"
                      disabled={!selectedTransferDrive || isProcessing}
                      onClick={handleTransferDrive}
                      className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>
                        {isProcessing
                          ? t('attachDriveTransferring')
                          : t('attachDriveBtnTransferSelected')}
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

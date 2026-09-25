import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Sparkles,
  Link2,
  ArrowLeftRight,
  PlusCircle,
  Search,
  Check,
  Star,
  Laptop,
} from 'lucide-react';
import { useStorage } from '../../context/StorageContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Accessory } from '../../types';
import { getRatingConfig, getSafeRating } from '../../utils/ratingColors';

interface AttachAccessoryModalProps {
  isOpen: boolean;
  targetDeviceName: string | null;
  onClose: () => void;
  onOpenCreateNewAccessory: (targetDeviceName: string) => void;
}

type TabType = 'link' | 'transfer' | 'new';

export const AttachAccessoryModal: React.FC<AttachAccessoryModalProps> = ({
  isOpen,
  targetDeviceName,
  onClose,
  onOpenCreateNewAccessory,
}) => {
  const { accessories, saveAccessory } = useStorage();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('link');
  const [selectedUnlinkedId, setSelectedUnlinkedId] = useState<string | null>(null);
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Unlinked accessories (no device assigned)
  const unlinkedAccessories = useMemo(() => {
    return accessories.filter((a) => !a.device || a.device.trim() === '');
  }, [accessories]);

  // Accessories on other devices
  const otherDeviceAccessories = useMemo(() => {
    if (!targetDeviceName) return [];
    return accessories.filter(
      (a) => a.device && a.device.trim() !== '' && a.device.trim() !== targetDeviceName.trim()
    );
  }, [accessories, targetDeviceName]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      if (unlinkedAccessories.length > 0) {
        setActiveTab('link');
        setSelectedUnlinkedId(unlinkedAccessories[0].id);
      } else if (otherDeviceAccessories.length > 0) {
        setActiveTab('transfer');
        setSelectedTransferId(otherDeviceAccessories[0].id);
      } else {
        setActiveTab('new');
      }
    }
  }, [isOpen, unlinkedAccessories.length, otherDeviceAccessories.length]);

  const filteredUnlinked = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return unlinkedAccessories;
    return unlinkedAccessories.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.tags && a.tags.some((tg) => tg.toLowerCase().includes(q)))
    );
  }, [unlinkedAccessories, searchQuery]);

  const filteredTransfer = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return otherDeviceAccessories;
    return otherDeviceAccessories.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.device && a.device.toLowerCase().includes(q))
    );
  }, [otherDeviceAccessories, searchQuery]);

  const selectedUnlinked = useMemo(
    () => unlinkedAccessories.find((a) => a.id === selectedUnlinkedId) || null,
    [unlinkedAccessories, selectedUnlinkedId]
  );

  const selectedTransfer = useMemo(
    () => otherDeviceAccessories.find((a) => a.id === selectedTransferId) || null,
    [otherDeviceAccessories, selectedTransferId]
  );

  if (!isOpen || !targetDeviceName) return null;

  const handleLink = async () => {
    if (!selectedUnlinked) {
      showToast('Por favor selecciona un accesorio primero.', 'warning');
      return;
    }
    try {
      setIsProcessing(true);
      await saveAccessory({
        ...selectedUnlinked,
        device: targetDeviceName,
      });
      showToast(
        t('attachAccessorySuccessLinked', {
          name: selectedUnlinked.name,
          device: targetDeviceName,
        }),
        'success'
      );
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Error al vincular accesorio', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedTransfer) {
      showToast('Por favor selecciona un accesorio primero.', 'warning');
      return;
    }
    const fromDev = selectedTransfer.device || 'otro equipo';
    try {
      setIsProcessing(true);
      await saveAccessory({
        ...selectedTransfer,
        device: targetDeviceName,
      });
      showToast(
        t('attachAccessorySuccessTransferred', {
          name: selectedTransfer.name,
          fromDevice: fromDev,
          toDevice: targetDeviceName,
        }),
        'success'
      );
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Error al transferir accesorio', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#18181c] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#27272b] my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#27272b] bg-slate-50/50 dark:bg-[#202024]/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#f4f4f5]">
                {t('attachAccessoryModalTitle', { name: targetDeviceName })}
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#a1a1aa]">
                {t('attachAccessoryModalSubtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-[#f4f4f5] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 p-1.5 bg-slate-100 dark:bg-[#202024]/60 border-b border-slate-200 dark:border-[#27272b] gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'link'
                ? 'bg-white dark:bg-[#18181c] text-purple-600 dark:text-purple-300 shadow-xs border border-slate-200 dark:border-[#2f2f36]'
                : 'text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#f4f4f5]'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>{t('attachAccessoryTabLink')}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-[#2a2a30]">
              {unlinkedAccessories.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transfer')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'transfer'
                ? 'bg-white dark:bg-[#18181c] text-purple-600 dark:text-purple-300 shadow-xs border border-slate-200 dark:border-[#2f2f36]'
                : 'text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#f4f4f5]'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>{t('attachAccessoryTabTransfer')}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-[#2a2a30]">
              {otherDeviceAccessories.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'new'
                ? 'bg-white dark:bg-[#18181c] text-purple-600 dark:text-purple-300 shadow-xs border border-slate-200 dark:border-[#2f2f36]'
                : 'text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#f4f4f5]'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t('attachAccessoryTabNew')}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {/* TAB 1: CREATE NEW (Clean UI: only description and essential button, NO green checkmarks) */}
          {activeTab === 'new' && (
            <div className="p-6 text-center bg-slate-50 dark:bg-[#202024]/50 rounded-2xl border border-slate-200 dark:border-[#27272b] space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-[#f4f4f5]">
                  {t('attachAccessoryNewCardTitle')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-[#a1a1aa] mt-1.5 max-w-sm mx-auto leading-relaxed">
                  {t('attachAccessoryNewCardDesc', { name: targetDeviceName })}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCreateNewAccessory(targetDeviceName);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{t('attachAccessoryOpenFormBtn')}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LINK EXISTING UNASSIGNED */}
          {activeTab === 'link' && (
            <div className="space-y-3">
              {unlinkedAccessories.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-[#202024]/50 rounded-2xl border border-slate-200 dark:border-[#27272b] space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-[#25252a] text-slate-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-[#d4d4d8]">
                      {t('attachAccessoryNoUnlinkedTitle')}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-[#71717a] mt-1 max-w-sm mx-auto">
                      {t('attachAccessoryNoUnlinkedDesc')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('new')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 rounded-xl border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{t('attachAccessoryTabNew')}</span>
                  </button>
                </div>
              ) : (
                <>
                  {unlinkedAccessories.length > 3 && (
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        maxLength={80}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('accessoriesSearchPlaceholder')}
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272b] rounded-xl text-xs text-slate-900 dark:text-[#f4f4f5] focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                    {filteredUnlinked.map((acc) => {
                      const isSelected = selectedUnlinkedId === acc.id;
                      return (
                        <div
                          key={acc.id}
                          onClick={() => setSelectedUnlinkedId(acc.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-400 dark:border-purple-600 shadow-xs'
                              : 'bg-white dark:bg-[#202024]/60 border-slate-200 dark:border-[#27272b] hover:border-slate-300 dark:hover:border-[#383840]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'border-purple-600 bg-purple-600 text-white'
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900 dark:text-[#f4f4f5] truncate">
                                  {acc.name}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 shrink-0">
                                  {acc.category}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-[#a1a1aa] truncate mt-0.5">
                                {acc.description || 'Sin notas'}
                              </p>
                            </div>
                          </div>

                          {(() => {
                            const safeRating = getSafeRating(acc.rating, 5);
                            const ratingConfig = getRatingConfig(safeRating);
                            return (
                              <div className={`flex items-center gap-1 shrink-0 ${ratingConfig.textColor}`}>
                                <Star className={`w-3.5 h-3.5 ${ratingConfig.starColor}`} />
                                <span className="text-xs font-bold font-mono">
                                  {safeRating}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex items-center justify-end border-t border-slate-100 dark:border-[#27272b]">
                    <button
                      type="button"
                      disabled={!selectedUnlinked || isProcessing}
                      onClick={handleLink}
                      className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>{t('attachAccessoryBtnLinkSelected')}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: TRANSFER FROM OTHER DEVICE */}
          {activeTab === 'transfer' && (
            <div className="space-y-3">
              {otherDeviceAccessories.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-[#202024]/50 rounded-2xl border border-slate-200 dark:border-[#27272b] space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-[#25252a] text-slate-400 flex items-center justify-center">
                    <ArrowLeftRight className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-[#d4d4d8]">
                      {t('attachAccessoryNoOtherTitle')}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-[#71717a] mt-1 max-w-sm mx-auto">
                      {t('attachAccessoryNoOtherDesc')}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                    {filteredTransfer.map((acc) => {
                      const isSelected = selectedTransferId === acc.id;
                      return (
                        <div
                          key={acc.id}
                          onClick={() => setSelectedTransferId(acc.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-400 dark:border-purple-600 shadow-xs'
                              : 'bg-white dark:bg-[#202024]/60 border-slate-200 dark:border-[#27272b] hover:border-slate-300 dark:hover:border-[#383840]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'border-purple-600 bg-purple-600 text-white'
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>

                            <div className="min-w-0">
                              <span className="font-bold text-sm text-slate-900 dark:text-[#f4f4f5] block truncate">
                                {acc.name}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 dark:text-[#a1a1aa]">
                                <span className="font-semibold text-purple-600 dark:text-purple-400">
                                  {acc.category}
                                </span>
                                <span>•</span>
                                <span>En: {acc.device}</span>
                              </div>
                            </div>
                          </div>

                          {(() => {
                            const safeRating = getSafeRating(acc.rating, 5);
                            const ratingConfig = getRatingConfig(safeRating);
                            return (
                              <div className={`flex items-center gap-1 shrink-0 ${ratingConfig.textColor}`}>
                                <Star className={`w-3.5 h-3.5 ${ratingConfig.starColor}`} />
                                <span className="text-xs font-bold font-mono">
                                  {safeRating}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex items-center justify-end border-t border-slate-100 dark:border-[#27272b]">
                    <button
                      type="button"
                      disabled={!selectedTransfer || isProcessing}
                      onClick={handleTransfer}
                      className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>{t('attachAccessoryBtnTransferSelected')}</span>
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

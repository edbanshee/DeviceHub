import React, { useState } from 'react';
import { AlertTriangle, X, Check, RefreshCw, Trash2, Layers, Cpu, Package, HardDrive } from 'lucide-react';
import { StorageDrive, Device, Accessory } from '../../types';
import { useStorage } from '../../context/StorageContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { DEFAULT_ACCESSORY_CATEGORIES } from '../../data/initialData';

interface DeleteOptionConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'category' | 'accessoryCategory' | 'driveType' | 'format' | 'cloudProvider';
  optionValue: string;
  affectedDrives?: StorageDrive[];
  affectedDevices?: Device[];
  affectedAccessories?: Accessory[];
}

export const DeleteOptionConflictModal: React.FC<DeleteOptionConflictModalProps> = ({
  isOpen,
  onClose,
  type,
  optionValue,
  affectedDrives = [],
  affectedDevices = [],
  affectedAccessories = [],
}) => {
  const { settings, reassignOptionBulk, reassignOptionIndividual, cascadeDeleteOption } = useStorage();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [resolutionMode, setResolutionMode] = useState<'bulk' | 'individual' | 'cascade'>('bulk');
  
  // Available replacement options (excluding the one being deleted)
  const availableOptions = (
    type === 'category'
      ? settings.deviceCategories || []
      : type === 'accessoryCategory'
      ? (Array.isArray(settings.accessoryCategories) && settings.accessoryCategories.length > 0
          ? settings.accessoryCategories
          : DEFAULT_ACCESSORY_CATEGORIES)
      : type === 'driveType'
      ? settings.driveTypes || []
      : type === 'format'
      ? settings.formatOptions || []
      : settings.cloudProviders || []
  ).filter((opt) => opt !== optionValue);

  const [bulkSubstitute, setBulkSubstitute] = useState<string>(availableOptions[0] || '');

  // Individual replacements map: entityId -> substituteOption
  const [individualSubstitutes, setIndividualSubstitutes] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (type === 'category') {
      affectedDevices.forEach((d) => {
        init[d.id] = availableOptions[0] || '';
      });
    } else if (type === 'accessoryCategory') {
      affectedAccessories.forEach((a) => {
        init[a.id] = availableOptions[0] || '';
      });
    } else {
      affectedDrives.forEach((dr) => {
        init[dr.id] = availableOptions[0] || '';
      });
    }
    return init;
  });

  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const affectedCount =
    type === 'category'
      ? affectedDevices.length
      : type === 'accessoryCategory'
      ? affectedAccessories.length
      : affectedDrives.length;

  const targetLabel =
    type === 'category'
      ? 'dispositivo(s)'
      : type === 'accessoryCategory'
      ? 'accesorio(s)'
      : 'unidad(es)';

  const handleApply = async () => {
    try {
      setIsProcessing(true);

      if (resolutionMode === 'bulk') {
        if (!bulkSubstitute) {
          showToast('Selecciona una opción sustituta válida.', 'warning');
          return;
        }
        await reassignOptionBulk(type, optionValue, bulkSubstitute);
        showToast(`Opción "${optionValue}" reasignada a "${bulkSubstitute}" y eliminada.`, 'success');
      } else if (resolutionMode === 'individual') {
        await reassignOptionIndividual(type, individualSubstitutes, optionValue);
        showToast(`Reasignación individual completada y opción eliminada.`, 'success');
      } else if (resolutionMode === 'cascade') {
        await cascadeDeleteOption(type, optionValue);
        showToast(`Eliminación en cascada de "${optionValue}" completada.`, 'success');
      }

      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Error al resolver el conflicto', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#18181c] rounded-2xl shadow-2xl border border-amber-300 dark:border-amber-700/60 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Alert */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-500/10 border-b border-amber-200 dark:border-amber-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#f4f4f5]">
                {t('conflictTitle')}
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                "{optionValue}" está en uso por {affectedCount} {targetLabel}
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

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <p className="text-sm text-slate-600 dark:text-[#a1a1aa]">
            No se puede eliminar la opción directamente porque causaría inconsistencias de datos. Por favor selecciona cómo deseas resolverlo:
          </p>

          {/* Resolution Options */}
          <div className="space-y-3">
            {/* Mode 1: Bulk Reassignment */}
            <label
              className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                resolutionMode === 'bulk'
                  ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 shadow-xs'
                  : 'border-slate-200 dark:border-[#27272b] hover:border-slate-300 dark:hover:border-[#323238]'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="conflictMode"
                  checked={resolutionMode === 'bulk'}
                  onChange={() => setResolutionMode('bulk')}
                  className="mt-1 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold text-sm text-slate-900 dark:text-[#f4f4f5]">
                      {t('conflictModeBulk')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-[#a1a1aa] mt-1">
                    {t('conflictModeBulkDesc')}
                  </p>

                  {resolutionMode === 'bulk' && (
                    <div className="mt-3 pt-3 border-t border-purple-100 dark:border-purple-900/40">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-[#d4d4d8] mb-1">
                        {t('conflictModeBulkSelect')}
                      </label>
                      <select
                        value={bulkSubstitute}
                        onChange={(e) => setBulkSubstitute(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-[#202024] border border-slate-300 dark:border-[#27272b] rounded-lg text-sm text-slate-900 dark:text-[#f4f4f5] focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer"
                      >
                        {availableOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </label>

            {/* Mode 2: Individual Reassignment (Supported for Devices, Accessories, and Drives) */}
            <label
              className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                resolutionMode === 'individual'
                  ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 shadow-xs'
                  : 'border-slate-200 dark:border-[#27272b] hover:border-slate-300 dark:hover:border-[#323238]'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="conflictMode"
                  checked={resolutionMode === 'individual'}
                  onChange={() => setResolutionMode('individual')}
                  className="mt-1 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold text-sm text-slate-900 dark:text-[#f4f4f5]">
                      {t('conflictModeIndividual')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-[#a1a1aa] mt-1">
                    {t('conflictModeIndividualDesc')}
                  </p>

                  {resolutionMode === 'individual' && (
                    <div className="mt-3 pt-3 border-t border-purple-100 dark:border-purple-900/40 space-y-2 max-h-52 overflow-y-auto pr-1">
                      {/* 1. Devices List */}
                      {type === 'category' &&
                        affectedDevices.map((d) => (
                          <div
                            key={d.id}
                            className="flex items-center justify-between gap-3 p-2 bg-white dark:bg-[#202024] rounded-lg border border-slate-200 dark:border-[#27272b] text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Cpu className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                              <span className="font-semibold text-slate-800 dark:text-[#f4f4f5] truncate">
                                {d.name}
                              </span>
                            </div>
                            <select
                              value={individualSubstitutes[d.id] || availableOptions[0]}
                              onChange={(e) =>
                                setIndividualSubstitutes({
                                  ...individualSubstitutes,
                                  [d.id]: e.target.value,
                                })
                              }
                              className="px-2 py-1 bg-slate-50 dark:bg-[#202024] border border-slate-300 dark:border-[#27272b] rounded text-xs font-semibold focus:outline-none cursor-pointer shrink-0"
                            >
                              {availableOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}

                      {/* 2. Accessories List */}
                      {type === 'accessoryCategory' &&
                        affectedAccessories.map((a) => (
                          <div
                            key={a.id}
                            className="flex items-center justify-between gap-3 p-2 bg-white dark:bg-[#202024] rounded-lg border border-slate-200 dark:border-[#27272b] text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Package className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span className="font-semibold text-slate-800 dark:text-[#f4f4f5] truncate">
                                {a.name}
                              </span>
                            </div>
                            <select
                              value={individualSubstitutes[a.id] || availableOptions[0]}
                              onChange={(e) =>
                                setIndividualSubstitutes({
                                  ...individualSubstitutes,
                                  [a.id]: e.target.value,
                                })
                              }
                              className="px-2 py-1 bg-slate-50 dark:bg-[#202024] border border-slate-300 dark:border-[#27272b] rounded text-xs font-semibold focus:outline-none cursor-pointer shrink-0"
                            >
                              {availableOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}

                      {/* 3. Drives List */}
                      {type !== 'category' &&
                        type !== 'accessoryCategory' &&
                        affectedDrives.map((dr) => (
                          <div
                            key={dr.id}
                            className="flex items-center justify-between gap-3 p-2 bg-white dark:bg-[#202024] rounded-lg border border-slate-200 dark:border-[#27272b] text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <HardDrive className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span className="font-mono text-slate-800 dark:text-[#f4f4f5] truncate">
                                {dr.device || 'Sin vincular'} - {dr.drive}
                              </span>
                            </div>
                            <select
                              value={individualSubstitutes[dr.id] || availableOptions[0]}
                              onChange={(e) =>
                                setIndividualSubstitutes({
                                  ...individualSubstitutes,
                                  [dr.id]: e.target.value,
                                })
                              }
                              className="px-2 py-1 bg-slate-50 dark:bg-[#202024] border border-slate-300 dark:border-[#27272b] rounded text-xs font-semibold focus:outline-none cursor-pointer shrink-0"
                            >
                              {availableOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </label>

            {/* Mode 3: Cascade Deletion (Supported for Devices, Accessories, and Drives) */}
            <label
              className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                resolutionMode === 'cascade'
                  ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 shadow-xs'
                  : 'border-slate-200 dark:border-[#27272b] hover:border-slate-300 dark:hover:border-[#323238]'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="conflictMode"
                  checked={resolutionMode === 'cascade'}
                  onChange={() => setResolutionMode('cascade')}
                  className="mt-1 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span className="font-semibold text-sm text-rose-700 dark:text-rose-300">
                      {t('conflictModeCascade')}
                    </span>
                  </div>
                  <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1">
                    {t('conflictModeCascadeDesc', { count: affectedCount })}
                  </p>
                </div>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#27272b]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-[#d4d4d8] hover:bg-slate-100 dark:hover:bg-[#222226] rounded-xl transition-colors cursor-pointer"
            >
              {t('conflictBtnCancel')}
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={isProcessing}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-xs transition-all cursor-pointer ${
                resolutionMode === 'cascade'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {resolutionMode === 'bulk'
                  ? t('conflictBtnApplyBulk')
                  : resolutionMode === 'individual'
                  ? t('conflictBtnApplyIndividual')
                  : t('conflictBtnApplyCascade')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

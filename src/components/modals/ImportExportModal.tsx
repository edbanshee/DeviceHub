import React, { useState, useRef } from 'react';
import { Download, Upload, FileText, CheckCircle2, AlertCircle, X, Check } from 'lucide-react';
import { StorageExportData } from '../../types';
import { useStorage } from '../../context/StorageContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({ isOpen, onClose }) => {
  const { exportBackup, importBackup, settings } = useStorage();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importedData, setImportedData] = useState<StorageExportData | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      const data = exportBackup();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `storage_tracker_backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(t('toastExportComplete'), 'success');
    } catch (err: any) {
      showToast(err?.message || 'Error al exportar los datos', 'error');
    }
  };

  const processFile = (file: File) => {
    setErrorMsg(null);
    setImportedData(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        // Validation check
        if (!parsed || (!Array.isArray(parsed.devices) && !Array.isArray(parsed.drives))) {
          setErrorMsg(t('ioInvalidJson'));
          return;
        }

        setImportedData(parsed as StorageExportData);
      } catch {
        setErrorMsg(t('ioInvalidJson'));
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const countNewOptions = (data: StorageExportData) => {
    let count = 0;
    const currentDT = new Set(settings.driveTypes);
    const currentFMT = new Set(settings.formatOptions);
    const currentCAT = new Set(settings.deviceCategories);
    const currentAC = new Set(settings.accessoryCategories || []);
    const currentCP = new Set(settings.cloudProviders || []);

    data.settings?.driveTypes?.forEach((dt) => {
      if (!currentDT.has(dt)) count++;
    });
    data.settings?.formatOptions?.forEach((f) => {
      if (!currentFMT.has(f)) count++;
    });
    data.settings?.deviceCategories?.forEach((c) => {
      if (!currentCAT.has(c)) count++;
    });
    data.settings?.accessoryCategories?.forEach((ac) => {
      if (!currentAC.has(ac)) count++;
    });
    data.settings?.cloudProviders?.forEach((cp) => {
      if (!currentCP.has(cp)) count++;
    });

    data.devices?.forEach((d) => {
      if (d.category && !currentCAT.has(d.category)) count++;
    });
    data.accessories?.forEach((a) => {
      if (a.category && !currentAC.has(a.category)) count++;
    });
    data.drives?.forEach((dr) => {
      if (dr.driveType && !currentDT.has(dr.driveType)) count++;
      if (dr.format && !currentFMT.has(dr.format)) count++;
      if (dr.cloudProvider && !currentCP.has(dr.cloudProvider)) count++;
    });

    return count;
  };

  const handleApplyImport = async () => {
    if (!importedData) return;

    try {
      setIsProcessing(true);
      const res = await importBackup(importedData, importMode);
      showToast(
        `${t('ioSuccess')} (${res.addedDevices} dispositivos, ${res.addedAccessories} accesorios, ${res.addedDrives} unidades, ${res.newOptions} tipos nuevos)`,
        'success'
      );
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Error al importar los datos', 'error');
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
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-[#f4f4f5]">
                {t('ioTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#a1a1aa]">
                Respaldo completo de dispositivos, discos y ajustes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-[#f4f4f5] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Export */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#27272b] bg-slate-50/50 dark:bg-[#202024]/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-[#f4f4f5] flex items-center gap-2">
                  <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>{t('ioExportHeader')}</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-[#a1a1aa] mt-1">
                  {t('ioExportDesc')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{t('ioBtnExport')}</span>
            </button>
          </div>

          {/* Section 2: Import */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-[#f4f4f5] flex items-center gap-2">
              <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{t('ioImportHeader')}</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-[#a1a1aa]">
              {t('ioImportDesc')}
            </p>

            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20'
                  : 'border-slate-300 dark:border-[#27272b] hover:border-purple-400 dark:hover:border-purple-500 bg-slate-50/30 dark:bg-[#202024]/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-8 h-8 mx-auto mb-2 text-purple-500 dark:text-purple-400" />
              <p className="text-xs font-semibold text-slate-800 dark:text-[#f4f4f5]">
                {t('ioSelectFile')}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t('ioDragFile')}
              </p>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Import Preview */}
            {importedData && (
              <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-900 dark:text-purple-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{t('ioPreviewTitle')}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-white dark:bg-[#18181c] rounded-lg border border-slate-200 dark:border-[#27272b]">
                    <span className="block font-bold text-slate-900 dark:text-[#f4f4f5] text-sm font-mono">
                      {importedData.devices?.length || 0}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-[#a1a1aa]">Dispositivos</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-[#18181c] rounded-lg border border-slate-200 dark:border-[#27272b]">
                    <span className="block font-bold text-slate-900 dark:text-[#f4f4f5] text-sm font-mono">
                      {importedData.accessories?.length || 0}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-[#a1a1aa]">Accesorios</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-[#18181c] rounded-lg border border-slate-200 dark:border-[#27272b]">
                    <span className="block font-bold text-slate-900 dark:text-[#f4f4f5] text-sm font-mono">
                      {importedData.drives?.length || 0}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-[#a1a1aa]">Unidades</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-[#18181c] rounded-lg border border-slate-200 dark:border-[#27272b]">
                    <span className="block font-bold text-purple-600 dark:text-purple-400 text-sm font-mono">
                      +{countNewOptions(importedData)}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-[#a1a1aa]">Tipos nuevos</span>
                  </div>
                </div>

                {/* Import Mode: Merge vs Replace */}
                <div className="pt-2 border-t border-purple-100 dark:border-purple-900/40">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-[#d4d4d8] mb-1.5">
                    {t('ioImportMode')}
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-[#27272b] bg-white dark:bg-[#18181c] cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'merge'}
                        onChange={() => setImportMode('merge')}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="font-medium text-slate-800 dark:text-[#f4f4f5]">
                        {t('ioImportModeMerge')}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-[#27272b] bg-white dark:bg-[#18181c] cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span className="font-medium text-slate-800 dark:text-[#f4f4f5]">
                        {t('ioImportModeReplace')}
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyImport}
                  disabled={isProcessing}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{isProcessing ? 'Importando...' : t('ioBtnApplyImport')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200 dark:border-[#27272b] bg-slate-50/50 dark:bg-[#202024]/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-[#d4d4d8] hover:bg-slate-200 dark:hover:bg-[#222226] rounded-xl transition-colors"
          >
            {t('btnClose')}
          </button>
        </div>
      </div>
    </div>
  );
};

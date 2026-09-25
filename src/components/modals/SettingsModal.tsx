import React, { useState } from 'react';
import { X, Plus, Trash2, Sliders, HardDrive, Layers, FolderCog, Cloud, Package, Cpu } from 'lucide-react';
import { useStorage } from '../../context/StorageContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { DeleteOptionConflictModal } from './DeleteOptionConflictModal';
import { DEFAULT_CLOUD_PROVIDERS, DEFAULT_ACCESSORY_CATEGORIES } from '../../data/initialData';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, devices, drives, accessories, addOption, deleteOption } = useStorage();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    'categories' | 'accessoryCategories' | 'driveTypes' | 'formats' | 'cloudProviders'
  >('categories');
  const [newValue, setNewValue] = useState('');

  // Conflict state
  const [conflictData, setConflictData] = useState<{
    isOpen: boolean;
    type: 'category' | 'accessoryCategory' | 'driveType' | 'format' | 'cloudProvider';
    value: string;
  }>({
    isOpen: false,
    type: 'category',
    value: '',
  });

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newValue.trim();
    if (!clean) return;

    let targetType: 'category' | 'accessoryCategory' | 'driveType' | 'format' | 'cloudProvider' = 'category';
    if (activeTab === 'categories') targetType = 'category';
    else if (activeTab === 'accessoryCategories') targetType = 'accessoryCategory';
    else if (activeTab === 'driveTypes') targetType = 'driveType';
    else if (activeTab === 'formats') targetType = 'format';
    else if (activeTab === 'cloudProviders') targetType = 'cloudProvider';

    await addOption(targetType, clean);
    setNewValue('');
    showToast(`"${clean}" añadido exitosamente.`, 'success');
  };

  const handleDeleteRequest = async (item: string) => {
    if (activeTab === 'categories') {
      const affectedDevs = devices.filter((d) => d.category === item);
      if (affectedDevs.length > 0) {
        setConflictData({ isOpen: true, type: 'category', value: item });
        return;
      }
      await deleteOption('category', item);
      showToast(`Opción "${item}" eliminada.`, 'success');
    } else if (activeTab === 'accessoryCategories') {
      const affectedAccs = accessories.filter((a) => a.category === item);
      if (affectedAccs.length > 0) {
        setConflictData({ isOpen: true, type: 'accessoryCategory', value: item });
        return;
      }
      await deleteOption('accessoryCategory', item);
      showToast(`Opción "${item}" eliminada.`, 'success');
    } else if (activeTab === 'driveTypes') {
      const affected = drives.filter((dr) => dr.driveType === item);
      if (affected.length > 0) {
        setConflictData({ isOpen: true, type: 'driveType', value: item });
        return;
      }
      await deleteOption('driveType', item);
      showToast(`Opción "${item}" eliminada.`, 'success');
    } else if (activeTab === 'formats') {
      const affected = drives.filter((dr) => dr.format === item);
      if (affected.length > 0) {
        setConflictData({ isOpen: true, type: 'format', value: item });
        return;
      }
      await deleteOption('format', item);
      showToast(`Opción "${item}" eliminada.`, 'success');
    } else if (activeTab === 'cloudProviders') {
      const affected = drives.filter((dr) => dr.storageMedium === 'cloud_network' && dr.cloudProvider === item);
      if (affected.length > 0) {
        setConflictData({ isOpen: true, type: 'cloudProvider', value: item });
        return;
      }
      await deleteOption('cloudProvider', item);
      showToast(`Opción "${item}" eliminada.`, 'success');
    }
  };

  const getUsageCount = (item: string) => {
    if (activeTab === 'categories') {
      return devices.filter((d) => d.category === item).length;
    }
    if (activeTab === 'accessoryCategories') {
      return accessories.filter((a) => a.category === item).length;
    }
    if (activeTab === 'driveTypes') {
      return drives.filter((dr) => dr.driveType === item).length;
    }
    if (activeTab === 'formats') {
      return drives.filter((dr) => dr.format === item).length;
    }
    return drives.filter((dr) => dr.storageMedium === 'cloud_network' && dr.cloudProvider === item).length;
  };

  const currentList =
    activeTab === 'categories'
      ? settings.deviceCategories || []
      : activeTab === 'accessoryCategories'
      ? settings.accessoryCategories || []
      : activeTab === 'driveTypes'
      ? settings.driveTypes || []
      : activeTab === 'formats'
      ? settings.formatOptions || []
      : settings.cloudProviders || [];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-xl bg-white dark:bg-[#18181c] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#27272b] my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#27272b] bg-slate-50/50 dark:bg-[#202024]/40">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-[#f4f4f5]">
                  {t('settingsModalTitle')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#a1a1aa]">
                  {t('settingsModalSubtitle')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-[#f4f4f5] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs - Order: Dispositivos, Accesorios, Almacenamiento, Formatos, Cloud */}
          <div className="flex flex-wrap border-b border-slate-200 dark:border-[#27272b] bg-slate-100/50 dark:bg-[#202024]/60 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`flex-1 min-w-[95px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-white dark:bg-[#18181c] text-purple-600 dark:text-purple-300 shadow-xs border border-slate-200 dark:border-[#2f2f36]'
                  : 'text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#f4f4f5]'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>{t('settingsTabCategories')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('accessoryCategories')}
              className={`flex-1 min-w-[95px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'accessoryCategories'
                  ? 'bg-white dark:bg-[#18181c] text-purple-600 dark:text-purple-300 shadow-xs border border-slate-200 dark:border-[#2f2f36]'
                  : 'text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#f4f4f5]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>{t('settingsTabAccessories')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('driveTypes')}
              className={`flex-1 min-w-[95px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'driveTypes'
                  ? 'bg-white dark:bg-[#18181c] text-purple-600 dark:text-purple-300 shadow-xs border border-slate-200 dark:border-[#2f2f36]'
                  : 'text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#f4f4f5]'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>{t('settingsTabDriveTypes')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('formats')}
              className={`flex-1 min-w-[95px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'formats'
                  ? 'bg-white dark:bg-[#18181c] text-purple-600 dark:text-purple-300 shadow-xs border border-slate-200 dark:border-[#2f2f36]'
                  : 'text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#f4f4f5]'
              }`}
            >
              <FolderCog className="w-4 h-4" />
              <span>{t('settingsTabFormats')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cloudProviders')}
              className={`flex-1 min-w-[95px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'cloudProviders'
                  ? 'bg-white dark:bg-[#18181c] text-purple-600 dark:text-purple-300 shadow-xs border border-slate-200 dark:border-[#2f2f36]'
                  : 'text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#f4f4f5]'
              }`}
            >
              <Cloud className="w-4 h-4" />
              <span>{t('settingsTabCloudProviders')}</span>
            </button>
          </div>

          {/* Form to Add New */}
          <div className="p-6 pb-2">
            <form onSubmit={handleAdd} className="space-y-1.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    maxLength={activeTab === 'formats' ? 25 : 40}
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder={t('settingsAddNewPlaceholder')}
                    className="w-full px-3 py-2 pr-14 bg-slate-50 dark:bg-[#202024] border border-slate-300 dark:border-[#27272b] rounded-xl text-sm text-slate-900 dark:text-[#f4f4f5] focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <span className={`absolute right-3 top-2.5 text-[10px] font-mono pointer-events-none ${newValue.length >= (activeTab === 'formats' ? 25 : 40) ? 'text-amber-500 font-bold' : 'text-slate-400 dark:text-[#71717a]'}`}>
                    {newValue.length}/{activeTab === 'formats' ? 25 : 40}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={!newValue.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('settingsBtnAdd')}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Items List */}
          <div className="p-6 pt-2 max-h-72 overflow-y-auto space-y-2">
            {currentList.length === 0 ? (
              <div className="py-8 text-center text-slate-400 dark:text-[#71717a] text-xs">
                {t('settingsEmptyList')}
              </div>
            ) : (
              currentList.map((item) => {
                const inUseCount = getUsageCount(item);
                return (
                  <div
                    key={item}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-[#27272b] bg-slate-50/50 dark:bg-[#202024]/40 hover:bg-slate-100 dark:hover:bg-[#26262b] transition-colors"
                  >
                    <span className="text-sm font-medium text-slate-800 dark:text-[#f4f4f5]">
                      {item}
                    </span>
                    <div className="flex items-center gap-3">
                      {inUseCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60">
                          {t('settingsInUseBadge', { count: inUseCount })}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] text-slate-400 font-mono">
                          0
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteRequest(item)}
                        title="Eliminar opción"
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-200 dark:hover:bg-[#2e2e33] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200 dark:border-[#27272b] bg-slate-50/50 dark:bg-[#202024]/40">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-slate-700 dark:text-[#d4d4d8] bg-slate-200 dark:bg-[#26262b] hover:bg-slate-300 dark:hover:bg-[#2e2e33] rounded-xl transition-colors cursor-pointer"
            >
              {t('settingsClose')}
            </button>
          </div>
        </div>
      </div>

      {/* Conflict Modal */}
      {conflictData.isOpen && (
        <DeleteOptionConflictModal
          isOpen={conflictData.isOpen}
          onClose={() => setConflictData({ isOpen: false, type: 'category', value: '' })}
          type={conflictData.type}
          optionValue={conflictData.value}
          affectedDrives={drives.filter((dr) => {
            if (conflictData.type === 'driveType') return dr.driveType === conflictData.value;
            if (conflictData.type === 'format') return dr.format === conflictData.value;
            if (conflictData.type === 'cloudProvider') return dr.storageMedium === 'cloud_network' && dr.cloudProvider === conflictData.value;
            return false;
          })}
          affectedDevices={devices.filter((d) => d.category === conflictData.value)}
          affectedAccessories={accessories.filter((a) => a.category === conflictData.value)}
        />
      )}
    </>
  );
};

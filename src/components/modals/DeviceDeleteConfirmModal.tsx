import React, { useState } from 'react';
import { AlertTriangle, X, Trash2, Package, HardDrive } from 'lucide-react';
import { Device } from '../../types';
import { useStorage } from '../../context/StorageContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

interface DeviceDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device | null;
}

export const DeviceDeleteConfirmModal: React.FC<DeviceDeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  device,
}) => {
  const { drives, accessories, deleteDevice } = useStorage();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [cascadeDrives, setCascadeDrives] = useState<boolean>(true);
  const [cascadeAccessories, setCascadeAccessories] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !device) return null;

  const assignedDrives = drives.filter((dr) => dr.device === device.name);
  const assignedAccessories = accessories.filter((acc) => acc.device === device.name);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await deleteDevice(device.id, cascadeDrives, cascadeAccessories);
      showToast(t('toastDeviceDeleted'), 'success');
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Error al eliminar el dispositivo', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-[#18181c] rounded-2xl shadow-2xl border border-rose-300 dark:border-rose-900/60 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Alert */}
        <div className="flex items-center justify-between px-6 py-4 bg-rose-500/10 border-b border-rose-200 dark:border-rose-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#f4f4f5]">
                {t('deleteDeviceTitle')}
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium truncate max-w-[200px]">
                {device.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-[#f4f4f5] rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-[#a1a1aa]">
            {t('deleteDeviceDesc', { name: device.name })}
          </p>

          {/* Drives Notice */}
          {assignedDrives.length > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/40 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200">
                <HardDrive className="w-4 h-4 text-amber-500" />
                <span>{t('deleteDeviceDrivesNotice', { count: assignedDrives.length })}</span>
              </div>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="driveAction"
                    checked={cascadeDrives}
                    onChange={() => setCascadeDrives(true)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-rose-700 dark:text-rose-300 font-medium">
                    {t('deleteDeviceActionCascade', { count: assignedDrives.length })}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="driveAction"
                    checked={!cascadeDrives}
                    onChange={() => setCascadeDrives(false)}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-slate-700 dark:text-[#d4d4d8]">
                    {t('deleteDeviceActionUnlink')}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Accessories Notice */}
          {assignedAccessories.length > 0 && (
            <div className="p-3 bg-purple-50/70 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800/40 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-900 dark:text-purple-200">
                <Package className="w-4 h-4 text-purple-500" />
                <span>{t('deleteDeviceAccessoriesNotice', { count: assignedAccessories.length })}</span>
              </div>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accAction"
                    checked={!cascadeAccessories}
                    onChange={() => setCascadeAccessories(false)}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-purple-700 dark:text-purple-300 font-medium">
                    {t('deleteDeviceActionUnlinkAcc', { count: assignedAccessories.length })}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accAction"
                    checked={cascadeAccessories}
                    onChange={() => setCascadeAccessories(true)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-slate-700 dark:text-[#d4d4d8]">
                    {t('deleteDeviceActionCascadeAcc', { count: assignedAccessories.length })}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#27272b]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-[#d4d4d8] hover:bg-slate-100 dark:hover:bg-[#222226] rounded-xl transition-colors cursor-pointer"
            >
              {t('deleteDeviceBtnCancel')}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? t('btnDeleting') : t('deleteDeviceBtnConfirm')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

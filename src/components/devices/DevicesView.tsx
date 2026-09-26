import React, { useState, useMemo } from 'react';
import { Search, Plus, Laptop, Gamepad2, HardDrive } from 'lucide-react';
import { Device, Accessory } from '../../types';
import { useStorage } from '../../context/StorageContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatStorageGB } from '../../utils/formatters';
import { DeviceCard } from './DeviceCard';

interface DevicesViewProps {
  onOpenAddDevice: () => void;
  onEditDevice: (device: Device) => void;
  onDeleteDevice: (device: Device) => void;
  onAddDriveToDevice: (deviceName: string) => void;
  onAddAccessoryToDevice?: (deviceName: string) => void;
  onEditAccessory?: (accessory: Accessory) => void;
  onNavigateToMatrix?: (deviceId?: string) => void;
}

export const DevicesView: React.FC<DevicesViewProps> = ({
  onOpenAddDevice,
  onEditDevice,
  onDeleteDevice,
  onAddDriveToDevice,
  onAddAccessoryToDevice,
  onEditAccessory,
  onNavigateToMatrix,
}) => {
  const { devices, drives, accessories, settings } = useStorage();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [deviceFilterType, setDeviceFilterType] = useState<'all' | 'gaming' | 'general'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name_asc');

  // Synchronized categories from settings + existing devices
  const availableCategories = useMemo(() => {
    return Array.from(
      new Set([...(settings.deviceCategories || []), ...devices.map((d) => d.category)].filter(Boolean))
    );
  }, [settings.deviceCategories, devices]);

  // Unique systems / OS
  const availableSystems = useMemo(() => {
    return Array.from(new Set(devices.map((d) => d.system).filter(Boolean)));
  }, [devices]);

  // Map of device name to total capacity
  const deviceStorageMap = useMemo(() => {
    const map = new Map<string, number>();
    drives.forEach((dr) => {
      if (dr.device) {
        map.set(dr.device, (map.get(dr.device) || 0) + (dr.capacity || 0));
      }
    });
    return map;
  }, [drives]);

  const filteredDevices = useMemo(() => {
    const list = devices.filter((dev) => {
      // Emulation / Type filter
      if (deviceFilterType === 'gaming' && !dev.isGamingDevice) {
        return false;
      }
      if (deviceFilterType === 'general' && dev.isGamingDevice) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && dev.category !== selectedCategory) {
        return false;
      }

      // System / OS filter
      if (selectedSystem !== 'all' && dev.system !== selectedSystem) {
        return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = dev.name.toLowerCase().includes(q);
        const matchCpu = (dev.cpu || '').toLowerCase().includes(q);
        const matchSys = dev.system.toLowerCase().includes(q);
        const matchCat = dev.category?.toLowerCase().includes(q);
        const matchNotes = dev.notes?.toLowerCase().includes(q);
        const matchOverview = dev.emulationOverview?.toLowerCase().includes(q);
        if (!matchName && !matchCpu && !matchSys && !matchCat && !matchNotes && !matchOverview) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name_desc') {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === 'storage_desc') {
        const capA = deviceStorageMap.get(a.name) || 0;
        const capB = deviceStorageMap.get(b.name) || 0;
        return capB - capA;
      }
      if (sortBy === 'storage_asc') {
        const capA = deviceStorageMap.get(a.name) || 0;
        const capB = deviceStorageMap.get(b.name) || 0;
        return capA - capB;
      }
      if (sortBy === 'emulation_desc') {
        const countA = Object.keys(a.emulationScores || {}).length;
        const countB = Object.keys(b.emulationScores || {}).length;
        return countB - countA;
      }
      return 0;
    });
  }, [devices, deviceFilterType, selectedCategory, selectedSystem, searchQuery, sortBy, deviceStorageMap]);

  const gamingCount = devices.filter((d) => d.isGamingDevice).length;
  const generalCount = devices.filter((d) => !d.isGamingDevice).length;
  const totalLinkedStorage = filteredDevices.reduce((sum, d) => sum + (deviceStorageMap.get(d.name) || 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. Multi-Filter & Search Toolbar - Consistent with Drives Toolbar */}
      <div className="space-y-3">
        {/* Row 1: Search Box & Emulation/General Pills */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          {/* Emulation filter pills (Todos, Solo Emulación, General) */}
          <div className="flex items-center h-10 p-1 bg-slate-100 dark:bg-[#18181c] rounded-xl border border-slate-200 dark:border-[#27272b] text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setDeviceFilterType('all')}
              className={`h-full px-3.5 rounded-lg transition-colors cursor-pointer ${
                deviceFilterType === 'all'
                  ? 'bg-white dark:bg-[#222226] text-purple-600 dark:text-purple-300 shadow-xs border border-slate-200/80 dark:border-[#323238]'
                  : 'text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#f4f4f5]'
              }`}
            >
              {t('devicesPillAll')}
            </button>
            <button
              type="button"
              onClick={() => setDeviceFilterType('gaming')}
              className={`h-full px-3.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                deviceFilterType === 'gaming'
                  ? 'bg-white dark:bg-[#222226] text-purple-600 dark:text-purple-300 shadow-xs border border-slate-200/80 dark:border-[#323238]'
                  : 'text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#f4f4f5]'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-purple-500" />
              <span>{t('devicesPillGaming')}</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceFilterType('general')}
              className={`h-full px-3.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                deviceFilterType === 'general'
                  ? 'bg-white dark:bg-[#222226] text-blue-600 dark:text-blue-300 shadow-xs border border-slate-200/80 dark:border-[#323238]'
                  : 'text-slate-600 dark:text-[#a1a1aa] hover:text-slate-900 dark:hover:text-[#f4f4f5]'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-blue-500" />
              <span>{t('devicesPillGeneral')}</span>
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
              placeholder={t('devicesSearchPlaceholder')}
              className="w-full h-10 pl-10 pr-4 bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-[#f4f4f5] placeholder:text-slate-400 dark:placeholder:text-[#71717a] focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
            />
          </div>
        </div>

        {/* Row 2: Compact Dropdowns (Categoría, Sistema, Ordenar) + Add Device Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 min-w-0">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-9 px-2.5 bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] rounded-xl text-xs font-semibold text-slate-700 dark:text-[#d4d4d8] focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs cursor-pointer truncate"
            >
              <option value="all">{t('devicesFilterCategoryAll', { count: availableCategories.length })}</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* System / OS Dropdown */}
            <select
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
              className="w-full h-9 px-2.5 bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] rounded-xl text-xs font-semibold text-slate-700 dark:text-[#d4d4d8] focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs cursor-pointer truncate"
            >
              <option value="all">{t('devicesFilterSystemAll', { count: availableSystems.length })}</option>
              {availableSystems.map((sys) => (
                <option key={sys} value={sys}>
                  {sys}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-9 px-2.5 bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] rounded-xl text-xs font-semibold text-slate-700 dark:text-[#d4d4d8] focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs cursor-pointer truncate"
            >
              <option value="name_asc">{t('devicesSortNameAsc')}</option>
              <option value="name_desc">{t('devicesSortNameDesc')}</option>
              <option value="storage_desc">{t('devicesSortStorageDesc')}</option>
              <option value="storage_asc">{t('devicesSortStorageAsc')}</option>
              <option value="emulation_desc">{t('devicesSortEmulationDesc')}</option>
            </select>
          </div>

          {/* Add Device Button */}
          <button
            type="button"
            onClick={onOpenAddDevice}
            className="h-9 px-3.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('actionAddDevice')}</span>
          </button>
        </div>
      </div>

      {/* Device Cards Grid */}
      {filteredDevices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              drives={drives}
              accessories={accessories}
              onEdit={onEditDevice}
              onDelete={onDeleteDevice}
              onAddDrive={onAddDriveToDevice}
              onAddAccessory={onAddAccessoryToDevice}
              onEditAccessory={onEditAccessory}
              onNavigateToMatrix={onNavigateToMatrix}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white dark:bg-[#18181c] rounded-2xl border border-slate-200 dark:border-[#27272b] p-8">
          <Laptop className="w-12 h-12 text-slate-300 dark:text-[#3f3f46] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-[#d4d4d8]">
            {t('devicesEmptyTitle')}
          </h3>
          <p className="text-xs text-slate-400 dark:text-[#71717a] mt-1 max-w-sm mx-auto">
            {t('devicesEmptyDesc')}
          </p>
          <button
            type="button"
            onClick={onOpenAddDevice}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('actionAddDevice')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

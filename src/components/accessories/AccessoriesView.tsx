import React, { useState, useMemo } from 'react';
import { Search, Plus, Sparkles, Filter } from 'lucide-react';
import { Accessory } from '../../types';
import { useStorage } from '../../context/StorageContext';
import { useLanguage } from '../../context/LanguageContext';
import { AccessoryCard } from './AccessoryCard';
import { DEFAULT_ACCESSORY_CATEGORIES } from '../../data/initialData';
import { getSafeRating } from '../../utils/ratingColors';

interface AccessoriesViewProps {
  onOpenAddAccessory: () => void;
  onEditAccessory: (accessory: Accessory) => void;
  onDeleteAccessory: (accessory: Accessory) => void;
}

export const AccessoriesView: React.FC<AccessoriesViewProps> = ({
  onOpenAddAccessory,
  onEditAccessory,
  onDeleteAccessory,
}) => {
  const { accessories, devices, settings } = useStorage();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name_asc');

  // Categories list from settings and existing accessories
  const availableCategories = useMemo(() => {
    const list = Array.isArray(settings.accessoryCategories) && settings.accessoryCategories.length > 0
      ? settings.accessoryCategories
      : DEFAULT_ACCESSORY_CATEGORIES;
    return Array.from(new Set([...list, ...accessories.map((a) => a.category)].filter(Boolean)));
  }, [settings.accessoryCategories, accessories]);

  const unassignedCount = useMemo(() => {
    return accessories.filter((a) => !a.device || a.device.trim() === '').length;
  }, [accessories]);

  const filteredAccessories = useMemo(() => {
    const list = accessories.filter((acc) => {
      // Category filter
      if (selectedCategory !== 'all' && acc.category !== selectedCategory) {
        return false;
      }

      // Device filter
      if (selectedDevice === '__unassigned__') {
        if (acc.device && acc.device.trim() !== '') return false;
      } else if (selectedDevice !== 'all') {
        if (acc.device !== selectedDevice) return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = acc.name.toLowerCase().includes(q);
        const matchCat = acc.category.toLowerCase().includes(q);
        const matchDesc = (acc.description || '').toLowerCase().includes(q);
        const matchDev = (acc.device || '').toLowerCase().includes(q);
        const matchTags = (acc.tags || []).some((tg) => tg.toLowerCase().includes(q));
        if (!matchName && !matchCat && !matchDesc && !matchDev && !matchTags) {
          return false;
        }
      }

      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (sortBy === 'rating_desc') return getSafeRating(b.rating, 5) - getSafeRating(a.rating, 5);
      if (sortBy === 'rating_asc') return getSafeRating(a.rating, 5) - getSafeRating(b.rating, 5);
      return 0;
    });
  }, [accessories, selectedCategory, selectedDevice, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="space-y-3">
        {/* Row 1: Search Box */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-[#71717a]" />
            <input
              type="text"
              maxLength={80}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('accessoriesSearchPlaceholder')}
              className="w-full h-10 pl-10 pr-4 bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-[#f4f4f5] placeholder:text-slate-400 dark:placeholder:text-[#71717a] focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
            />
          </div>
        </div>

        {/* Row 2: Dropdowns & Action Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 min-w-0">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-9 px-2.5 bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] rounded-xl text-xs font-semibold text-slate-700 dark:text-[#d4d4d8] focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs cursor-pointer truncate"
            >
              <option value="all">{t('accessoriesFilterCategoryAll', { count: availableCategories.length })}</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Device Dropdown */}
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full h-9 px-2.5 bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] rounded-xl text-xs font-semibold text-slate-700 dark:text-[#d4d4d8] focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs cursor-pointer truncate"
            >
              <option value="all">{t('accessoriesFilterDeviceAll', { count: devices.length })}</option>
              {unassignedCount > 0 && (
                <option value="__unassigned__">
                  {t('accessoriesFilterUnassigned', { count: unassignedCount })}
                </option>
              )}
              {devices.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-9 px-2.5 bg-white dark:bg-[#18181c] border border-slate-200 dark:border-[#27272b] rounded-xl text-xs font-semibold text-slate-700 dark:text-[#d4d4d8] focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs cursor-pointer truncate"
            >
              <option value="name_asc">{t('accessoriesSortNameAsc')}</option>
              <option value="name_desc">{t('accessoriesSortNameDesc')}</option>
              <option value="rating_desc">{t('accessoriesSortRatingDesc')}</option>
              <option value="rating_asc">{t('accessoriesSortRatingAsc')}</option>
            </select>
          </div>

          {/* Add Accessory Button */}
          <button
            type="button"
            onClick={onOpenAddAccessory}
            className="h-9 px-3.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('accessoriesBtnAdd')}</span>
          </button>
        </div>
      </div>

      {/* Grid of Accessories */}
      {filteredAccessories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAccessories.map((acc) => (
            <AccessoryCard
              key={acc.id}
              accessory={acc}
              onEdit={onEditAccessory}
              onDelete={onDeleteAccessory}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white dark:bg-[#18181c] rounded-2xl border border-slate-200 dark:border-[#27272b] p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-[#f4f4f5]">
            {t('accessoriesEmptyTitle')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#a1a1aa] max-w-sm mx-auto">
            {t('accessoriesEmptyDesc')}
          </p>
          <button
            type="button"
            onClick={onOpenAddAccessory}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('accessoriesBtnAdd')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

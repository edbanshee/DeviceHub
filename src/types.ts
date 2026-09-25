export type DeviceCategory = string;
export type AccessoryCategory = string;

export interface Device {
  id: string;
  name: string;
  category: DeviceCategory;
  system: string; // OS
  cpu?: string;
  imageUrl?: string;
  notes?: string;
  rating?: number; // 1 to 5 physical condition rating
  isGamingDevice: boolean; // If false: emulation options hidden & excluded from matrix
  emulationOverview?: string;
  emulationScores?: Record<string, number>; // systemId -> 1..5
  createdAt?: string;
  updatedAt?: string;
}

export interface Accessory {
  id: string;
  name: string;
  category: AccessoryCategory;
  description: string;
  tags: string[];
  rating: number; // 1 to 5 physical condition rating
  imageUrl?: string;
  device?: string; // Linked device name or empty/undefined for standalone
  createdAt?: string;
  updatedAt?: string;
}

export type StorageMedium = 'physical' | 'cloud_network';

export type CloudProvider = 
  | 'Google Drive'
  | 'Microsoft OneDrive / 365'
  | 'Dropbox'
  | 'Proton Drive'
  | 'Mega'
  | 'iCloud Drive'
  | 'Nextcloud'
  | 'AWS S3 / Wasabi'
  | 'Local NAS (SMB / NFS)'
  | 'Other';

export interface StorageDrive {
  id: string;
  device?: string; // Linked to Device.name or empty/undefined for standalone/USB drives
  drive: string; // Identifier e.g. 'SSD C:', 'MicroSD 512GB'
  driveType: string;
  label: string;
  capacity: number; // GB
  used: number; // GB
  free: number; // GB
  format: string; // e.g. NTFS, Ext4, exFAT
  tags: string[];
  notes?: string;
  storageMedium: StorageMedium;
  cloudProvider?: CloudProvider | string;
  mountPoint?: string; // e.g. 'G:\', '/mnt/cloud'
  accountEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSettings {
  driveTypes: string[];
  formatOptions: string[];
  deviceCategories: string[];
  accessoryCategories: string[];
  cloudProviders?: string[];
  updatedAt?: string;
}

export type EmulationGroupId = 
  | 'gen2'
  | 'gen3'
  | 'gen4'
  | 'gen5'
  | 'gen6'
  | 'gen7'
  | 'modern'
  | 'arcade_ports';

export interface EmulationGroup {
  id: EmulationGroupId;
  name: { es: string; en: string };
  era: string;
  themeColor: {
    bg: string;
    text: string;
    border: string;
    badge: string;
    pill: string;
  };
}

export interface EmulationSystem {
  id: string;
  name: string;
  shortName: string;
  groupId: EmulationGroupId;
  manufacturer?: string;
  year?: number;
  iconName?: string;
}

export interface StorageExportData {
  app: string;
  version: string;
  exportedAt: string;
  user: string;
  totalDevices: number;
  totalDrives: number;
  totalAccessories?: number;
  devices: Device[];
  drives: StorageDrive[];
  accessories?: Accessory[];
  settings?: {
    driveTypes?: string[];
    formatOptions?: string[];
    deviceCategories?: string[];
    accessoryCategories?: string[];
    cloudProviders?: string[];
  };
}

export type ActiveView = 'devices' | 'accessories' | 'drives' | 'matrix';

export type Language = 'es' | 'en';
export type Theme = 'dark' | 'light' | 'system';

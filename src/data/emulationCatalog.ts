import { EmulationGroup, EmulationSystem } from '../types';

export const EMULATION_GROUPS: EmulationGroup[] = [
  {
    id: 'gen2',
    name: {
      es: '2da Generación / Clásicos Tempranos',
      en: '2nd Gen / Early Consoles',
    },
    era: '1976 - 1983',
    themeColor: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-400/40 dark:border-amber-500/30',
      badge: 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border-amber-300 dark:border-amber-700',
      pill: 'bg-amber-500 text-slate-950',
    },
  },
  {
    id: 'gen3',
    name: {
      es: '8-Bit & Microcomputadoras',
      en: '8-Bit & Microcomputers',
    },
    era: '1983 - 1989',
    themeColor: {
      bg: 'bg-orange-500/10 dark:bg-orange-500/20',
      text: 'text-orange-700 dark:text-orange-300',
      border: 'border-orange-400/40 dark:border-orange-500/30',
      badge: 'bg-orange-100 text-orange-900 dark:bg-orange-950/80 dark:text-orange-200 border-orange-300 dark:border-orange-700',
      pill: 'bg-orange-500 text-white',
    },
  },
  {
    id: 'gen4',
    name: {
      es: '16-Bit & Primeras Portátiles',
      en: '16-Bit & Early Handhelds',
    },
    era: '1987 - 1994',
    themeColor: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-400/40 dark:border-emerald-500/30',
      badge: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
      pill: 'bg-emerald-500 text-white',
    },
  },
  {
    id: 'gen5',
    name: {
      es: '32/64-Bit & Era CD-ROM',
      en: '32/64-Bit & CD-ROM Era',
    },
    era: '1993 - 1999',
    themeColor: {
      bg: 'bg-slate-500/10 dark:bg-slate-500/20',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-400/40 dark:border-slate-500/30',
      badge: 'bg-slate-150 text-slate-900 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600',
      pill: 'bg-slate-600 text-white',
    },
  },
  {
    id: 'gen6',
    name: {
      es: '128-Bit Era & GBA',
      en: '128-Bit Era & GBA',
    },
    era: '1998 - 2005',
    themeColor: {
      bg: 'bg-sky-500/10 dark:bg-sky-500/20',
      text: 'text-sky-700 dark:text-sky-300',
      border: 'border-sky-400/40 dark:border-sky-500/30',
      badge: 'bg-sky-100 text-sky-900 dark:bg-sky-950/80 dark:text-sky-200 border-sky-300 dark:border-sky-700',
      pill: 'bg-sky-500 text-white',
    },
  },
  {
    id: 'gen7',
    name: {
      es: 'Generación HD 2000s & PSP',
      en: '2000s HD Era & PSP',
    },
    era: '2004 - 2012',
    themeColor: {
      bg: 'bg-purple-500/10 dark:bg-purple-500/20',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-400/40 dark:border-purple-500/30',
      badge: 'bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-200 border-purple-300 dark:border-purple-700',
      pill: 'bg-purple-600 text-white',
    },
  },
  {
    id: 'modern',
    name: {
      es: 'Consolas Modernas & Portátiles',
      en: 'Modern Consoles & Handhelds',
    },
    era: '2011 - Presente',
    themeColor: {
      bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-400/40 dark:border-indigo-500/30',
      badge: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700',
      pill: 'bg-indigo-600 text-white',
    },
  },
  {
    id: 'arcade_ports',
    name: {
      es: 'Arcade, Motores & Ports',
      en: 'Arcade, Engines & Ports',
    },
    era: 'Multi-era',
    themeColor: {
      bg: 'bg-teal-500/10 dark:bg-teal-500/20',
      text: 'text-teal-700 dark:text-teal-300',
      border: 'border-teal-400/40 dark:border-teal-500/30',
      badge: 'bg-teal-100 text-teal-900 dark:bg-teal-950/80 dark:text-teal-200 border-teal-300 dark:border-teal-700',
      pill: 'bg-teal-600 text-white',
    },
  },
];

export const EMULATION_SYSTEMS: EmulationSystem[] = [
  // --- Group 1: gen2 (2nd Gen / Early Consoles) ---
  { id: 'Atari 2600', name: 'Atari 2600 (VCS)', shortName: 'A2600', groupId: 'gen2', manufacturer: 'Atari', year: 1977 },
  { id: 'Atari 5200', name: 'Atari 5200 SuperSystem', shortName: 'A5200', groupId: 'gen2', manufacturer: 'Atari', year: 1982 },
  { id: 'Mattel Intellivision', name: 'Mattel Intellivision', shortName: 'Intellivision', groupId: 'gen2', manufacturer: 'Mattel', year: 1979 },
  { id: 'Magnavox Odyssey 2', name: 'Magnavox Odyssey 2', shortName: 'Odyssey 2', groupId: 'gen2', manufacturer: 'Magnavox / Philips', year: 1978 },
  { id: 'Atari 7800', name: 'Atari 7800 ProSystem', shortName: 'A7800', groupId: 'gen2', manufacturer: 'Atari', year: 1986 },
  { id: 'ColecoVision', name: 'ColecoVision', shortName: 'Coleco', groupId: 'gen2', manufacturer: 'Coleco', year: 1982 },

  // --- Group 2: gen3 (8-Bit & Microcomputers) ---
  { id: 'NES', name: 'Nintendo Entertainment System / Famicom', shortName: 'NES', groupId: 'gen3', manufacturer: 'Nintendo', year: 1983 },
  { id: 'Master System / Mark III', name: 'Sega Master System / Mark III', shortName: 'SMS', groupId: 'gen3', manufacturer: 'SEGA', year: 1985 },
  { id: 'SEGA SG-1000', name: 'SEGA SG-1000', shortName: 'SG-1000', groupId: 'gen3', manufacturer: 'SEGA', year: 1983 },
  { id: 'Game & Watch', name: 'Game & Watch', shortName: 'G&W', groupId: 'gen3', manufacturer: 'Nintendo', year: 1980 },
  { id: 'Commodore 64', name: 'Commodore 64', shortName: 'C64', groupId: 'gen3', manufacturer: 'Commodore', year: 1982 },
  { id: 'Sinclair ZX Spectrum', name: 'Sinclair ZX Spectrum', shortName: 'ZX Spectrum', groupId: 'gen3', manufacturer: 'Sinclair', year: 1982 },
  { id: 'Amstrad CPC', name: 'Amstrad CPC', shortName: 'CPC', groupId: 'gen3', manufacturer: 'Amstrad', year: 1984 },
  { id: 'MSX', name: 'MSX / MSX2 Computer', shortName: 'MSX', groupId: 'gen3', manufacturer: 'ASCII / Microsoft', year: 1983 },

  // --- Group 3: gen4 (16-Bit & Early Handhelds) ---
  { id: 'SNES', name: 'Super Nintendo Entertainment System', shortName: 'SNES', groupId: 'gen4', manufacturer: 'Nintendo', year: 1990 },
  { id: 'Genesis / Mega Drive', name: 'Sega Genesis / Mega Drive', shortName: 'Genesis', groupId: 'gen4', manufacturer: 'SEGA', year: 1988 },
  { id: 'Game Boy', name: 'Nintendo Game Boy', shortName: 'GB', groupId: 'gen4', manufacturer: 'Nintendo', year: 1989 },
  { id: 'PC Engine / TurboGrafx-16', name: 'PC Engine / TurboGrafx-16', shortName: 'PCE / TG16', groupId: 'gen4', manufacturer: 'NEC / Hudson', year: 1987 },
  { id: 'PC Engine CD / TurboGrafx-CD', name: 'PC Engine CD-ROM² / TurboGrafx-CD', shortName: 'PCE CD', groupId: 'gen4', manufacturer: 'NEC', year: 1988 },
  { id: 'Neo Geo', name: 'SNK Neo Geo AES / MVS', shortName: 'Neo Geo', groupId: 'gen4', manufacturer: 'SNK', year: 1990 },
  { id: 'Game Gear', name: 'Sega Game Gear', shortName: 'Game Gear', groupId: 'gen4', manufacturer: 'SEGA', year: 1990 },
  { id: 'Atari Lynx', name: 'Atari Lynx', shortName: 'Lynx', groupId: 'gen4', manufacturer: 'Atari', year: 1989 },
  { id: 'SuperGrafx', name: 'PC Engine SuperGrafx', shortName: 'SuperGrafx', groupId: 'gen4', manufacturer: 'NEC', year: 1989 },
  { id: 'SEGA CD', name: 'Sega CD / Mega-CD', shortName: 'Sega CD', groupId: 'gen4', manufacturer: 'SEGA', year: 1991 },
  { id: 'Philips CD-i', name: 'Philips CD-i', shortName: 'CD-i', groupId: 'gen4', manufacturer: 'Philips', year: 1991 },

  // --- Group 4: gen5 (32/64-Bit & CD-ROM Era) ---
  { id: 'PlayStation', name: 'Sony PlayStation (PS1)', shortName: 'PS1', groupId: 'gen5', manufacturer: 'Sony', year: 1994 },
  { id: 'Nintendo 64', name: 'Nintendo 64', shortName: 'N64', groupId: 'gen5', manufacturer: 'Nintendo', year: 1996 },
  { id: 'Saturn', name: 'Sega Saturn', shortName: 'Saturn', groupId: 'gen5', manufacturer: 'SEGA', year: 1994 },
  { id: 'Game Boy Color', name: 'Nintendo Game Boy Color', shortName: 'GBC', groupId: 'gen5', manufacturer: 'Nintendo', year: 1998 },
  { id: '32X', name: 'Sega 32X', shortName: '32X', groupId: 'gen5', manufacturer: 'SEGA', year: 1994 },
  { id: '3DO', name: '3DO Interactive Multiplayer', shortName: '3DO', groupId: 'gen5', manufacturer: 'The 3DO Company', year: 1993 },
  { id: 'Atari Jaguar', name: 'Atari Jaguar', shortName: 'Jaguar', groupId: 'gen5', manufacturer: 'Atari', year: 1993 },
  { id: 'Virtual Boy', name: 'Nintendo Virtual Boy', shortName: 'VB', groupId: 'gen5', manufacturer: 'Nintendo', year: 1995 },
  { id: 'WonderSwan', name: 'Bandai WonderSwan', shortName: 'WonderSwan', groupId: 'gen5', manufacturer: 'Bandai', year: 1999 },
  { id: 'Neo Geo Pocket / Color', name: 'Neo Geo Pocket / Color', shortName: 'NGPC', groupId: 'gen5', manufacturer: 'SNK', year: 1998 },
  { id: 'Sharp X68000', name: 'Sharp X68000', shortName: 'X68000', groupId: 'gen5', manufacturer: 'Sharp', year: 1987 },
  { id: 'PC-98', name: 'NEC PC-9800 Series', shortName: 'PC-98', groupId: 'gen5', manufacturer: 'NEC', year: 1982 },
  { id: 'AMIGA CD32', name: 'Commodore Amiga CD32', shortName: 'Amiga CD32', groupId: 'gen5', manufacturer: 'Commodore', year: 1993 },

  // --- Group 5: gen6 (128-Bit Era & GBA) ---
  { id: 'Dreamcast', name: 'Sega Dreamcast', shortName: 'Dreamcast', groupId: 'gen6', manufacturer: 'SEGA', year: 1998 },
  { id: 'PlayStation 2', name: 'Sony PlayStation 2', shortName: 'PS2', groupId: 'gen6', manufacturer: 'Sony', year: 2000 },
  { id: 'GameCube', name: 'Nintendo GameCube', shortName: 'GameCube', groupId: 'gen6', manufacturer: 'Nintendo', year: 2001 },
  { id: 'Xbox', name: 'Microsoft Xbox', shortName: 'Xbox', groupId: 'gen6', manufacturer: 'Microsoft', year: 2001 },
  { id: 'Game Boy Advance', name: 'Nintendo Game Boy Advance', shortName: 'GBA', groupId: 'gen6', manufacturer: 'Nintendo', year: 2001 },
  { id: 'WonderSwan Color', name: 'Bandai WonderSwan Color', shortName: 'WSC', groupId: 'gen6', manufacturer: 'Bandai', year: 2000 },
  { id: 'Pokemon Mini', name: 'Nintendo Pokémon Mini', shortName: 'PokeMini', groupId: 'gen6', manufacturer: 'Nintendo', year: 2001 },

  // --- Group 6: gen7 (2000s HD Era & PSP) ---
  { id: 'PlayStation 3', name: 'Sony PlayStation 3', shortName: 'PS3', groupId: 'gen7', manufacturer: 'Sony', year: 2006 },
  { id: 'Xbox 360', name: 'Microsoft Xbox 360', shortName: 'X360', groupId: 'gen7', manufacturer: 'Microsoft', year: 2005 },
  { id: 'Wii', name: 'Nintendo Wii', shortName: 'Wii', groupId: 'gen7', manufacturer: 'Nintendo', year: 2006 },
  { id: 'Nintendo DS', name: 'Nintendo DS', shortName: 'NDS', groupId: 'gen7', manufacturer: 'Nintendo', year: 2004 },
  { id: 'PSP', name: 'PlayStation Portable', shortName: 'PSP', groupId: 'gen7', manufacturer: 'Sony', year: 2004 },

  // --- Group 7: modern (Modern Consoles & Handhelds) ---
  { id: 'Nintendo 3DS', name: 'Nintendo 3DS', shortName: '3DS', groupId: 'gen7', manufacturer: 'Nintendo', year: 2011 },
  { id: 'PS Vita', name: 'PlayStation Vita', shortName: 'PS Vita', groupId: 'modern', manufacturer: 'Sony', year: 2011 },
  { id: 'Wii U', name: 'Nintendo Wii U', shortName: 'Wii U', groupId: 'modern', manufacturer: 'Nintendo', year: 2012 },
  { id: 'Nintendo Switch', name: 'Nintendo Switch', shortName: 'Switch', groupId: 'modern', manufacturer: 'Nintendo', year: 2017 },
  { id: 'PlayStation 4', name: 'Sony PlayStation 4', shortName: 'PS4', groupId: 'modern', manufacturer: 'Sony', year: 2013 },
  { id: 'Xbox One', name: 'Microsoft Xbox One', shortName: 'Xbox One', groupId: 'modern', manufacturer: 'Microsoft', year: 2013 },

  // --- Group 8: arcade_ports (Arcade, Engines & Ports) ---
  { id: 'MAME', name: 'MAME (Multiple Arcade Machine Emulator)', shortName: 'MAME', groupId: 'arcade_ports', manufacturer: 'MAME Team', year: 1997 },
  { id: 'CPS', name: 'Capcom Play System (CPS-1/2/3)', shortName: 'CPS 1/2/3', groupId: 'arcade_ports', manufacturer: 'Capcom', year: 1988 },
  { id: 'Neo Geo CD', name: 'SNK Neo Geo CD', shortName: 'Neo Geo CD', groupId: 'arcade_ports', manufacturer: 'SNK', year: 1994 },
  { id: 'FB Neo', name: 'FinalBurn Neo (Arcade)', shortName: 'FB Neo', groupId: 'arcade_ports', manufacturer: 'FB Neo Team', year: 2000 },
  { id: 'PICO-8', name: 'PICO-8 Fantasy Console', shortName: 'PICO-8', groupId: 'arcade_ports', manufacturer: 'Lexaloffle', year: 2015 },
  { id: 'TIC-80', name: 'TIC-80 Tiny Computer', shortName: 'TIC-80', groupId: 'arcade_ports', manufacturer: 'Nesbox', year: 2017 },
  { id: 'ScummVM', name: 'ScummVM (Adventure Game Engine)', shortName: 'ScummVM', groupId: 'arcade_ports', manufacturer: 'ScummVM Team', year: 2001 },
  { id: 'DOS', name: 'MS-DOS / PC Games (DOSBox)', shortName: 'DOS', groupId: 'arcade_ports', manufacturer: 'Microsoft / DOSBox', year: 1981 },
  { id: 'Wolfenstein 3D', name: 'Wolfenstein 3D / ECWolf', shortName: 'Wolf3D', groupId: 'arcade_ports', manufacturer: 'id Software', year: 1992 },
  { id: 'QUAKE', name: 'Quake Engines (Quake 1 / 2 / 3)', shortName: 'Quake', groupId: 'arcade_ports', manufacturer: 'id Software', year: 1996 },
  { id: 'OpenBOR', name: 'OpenBOR (Open Beats of Rage)', shortName: 'OpenBOR', groupId: 'arcade_ports', manufacturer: 'Senile Team / ChronoCrash', year: 2004 },
  { id: 'Ports/Windows', name: 'PortMaster / PC Source Ports', shortName: 'Ports', groupId: 'arcade_ports', manufacturer: 'Community', year: 2020 },
];

export const EMULATION_RATING_DESCRIPTIONS: Record<number, {
  label: { es: string; en: string };
  badgeBg: string;
  textColor: string;
  borderColor: string;
  symbol: string;
}> = {
  1: {
    label: { es: 'Injugable / Errores graves', en: 'Unplayable / Severe Lag' },
    badgeBg: 'bg-rose-100 dark:bg-rose-950/80',
    textColor: 'text-rose-700 dark:text-rose-300',
    borderColor: 'border-rose-300 dark:border-rose-800',
    symbol: '1',
  },
  2: {
    label: { es: 'Lento / Caídas de cuadros', en: 'Slow / Graphic Glitches' },
    badgeBg: 'bg-orange-100 dark:bg-orange-950/80',
    textColor: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-300 dark:border-orange-800',
    symbol: '2',
  },
  3: {
    label: { es: 'Jugable / Aceptable', en: 'Acceptable / Playable' },
    badgeBg: 'bg-amber-100 dark:bg-amber-950/80',
    textColor: 'text-amber-800 dark:text-amber-300',
    borderColor: 'border-amber-300 dark:border-amber-800',
    symbol: '3',
  },
  4: {
    label: { es: 'Muy Bueno / Casi perfecto', en: 'Very Good / Near Perfect' },
    badgeBg: 'bg-lime-100 dark:bg-lime-950/80',
    textColor: 'text-lime-800 dark:text-lime-300',
    borderColor: 'border-lime-300 dark:border-lime-800',
    symbol: '4',
  },
  5: {
    label: { es: 'Velocidad Máxima (60 FPS)', en: 'Full Speed (60 FPS)' },
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80',
    textColor: 'text-emerald-800 dark:text-emerald-300',
    borderColor: 'border-emerald-400 dark:border-emerald-700 font-bold',
    symbol: '5',
  },
};

export const RATING_DESCRIPTIONS: Record<number, string> = {
  1: 'Injugable / Problemas severos o cierres',
  2: 'Lento / Solo con ajustes o salto de fotogramas',
  3: 'Jugable con caídas ocasionales de fotogramas',
  4: 'Muy Bueno / Rendimiento casi perfecto',
  5: 'Excelente / Velocidad Máxima (60 FPS) con reescalado',
};

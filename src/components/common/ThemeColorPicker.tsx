import React from 'react';
import { usePaperContext } from '../../context/PaperContext';
import { AccentColor } from '../../types';
import { Sun, Moon, Check, Palette, Sparkles } from 'lucide-react';

export interface AccentThemeInfo {
  id: AccentColor;
  name: string;
  tamilLabel: string;
  dotColor: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  previewBg: string;
}

export const ACCENT_THEMES: AccentThemeInfo[] = [
  {
    id: 'green',
    name: 'Parrot Green',
    tamilLabel: 'பச்சை (Parrot Green)',
    dotColor: 'bg-lime-500',
    bgColor: 'bg-lime-500/10 dark:bg-lime-500/20',
    textColor: 'text-lime-700 dark:text-lime-400',
    borderColor: 'border-lime-500',
    previewBg: 'bg-gradient-to-r from-lime-500 to-emerald-500',
  },
  {
    id: 'yellow',
    name: 'Sun Yellow',
    tamilLabel: 'மஞ்சள் (Sun Yellow)',
    dotColor: 'bg-amber-400',
    bgColor: 'bg-amber-400/10 dark:bg-amber-400/20',
    textColor: 'text-amber-700 dark:text-amber-400',
    borderColor: 'border-amber-400',
    previewBg: 'bg-gradient-to-r from-amber-400 to-yellow-500',
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    tamilLabel: 'ஊதா (Royal Purple)',
    dotColor: 'bg-purple-500',
    bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
    textColor: 'text-purple-700 dark:text-purple-400',
    borderColor: 'border-purple-500',
    previewBg: 'bg-gradient-to-r from-purple-500 to-indigo-600',
  },
  {
    id: 'rose',
    name: 'Vibrant Rose',
    tamilLabel: 'ரோஸ் (Rose Pink)',
    dotColor: 'bg-rose-500',
    bgColor: 'bg-rose-500/10 dark:bg-rose-500/20',
    textColor: 'text-rose-700 dark:text-rose-400',
    borderColor: 'border-rose-500',
    previewBg: 'bg-gradient-to-r from-rose-500 to-pink-600',
  },
  {
    id: 'cyan',
    name: 'Ocean Cyan',
    tamilLabel: 'நீலம் (Ocean Cyan)',
    dotColor: 'bg-cyan-500',
    bgColor: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    textColor: 'text-cyan-700 dark:text-cyan-400',
    borderColor: 'border-cyan-500',
    previewBg: 'bg-gradient-to-r from-cyan-500 to-blue-600',
  },
  {
    id: 'emerald',
    name: 'IEEE Emerald',
    tamilLabel: 'எமரால்டு (IEEE Emerald)',
    dotColor: 'bg-emerald-600',
    bgColor: 'bg-emerald-600/10 dark:bg-emerald-600/20',
    textColor: 'text-emerald-800 dark:text-emerald-400',
    borderColor: 'border-emerald-600',
    previewBg: 'bg-gradient-to-r from-emerald-600 to-teal-700',
  },
];

interface ThemeColorPickerProps {
  onClose?: () => void;
  compact?: boolean;
}

export const ThemeColorPicker: React.FC<ThemeColorPickerProps> = ({ onClose, compact = false }) => {
  const { theme, toggleTheme, accentColor, setAccentColor } = usePaperContext();

  return (
    <div className="p-4 space-y-4 text-zinc-900 dark:text-zinc-100 font-sans">
      
      {/* Header Title */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-brand-primary" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              UI Theme & Color Palette
            </h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
              Select theme & accent color for entire workspace
            </p>
          </div>
        </div>
      </div>

      {/* Mode Switcher: Dark vs Light */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
          <span>Appearance Mode</span>
          <span className="text-[10px] font-mono uppercase text-brand-primary">
            {theme === 'dark' ? 'Dark Canvas' : 'Light Canvas'}
          </span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              if (theme !== 'light') toggleTheme();
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-amber-50 dark:bg-zinc-800 border-amber-300 dark:border-zinc-600 text-amber-900 dark:text-amber-300 shadow-xs ring-1 ring-amber-400/50'
                : 'bg-zinc-100/60 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Light Mode</span>
          </button>

          <button
            onClick={() => {
              if (theme !== 'dark') toggleTheme();
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-zinc-900 text-zinc-100 border-zinc-700 shadow-xs ring-1 ring-zinc-500'
                : 'bg-zinc-100/60 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-purple-400" />
            <span>Dark Mode</span>
          </button>
        </div>
      </div>

      {/* Color Accent Palette Selection */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-brand-accent" />
            <span>Accent Theme Palette</span>
          </label>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-light text-brand-primary border border-brand-primary">
            {ACCENT_THEMES.find((t) => t.id === accentColor)?.name || 'Custom'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {ACCENT_THEMES.map((item) => {
            const isSelected = accentColor === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setAccentColor(item.id);
                  if (onClose) onClose();
                }}
                className={`
                  relative flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all cursor-pointer
                  ${
                    isSelected
                      ? `${item.bgColor} ${item.borderColor} ring-2 ring-offset-1 dark:ring-offset-zinc-900 ${item.borderColor} shadow-xs font-bold`
                      : 'bg-zinc-50/80 dark:bg-zinc-900/80 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
                  }
                `}
              >
                {/* Color Swatch Circle */}
                <div className={`w-5 h-5 rounded-full ${item.dotColor} shrink-0 flex items-center justify-center shadow-xs`}>
                  {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-bold truncate ${isSelected ? item.textColor : 'text-zinc-800 dark:text-zinc-200'}`}>
                    {item.name}
                  </div>
                  <div className="text-[9px] text-zinc-400 dark:text-zinc-500 truncate font-mono">
                    {item.tamilLabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mini Visual Live Preview Card */}
      <div className="p-3 rounded-xl bg-brand-light border border-brand-primary space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-brand-primary">
          <span>Active Accent Theme Preview</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand-primary text-white font-mono">
            LIVE
          </span>
        </div>
        <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-snug">
          Buttons, active sidebar highlights, badges, progress indicators, and icons automatically mirror this color.
        </p>
      </div>

    </div>
  );
};

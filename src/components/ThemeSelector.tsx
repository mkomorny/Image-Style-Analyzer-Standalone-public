import { useState } from 'react';
import { Palette } from 'lucide-react';
import { cn } from '../lib/utils';

export interface ThemeDef {
  id: string;
  name: string;
  category: string;
  previewGradient: string;
}

export const THEMES: ThemeDef[] = [
  { id: 'cyberpunk', name: 'Cyberpunk', category: 'color', previewGradient: 'linear-gradient(135deg, #05000a, #ff007f)' },
  { id: 'wildfire', name: 'Wildfire', category: 'color', previewGradient: 'linear-gradient(135deg, #070301, #ea580c)' },
  { id: 'synthwave', name: 'Synthwave', category: 'color', previewGradient: 'linear-gradient(135deg, #04010a, #ff007f)' },
  { id: 'electric-lime', name: 'Electric Lime', category: 'color', previewGradient: 'linear-gradient(135deg, #020202, #a3e635)' },
  { id: 'solar-storm', name: 'Solar Storm', category: 'color', previewGradient: 'linear-gradient(135deg, #07050b, #f97316)' },
  { id: 'magma', name: 'Magma', category: 'color', previewGradient: 'linear-gradient(135deg, #050000, #ef4444)' },
  { id: 'laser-tag', name: 'Laser Tag', category: 'color', previewGradient: 'linear-gradient(135deg, #050708, #db2777)' },
  { id: 'acid-jazz', name: 'Acid Jazz', category: 'color', previewGradient: 'linear-gradient(135deg, #020412, #eab308)' },
  { id: 'crimson-void', name: 'Crimson Void', category: 'dark', previewGradient: 'linear-gradient(135deg, #030000, #ff0000)' },
  { id: 'toxic-waste', name: 'Toxic Waste', category: 'color', previewGradient: 'linear-gradient(135deg, #010502, #ccff00)' },
  { id: 'ocean-breeze', name: 'Ocean Breeze', category: 'color', previewGradient: 'linear-gradient(135deg, #010c14, #3b82f6)' },
  { id: 'forest-harmony', name: 'Forest Harmony', category: 'color', previewGradient: 'linear-gradient(135deg, #020d09, #10b981)' },
  { id: 'aurora-dream', name: 'Aurora Dream', category: 'color', previewGradient: 'linear-gradient(135deg, #04020a, #a855f7)' },
  { id: 'cozy-amber', name: 'Cozy Amber', category: 'color', previewGradient: 'linear-gradient(135deg, #0a0501, #d97706)' },
  { id: 'lavender-haze', name: 'Lavender Haze', category: 'color', previewGradient: 'linear-gradient(135deg, #07050d, #c084fc)' },
  { id: 'slate-minimal', name: 'Slate Minimal', category: 'color', previewGradient: 'linear-gradient(135deg, #0b0f19, #475569)' },
  { id: 'desert-dusk', name: 'Desert Dusk', category: 'color', previewGradient: 'linear-gradient(135deg, #0d0603, #f97316)' },
  { id: 'rose-gold', name: 'Rose Gold', category: 'color', previewGradient: 'linear-gradient(135deg, #0d040a, #be185d)' },
  { id: 'mint-chocolate', name: 'Mint Chocolate', category: 'color', previewGradient: 'linear-gradient(135deg, #0c0806, #059669)' },
  { id: 'glacier-hush', name: 'Glacier Hush', category: 'light', previewGradient: 'linear-gradient(135deg, #f0f7ff, #38bdf8)' },
  { id: 'candy-noir', name: 'Candy Noir', category: 'color', previewGradient: 'linear-gradient(135deg, #050308, #ec4899)' },
  { id: 'tropical', name: 'Tropical', category: 'color', previewGradient: 'linear-gradient(135deg, #020b0a, #f97316)' },
  { id: 'aurora', name: 'Aurora', category: 'color', previewGradient: 'linear-gradient(135deg, #040814, #a855f7)' },
  { id: 'solarpunk', name: 'Solarpunk', category: 'color', previewGradient: 'linear-gradient(135deg, #060802, #eab308)' },
  { id: 'vapor', name: 'Vapor', category: 'color', previewGradient: 'linear-gradient(135deg, #0a0314, #38bdf8)' },
  { id: 'ocean', name: 'Ocean', category: 'color', previewGradient: 'linear-gradient(135deg, #010510, #06b6d4)' },
  { id: 'cyber-jade', name: 'Cyber Jade', category: 'color', previewGradient: 'linear-gradient(135deg, #020606, #10b981)' },
  { id: 'blossom', name: 'Blossom', category: 'color', previewGradient: 'linear-gradient(135deg, #fff5f8, #db2777)' },
  { id: 'infrared', name: 'Infrared', category: 'color', previewGradient: 'linear-gradient(135deg, #070000, #ff2b00)' },
  { id: 'psychedelic', name: 'Psychedelic', category: 'color', previewGradient: 'linear-gradient(135deg, #0a0110, #f43f5e)' },
  { id: 'sundial', name: 'Sundial', category: 'light', previewGradient: 'linear-gradient(135deg, #fffbf5, #2563eb)' },
  { id: 'ethereal', name: 'Ethereal', category: 'light', previewGradient: 'linear-gradient(135deg, #fafafc, #a855f7)' },
  { id: 'midnight-abyss', name: 'Midnight Abyss', category: 'dark', previewGradient: 'linear-gradient(135deg, #020205, #7c3aed)' },
  { id: 'coal-dust', name: 'Coal Dust', category: 'dark', previewGradient: 'linear-gradient(135deg, #0d0d0d, #f5f5f5)' },
  { id: 'cyan-crimson', name: 'Cyan Crimson', category: 'contrasting', previewGradient: 'linear-gradient(135deg, #040810, #00ffff)' },
];

export const parseThemeColors = (theme: ThemeDef) => {
  const matches = theme.previewGradient.match(/#[0-9a-fA-F]{3,8}/g);
  let bg = "#050507";
  let accent = "#f59e0b";
  
  if (matches && matches.length >= 2) {
    bg = matches[0];
    accent = matches[1];
  }
  
  const isLight = theme.category === 'light';
  
  return {
    bg,
    accent,
    text: isLight ? '#1c1917' : '#f4f4f5',
    textMuted: isLight ? '#57534e' : '#a1a1aa',
    panelBg: isLight ? 'rgba(255, 255, 255, 0.72)' : 'rgba(9, 9, 12, 0.72)',
    panelBorder: isLight ? 'rgba(28, 25, 23, 0.08)' : 'rgba(255, 255, 255, 0.05)',
    inputBg: isLight ? '#f5f5f4' : '#030304',
    navBg: isLight ? 'rgba(245, 245, 244, 0.93)' : 'rgba(9, 9, 11, 0.83)',
    tagBg: isLight ? 'rgba(28, 25, 23, 0.05)' : 'rgba(255, 255, 255, 0.04)',
    glowColor: isLight ? 'rgba(0,0,0,0.06)' : `${accent}33`,
  };
};

interface ThemeSelectorProps {
  currentTheme: ThemeDef;
  onThemeSelect: (theme: ThemeDef) => void;
}

export function ThemeSelector({ currentTheme, onThemeSelect }: ThemeSelectorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectAndPersistTheme = (theme: ThemeDef) => {
    onThemeSelect(theme);
    localStorage.setItem('isa__theme', theme.id);
    document.documentElement.setAttribute('data-theme', theme.id);
    setDropdownOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="p-1.5 px-2 sm:px-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 active:scale-95 transition-all text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer text-xs"
        id="theme-selector-btn"
      >
        <Palette className="w-3.5 h-3.5 text-amber-500 animate-[pulse_3s_infinite]" />
        <span className="hidden sm:inline font-mono text-[10px] tracking-wider uppercase text-zinc-400">
          {currentTheme.name}
        </span>
      </button>

      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setDropdownOpen(false)} />
          <div
            className="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto rounded-xl border border-white/10 bg-[#0e0e12] p-2 shadow-2xl z-[110] space-y-1"
          >
            <div className="p-2 border-b border-white/5 text-[9px] font-mono uppercase tracking-widest text-zinc-500">
              UI Theme Accent Match
            </div>
            {THEMES.map((theme) => {
              const isSelected = theme.id === currentTheme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => selectAndPersistTheme(theme)}
                  className={cn(
                    "w-full text-left p-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer text-[11px]",
                    isSelected ? "bg-white/10 text-white font-semibold" : "hover:bg-white/5 text-zinc-400"
                  )}
                >
                  <div className="w-3 h-3 rounded-full border border-white/15" style={{ background: theme.previewGradient }} />
                  <span className="truncate">{theme.name}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

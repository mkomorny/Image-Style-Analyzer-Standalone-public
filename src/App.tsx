import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Sparkles,
  Loader2,
  Camera,
  Layers,
  FileText,
  Copy,
  Check,
  Image as ImageIcon,
  Flame,
  Dices,
  Download,
  KeyRound,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from './lib/utils';
import { StyleAnalysis, SampleAesthetic, ExportResponse, ApiKeyConfigResponse } from './types';
import { ThemeSelector, THEMES, parseThemeColors, ThemeDef } from './components/ThemeSelector';
import { ApiKeySetup } from './components/ApiKeySetup';

const ALL_AVAILABLE_AESTHETICS: SampleAesthetic[] = [
  {
    title: 'Cyberpunk Tokyo Rain',
    description: 'Saturated neon glows, wet reflections, and anamorphic flares.',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80',
    result: {
      creativeMedium: 'Anamorphic photorealistic cyber-noir film photography',
      lightingShadows:
        'Moody low-key chiaroscuro lighting intersected by high-contrast neon emission rays; glossy surfaces refracting ambient cyan and magenta glows',
      colorPalette:
        'Hyper-saturated cold-synth duotone with dominant ultraviolet, electric pink, and deep indigo, balanced by toxic teal accents',
      compositionCamera:
        'Low-angle wide perspective shot with shallow depth of field, anamorphic horizontal lens flare, and subtle chromatic outer-frame aberration',
      textureFinish:
        'Dense organic 35mm film grain, atmospheric moisture haze, and soft bloom on lighting sources',
      detailedAesthetic:
        'A deeply gritty yet high-tech nocturnal visual style. Negative spaces are enveloped in velvety shadows, punctuated by sharp, glaring emissions of colored light that bleed into surroundings.',
      styleTemplate:
        'cyberpunk noir film photography, neon pink and ultraviolet lighting, chiaroscuro atmosphere, anamorphic wide-angle shot, wet asphalt reflections, dense 35mm film grain',
    },
  },
  {
    title: 'Warm Hasselblad Vintage',
    description: 'Golden hour haze, soft organic pastels, and creamy analog grain.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    result: {
      creativeMedium: 'Vintage medium-format analog photography',
      lightingShadows:
        'Soft retro-volumetric golden-hour sunlight pouring from a low angle, casting long diffuse shadows.',
      colorPalette:
        'Warm nostalgia-driven analog color charts: muted pastels, sun-baked terracottas, and warm olive-greens.',
      compositionCamera:
        'Classic chest-level portraiture on an 80mm prime lens, creamy bokeh background separation.',
      textureFinish: 'Delicate and organic silver-halide film grain, slightly soft highlight rolls.',
      detailedAesthetic:
        'An intimate, wistful aesthetic that centers around gentle organic warmth. Contrast is intentionally soft and inviting.',
      styleTemplate:
        'vintage Hasselblad medium format photograph, golden hour sunset, warm colors, soft pastels, hazy atmosphere, silver-halide film grain, creamy bokeh',
    },
  },
  {
    title: 'Renaissance Oil Painting',
    description: 'Clear luminous sfumato, rich dramatic shadows, and intricate detail.',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=600&q=80',
    result: {
      creativeMedium: 'Traditional oil on canvas',
      lightingShadows: 'Dramatic chiaroscuro with soft light sources, deep velvet shadows.',
      colorPalette: 'Earthy tones, ochre, rich crimson, burnt sienna, deep umber, and gold accents.',
      compositionCamera: 'Structured classical geometric composition, portrait-focused.',
      textureFinish: 'Rich impasto brush strokes, visible canvas texture, fine glazing.',
      detailedAesthetic:
        'A timeless, classical aesthetic echoing the old masters. Depth is achieved through layered glazing techniques.',
      styleTemplate:
        'Renaissance oil painting, old master style, chiaroscuro lighting, sfumato, rich earthy color palette, detailed textures',
    },
  },
  {
    title: 'Industrial Brutalism',
    description: 'Raw concrete forms, geometric shapes, and stark lighting.',
    imageUrl: 'https://images.unsplash.com/photo-1586738501257-22753443a79d?auto=format&fit=crop&w=600&q=80',
    result: {
      creativeMedium: 'Architectural photography',
      lightingShadows:
        'Hard, high-contrast sunlight casting deep, sharp-edged shadows over concrete textures.',
      colorPalette: 'Monochromatic gradients, varied cool cement grays, minimal contrast accents.',
      compositionCamera: 'Stark, minimalist, focus on strong geometric lines and balance.',
      textureFinish: 'Rough, weathered concrete surfaces, clear sharp edges.',
      detailedAesthetic:
        'A utilitarian, uncompromising aesthetic focusing on function and structure over decoration.',
      styleTemplate:
        'industrial brutalist architecture, raw concrete, minimalist, stark high-contrast lighting, geometric, architectural photography, monochromatic',
    },
  },
  {
    title: 'Ethereal Fashion Editorial',
    description: 'Dreamy lighting, high fashion, and soft cinematic mood.',
    imageUrl: 'https://images.unsplash.com/photo-1496747611176-843277e1d5ce?auto=format&fit=crop&w=600&q=80',
    result: {
      creativeMedium: 'High-end fashion photography',
      lightingShadows: 'Soft, diffused global illumination, gentle highlights, and subtle fill.',
      colorPalette: 'Monochromatic white-on-white, soft silhouettes, delicate neutral shades.',
      compositionCamera: 'Elegant studio lighting, shallow depth-of-field, sharp focus on subject.',
      textureFinish: 'Polished skin tones, soft fabric textures, clean overall finish.',
      detailedAesthetic:
        'A refined, upscale aesthetic focusing on delicacy and poise. Light is treated as a sculptural element framing the subject.',
      styleTemplate:
        'high fashion editorial, ethereal lighting, dreamy mood, soft silhouettes, minimalist studio, sharp focus, clean finish',
    },
  },
];

const SAMPLE_AESTHETICS = ALL_AVAILABLE_AESTHETICS.slice(0, 3);

export default function App() {
  const [isa_file, isa_setFile] = useState<File | null>(null);
  const [isa_aestheticsList, isa_setAestheticsList] = useState<SampleAesthetic[]>(SAMPLE_AESTHETICS);
  const [isa_imagePreview, isa_setImagePreview] = useState<string | null>(null);
  const [isa_isDragging, isa_setIsDragging] = useState(false);
  const [isa_isAnalyzing, isa_setIsAnalyzing] = useState(false);
  const [isa_analysis, isa_setAnalysis] = useState<StyleAnalysis | null>(null);
  const [isa_error, isa_setError] = useState<string | null>(null);
  const [isa_copiedField, isa_setCopiedField] = useState<'detailed' | 'template' | null>(null);
  const [isa_imageErrors, isa_setImageErrors] = useState<Record<string, boolean>>({});
  const [isa_isExporting, isa_setIsExporting] = useState(false);
  const [isa_exportStatus, isa_setExportStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const [isa_apiKeyConfigured, isa_setApiKeyConfigured] = useState(false);
  const [isa_maskedApiKey, isa_setMaskedApiKey] = useState<string | undefined>();
  const [isa_showApiKeyModal, isa_setShowApiKeyModal] = useState(false);
  const [isa_apiKeyCheckDone, isa_setApiKeyCheckDone] = useState(false);

  const [isa_currentTheme, isa_setCurrentTheme] = useState<ThemeDef>(() => {
    const savedThemeId = localStorage.getItem('isa__theme');
    const existing = THEMES.find((t) => t.id === savedThemeId);
    return existing || THEMES[13];
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isa_currentTheme.id);
  }, []);

  const refreshApiKeyStatus = async () => {
    try {
      const response = await fetch('/api/config/api-key');
      const data = (await response.json()) as ApiKeyConfigResponse;
      isa_setApiKeyConfigured(data.configured);
      isa_setMaskedApiKey(data.masked);
      return data;
    } catch {
      isa_setApiKeyConfigured(false);
      isa_setMaskedApiKey(undefined);
      return { configured: false } as ApiKeyConfigResponse;
    }
  };

  useEffect(() => {
    refreshApiKeyStatus().then((data) => {
      if (!data.configured) {
        isa_setShowApiKeyModal(true);
      }
      isa_setApiKeyCheckDone(true);
    });
  }, []);

  useEffect(() => {
    const colors = parseThemeColors(isa_currentTheme);
    const root = document.documentElement;
    root.style.setProperty('--theme-bg', colors.bg);
    root.style.setProperty('--theme-accent', colors.accent);
    root.style.setProperty('--theme-accent-glow', colors.accent + '33');
    root.style.setProperty('--theme-text', colors.text);
    root.style.setProperty('--theme-text-muted', colors.textMuted);
    root.style.setProperty('--theme-panel-bg', colors.panelBg);
    root.style.setProperty('--theme-panel-border', colors.panelBorder);
    root.style.setProperty('--theme-input-bg', colors.inputBg);
    root.style.setProperty('--theme-nav-bg', colors.navBg);
    root.style.setProperty('--theme-tag-bg', colors.tagBg);
  }, [isa_currentTheme]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    isa_setIsDragging(true);
  };

  const handleDragLeave = () => {
    isa_setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    isa_setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type.startsWith('image/')) {
        isa_setFile(selectedFile);
        const objectUrl = URL.createObjectURL(selectedFile);
        isa_setImagePreview(objectUrl);
        const updated = { ...isa_imageErrors };
        delete updated[objectUrl];
        isa_setImageErrors(updated);
      } else {
        isa_setError('Please select a valid image file type.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      isa_setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      isa_setImagePreview(objectUrl);
      const updated = { ...isa_imageErrors };
      delete updated[objectUrl];
      isa_setImageErrors(updated);
    }
  };

  const handleSelectSample = (sample: SampleAesthetic) => {
    isa_setFile(null);
    isa_setImagePreview(sample.imageUrl);
    isa_setAnalysis(sample.result);
    isa_setError(null);
    const updated = { ...isa_imageErrors };
    delete updated[sample.imageUrl];
    isa_setImageErrors(updated);
  };

  const handleRollRandomAesthetics = () => {
    const list = [...ALL_AVAILABLE_AESTHETICS];
    const randomized = list.sort(() => 0.5 - Math.random());
    isa_setAestheticsList(randomized.slice(0, 3));
  };

  const handleAnalyze = async () => {
    if (!isa_file) {
      isa_setError('Please select an image file to analyze first.');
      return;
    }

    isa_setIsAnalyzing(true);
    isa_setError(null);
    isa_setAnalysis(null);

    const formData = new FormData();
    formData.append('image', isa_file);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          isa_setApiKeyConfigured(false);
          isa_setShowApiKeyModal(true);
        }
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      if (data.success && data.analysis) {
        isa_setAnalysis(data.analysis);
        if (data.imagePreview) {
          isa_setImagePreview(data.imagePreview);
        }
      } else {
        throw new Error('Analysis failed or returned an invalid response.');
      }
    } catch (err: unknown) {
      console.error('Front-end analysis error:', err);
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during analysis.';
      isa_setError(message);
    } finally {
      isa_setIsAnalyzing(false);
    }
  };

  const handleExportAnalysis = async () => {
    if (!isa_analysis) return;

    isa_setIsExporting(true);
    isa_setExportStatus(null);

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis: isa_analysis,
          imageName: isa_file?.name,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as ExportResponse & { error?: string };

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Export failed.');
      }

      const action = data.appended
        ? `Appended entry #${data.entryNumber}`
        : `Created master file (entry #${data.entryNumber})`;

      isa_setExportStatus({
        success: true,
        msg: data.openedInExplorer
          ? `${action} and opened in File Explorer:\n${data.filePath}`
          : `${action}:\n${data.filePath}`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to export analysis.';
      isa_setExportStatus({ success: false, msg: message });
    } finally {
      isa_setIsExporting(false);
      setTimeout(() => isa_setExportStatus(null), 8000);
    }
  };

  const copyToClipboard = (text: string, field: 'detailed' | 'template') => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        isa_setCopiedField(field);
        setTimeout(() => isa_setCopiedField(null), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy text:', err);
      });
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#e4e4e7] font-sans flex flex-col overflow-x-hidden selection:bg-amber-500/20 selection:text-amber-400">
      {isa_apiKeyCheckDone && (
        <ApiKeySetup
          open={isa_showApiKeyModal}
          required={!isa_apiKeyConfigured}
          maskedKey={isa_maskedApiKey}
          onClose={() => isa_setShowApiKeyModal(false)}
          onSaved={() => {
            void refreshApiKeyStatus();
          }}
        />
      )}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse duration-[8000ms]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <nav className="border-b border-white/5 flex flex-row items-center justify-between px-2 sm:px-6 h-16 bg-[#09090b]/80 backdrop-blur-md shrink-0 sticky top-0 z-50 gap-1.5 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-tr from-amber-600 to-amber-400 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0">
            <Sparkles className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-black lifestyle stroke-[2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold tracking-wide text-xs sm:text-base text-white truncate max-w-[110px] sm:max-w-none">
              Image Style Analyzer
            </span>
            <span className="text-[7px] sm:text-[9px] text-zinc-500 tracking-widest uppercase font-mono mt-0.5 truncate max-w-[110px] sm:max-w-none">
              Local · Powered by Grok
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => isa_setShowApiKeyModal(true)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer shrink-0',
              isa_apiKeyConfigured
                ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/15 animate-pulse',
            )}
            title={isa_apiKeyConfigured ? 'Update xAI API key' : 'Enter xAI API key'}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isa_apiKeyConfigured ? 'API Key' : 'Set API Key'}</span>
          </button>
          <ThemeSelector currentTheme={isa_currentTheme} onThemeSelect={isa_setCurrentTheme} />
        </div>
      </nav>

      <div className="flex flex-1 flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 lg:p-6 gap-6 min-h-0">
        <div className="w-full lg:w-[420px] shrink-0 flex flex-col gap-6">
          <div
            className="panel-glass rounded-2xl p-5 flex flex-col gap-4 shadow-xl transition-all duration-300"
            style={
              isa_currentTheme.id === 'laser-tag'
                ? {
                    borderColor: 'rgba(255, 95, 31, 0.45)',
                    boxShadow: '0 0 20px rgba(255, 95, 31, 0.15), inset 0 0 12px rgba(255, 95, 31, 0.05)',
                    backgroundColor: 'rgba(18, 9, 5, 0.8)',
                  }
                : undefined
            }
          >
            <div className="flex justify-between items-center">
              <h3
                className="text-[11px] uppercase tracking-wider font-semibold font-display flex items-center gap-1.5 font-sans"
                style={{
                  color: isa_currentTheme.id === 'laser-tag' ? '#ff5f1f' : 'var(--theme-accent, #f59e0b)',
                }}
              >
                {isa_file ? <Camera className="w-3.5 h-3.5" /> : <UploadCloud className="w-3.5 h-3.5" />}
                Source Image
              </h3>
              {isa_file && (
                <button
                  onClick={() => {
                    isa_setFile(null);
                    isa_setImagePreview(SAMPLE_AESTHETICS[0].imageUrl);
                    isa_setAnalysis(SAMPLE_AESTHETICS[0].result);
                    isa_setError(null);
                  }}
                  className="text-zinc-500 hover:text-red-400 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                >
                  Clear Image
                </button>
              )}
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'relative h-[250px] rounded-xl border border-dashed flex flex-col items-center justify-center p-4 transition-all duration-300 select-none cursor-pointer overflow-hidden',
                isa_isDragging
                  ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                  : 'border-white/10 bg-zinc-950/40 hover:border-white/20',
              )}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />

              {isa_imagePreview ? (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/50 group">
                  {isa_imageErrors[isa_imagePreview] ? (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-[#0b0b0d] flex flex-col items-center justify-center p-6 text-center select-none relative">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06)_0,transparent_100%)]"></div>
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-2.5 relative z-10 shadow-[0_0_15px_rgba(245,158,11,0.08)]">
                        <ImageIcon className="w-5 h-5 text-amber-500/80" />
                      </div>
                      <span
                        style={{ fontFamily: 'system-ui' }}
                        className="text-xs font-semibold text-zinc-200 block uppercase tracking-wider mb-1 relative z-10"
                      >
                        Selected Image
                      </span>
                      <span className="text-[10px] text-zinc-500 max-w-[280px] leading-relaxed relative z-10">
                        Direct link restricted, but style details are fully loaded below.
                      </span>
                    </div>
                  ) : (
                    <img
                      referrerPolicy="no-referrer"
                      src={isa_imagePreview}
                      alt="Active Preview"
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                      onError={() => {
                        const updated = { ...isa_imageErrors };
                        updated[isa_imagePreview || ''] = true;
                        isa_setImageErrors(updated);
                      }}
                    />
                  )}

                  {isa_isAnalyzing && (
                    <div className="absolute inset-x-0 h-1 bg-amber-500 shadow-[0_0_10px_#f59e0b] animate-[bounce_3s_infinite]" />
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="text-[10px] font-mono font-bold tracking-wider text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all"
                    >
                      UPLOAD NEW IMAGE
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto shadow-inner">
                    <UploadCloud className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="text-[10px] font-mono font-bold tracking-wider text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all"
                    >
                      UPLOAD NEW IMAGE
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!isa_file || isa_isAnalyzing}
              style={{ fontFamily: 'system-ui' }}
              className={cn(
                'w-full py-3 px-4 rounded-xl text-xs font-bold tracking-widest transition-all duration-300 select-none border shadow-md flex items-center justify-center gap-2 cursor-pointer',
                !isa_file
                  ? 'bg-white/5 border-white/5 text-zinc-500 cursor-not-allowed'
                  : isa_isAnalyzing
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 cursor-wait'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black border-amber-400 hover:from-amber-400 hover:to-amber-500',
              )}
            >
              {isa_isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  ANALYZING STYLE...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  ANALYZE STYLE
                </>
              )}
            </button>

            {isa_error && (
              <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-xs text-red-400 font-mono flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0 animate-ping"></span>
                <div className="break-all whitespace-pre-wrap">
                  <span className="font-bold uppercase tracking-wider block text-[10px]">Processing Error:</span>
                  {isa_error}
                </div>
              </div>
            )}
          </div>

          <div
            className="panel-glass rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300"
            style={
              isa_currentTheme.id === 'laser-tag'
                ? {
                    borderColor: 'rgba(173, 0, 255, 0.45)',
                    boxShadow: '0 0 20px rgba(173, 0, 255, 0.15), inset 0 0 12px rgba(173, 0, 255, 0.05)',
                    backgroundColor: 'rgba(11, 4, 18, 0.8)',
                  }
                : undefined
            }
          >
            <div className="flex items-center justify-between">
              <h3
                className="text-[11px] uppercase tracking-wider font-semibold font-display"
                style={{
                  color: isa_currentTheme.id === 'laser-tag' ? '#ad00ff' : 'var(--theme-text-muted, #a1a1aa)',
                  fontFamily: 'system-ui',
                }}
              >
                Style Presets
              </h3>
              <button
                type="button"
                onClick={handleRollRandomAesthetics}
                className="px-2 py-1 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 text-amber-500 hover:bg-amber-500/20 active:scale-95 text-[10px] font-mono tracking-widest uppercase rounded-lg transition-all cursor-pointer select-none"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>Roll</span>
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 leading-normal">
              Click a sample below to instantly load its art style profile:
            </p>

            <div className="space-y-2 mt-2">
              {isa_aestheticsList.map((sample, idx) => {
                const isActive = isa_imagePreview === sample.imageUrl;
                return (
                  <div
                    key={idx}
                    className={cn(
                      'rounded-xl border transition-all duration-350 overflow-hidden',
                      isActive
                        ? 'bg-amber-500/5 border-amber-500/30 shadow-lg'
                        : 'bg-zinc-950/20 border-white/5 hover:border-white/15',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectSample(sample)}
                      className="w-full text-left p-3.5 flex flex-col justify-center gap-1.5 cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          style={{ fontFamily: 'system-ui' }}
                          className={cn(
                            'text-xs font-bold tracking-wide transition-colors',
                            isActive ? 'text-amber-400' : 'text-white',
                          )}
                        >
                          {sample.title}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5">
                          {isActive ? 'Active' : 'Open'}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{sample.description}</p>
                    </button>

                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="border-t border-white/5 bg-zinc-950/50"
                        >
                          <div className="p-3.5 text-[11px] space-y-3">
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-amber-500/80 uppercase tracking-wider block">
                                Art Style Description:
                              </span>
                              <p className="text-zinc-300 leading-relaxed font-sans bg-zinc-950/50 p-2.5 rounded border border-white/5">
                                {sample.result.detailedAesthetic}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">
                                Style Prompt Tags:
                              </span>
                              <p className="text-zinc-400 font-mono text-[10px] break-all bg-zinc-950/20 p-2 rounded">
                                {sample.result.styleTemplate}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <AnimatePresence mode="wait">
            {!isa_analysis && !isa_isAnalyzing ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="panel-glass rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full border border-dashed border-zinc-800 flex items-center justify-center bg-zinc-900/60 shadow-inner">
                  <ImageIcon className="w-6 h-6 text-zinc-650 animate-pulse" />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-sm font-display tracking-wider uppercase text-white font-semibold flex items-center gap-1">
                    Ready to Analyze Image Styles
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Upload a photo or select an example image. Grok will break down lighting, composition,
                    colors, and art styles while ignoring any specific subjects.
                  </p>
                </div>
              </motion.div>
            ) : isa_isAnalyzing ? (
              <motion.div
                key="analyzing-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="panel-glass rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center space-y-6"
              >
                <div className="w-20 h-20 relative flex items-center justify-center">
                  <div className="absolute inset-0 border border-amber-500/20 rounded-full animate-ping duration-[3000ms]"></div>
                  <div className="absolute inset-2 border border-amber-500/10 rounded-full animate-pulse"></div>
                  <div className="w-10 h-10 border-2 border-dashed border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="max-w-sm space-y-2">
                  <h3 className="text-xs font-mono tracking-widest uppercase text-amber-500 font-bold">
                    ANALYZING ART AND STYLE ELEMENTS...
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Examining image characteristics. Evaluating color temperatures, lighting angles, digital
                    finish, and overall composition...
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="analysis-results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-6"
              >
                <div className="panel-glass rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-emerald-500/15">
                  <div className="space-y-1">
                    <h3 className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400 font-display">
                      Export Analysis
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-mono leading-relaxed max-w-md">
                      Appends this analysis to one master .txt file (all exports combined) and opens it in File Explorer.
                    </p>
                  </div>
                  <div className="flex flex-col items-stretch sm:items-end gap-2">
                    <button
                      type="button"
                      onClick={handleExportAnalysis}
                      disabled={isa_isExporting}
                      className={cn(
                        'px-4 py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase border flex items-center justify-center gap-2 transition-all cursor-pointer',
                        isa_isExporting
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 cursor-wait'
                          : 'bg-emerald-600/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/25 hover:text-emerald-300',
                      )}
                    >
                      {isa_isExporting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          Export .txt
                        </>
                      )}
                    </button>
                    {isa_exportStatus && (
                      <span
                        className={cn(
                          'text-[10px] font-mono whitespace-pre-wrap text-right max-w-md break-all',
                          isa_exportStatus.success ? 'text-emerald-400' : 'text-red-400',
                        )}
                      >
                        {isa_exportStatus.msg}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/export/open-folder', { method: 'POST' });
                          const data = await res.json().catch(() => ({}));
                          if (!res.ok) throw new Error(data.error || 'Could not open folder.');
                          isa_setExportStatus({
                            success: true,
                            msg: data.openedInExplorer
                              ? `Opened folder:\n${data.exportDir}`
                              : `Outputs folder:\n${data.exportDir}`,
                          });
                          setTimeout(() => isa_setExportStatus(null), 6000);
                        } catch (err: unknown) {
                          const message = err instanceof Error ? err.message : 'Could not open folder.';
                          isa_setExportStatus({ success: false, msg: message });
                          setTimeout(() => isa_setExportStatus(null), 6000);
                        }
                      }}
                      className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      Open Outputs Folder
                    </button>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div
                    className="panel-glass rounded-2xl p-5 shadow-lg flex flex-col gap-4 relative overflow-hidden group transition-all duration-300"
                    style={
                      isa_currentTheme.id === 'laser-tag'
                        ? {
                            borderColor: 'rgba(0, 240, 255, 0.45)',
                            boxShadow: '0 0 20px rgba(0, 240, 255, 0.15), inset 0 0 12px rgba(0, 240, 255, 0.05)',
                            backgroundColor: 'rgba(4, 14, 16, 0.8)',
                          }
                        : { borderColor: 'rgba(245, 158, 11, 0.1)' }
                    }
                  >
                    <div
                      className="absolute top-0 right-0 w-32 h-32 blur-4xl rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-[4000ms]"
                      style={{
                        backgroundColor:
                          isa_currentTheme.id === 'laser-tag' ? 'rgba(0, 240, 255, 0.06)' : 'rgba(245, 158, 11, 0.02)',
                      }}
                    ></div>

                    <div className="flex justify-between items-center shrink-0 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <FileText
                          className="w-4 h-4"
                          style={{
                            color: isa_currentTheme.id === 'laser-tag' ? '#00f0ff' : 'var(--theme-accent, #f59e0b)',
                          }}
                        />
                        <h4
                          className="text-xs font-display font-semibold uppercase tracking-wider text-[#f4f4f5]"
                          style={{ color: isa_currentTheme.id === 'laser-tag' ? '#00f0ff' : undefined }}
                        >
                          Detailed Art Style Description
                        </h4>
                      </div>
                      <button
                        onClick={() => copyToClipboard(isa_analysis!.detailedAesthetic, 'detailed')}
                        className="text-zinc-500 hover:text-amber-400 p-1.5 hover:bg-white/5 rounded-lg transition-all duration-200 cursor-pointer"
                        title="Copy complete detailed description"
                      >
                        {isa_copiedField === 'detailed' ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="overflow-y-auto max-h-[220px]">
                      <div className="text-xs text-zinc-300 leading-relaxed font-sans bg-zinc-950/60 p-4 rounded-xl border border-white/5 min-h-[160px] whitespace-pre-line">
                        {isa_analysis?.detailedAesthetic}
                      </div>
                    </div>

                    <div className="text-[10px] text-zinc-500 font-mono uppercase bg-zinc-900/30 px-2 py-1 rounded inline-flex self-start border border-white/5">
                      Style & Vibe
                    </div>
                  </div>

                  <div
                    className="panel-glass rounded-2xl p-5 shadow-lg flex flex-col gap-4 relative overflow-hidden group transition-all duration-300"
                    style={
                      isa_currentTheme.id === 'laser-tag'
                        ? {
                            borderColor: 'rgba(255, 0, 127, 0.45)',
                            boxShadow: '0 0 20px rgba(255, 0, 127, 0.15), inset 0 0 12px rgba(255, 0, 127, 0.05)',
                            backgroundColor: 'rgba(18, 4, 11, 0.8)',
                          }
                        : { borderColor: 'rgba(249, 115, 22, 0.1)' }
                    }
                  >
                    <div
                      className="absolute top-0 right-0 w-32 h-32 blur-4xl rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-[4000ms]"
                      style={{
                        backgroundColor:
                          isa_currentTheme.id === 'laser-tag' ? 'rgba(255, 0, 127, 0.06)' : 'rgba(249, 115, 22, 0.02)',
                      }}
                    ></div>

                    <div className="flex justify-between items-center shrink-0 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <Flame
                          className="w-4 h-4"
                          style={{
                            color: isa_currentTheme.id === 'laser-tag' ? '#ff007f' : 'rgb(249, 115, 22)',
                          }}
                        />
                        <h4
                          className="text-xs font-display font-semibold uppercase tracking-wider text-[#f4f4f5]"
                          style={{ color: isa_currentTheme.id === 'laser-tag' ? '#ff007f' : undefined }}
                        >
                          AI Prompt Assistant (Style Only)
                        </h4>
                      </div>
                      <button
                        onClick={() => copyToClipboard(isa_analysis!.styleTemplate, 'template')}
                        className="text-zinc-500 hover:text-amber-400 p-1.5 hover:bg-white/5 rounded-lg transition-all duration-200 cursor-pointer"
                        title="Copy prompt modifier tags"
                      >
                        {isa_copiedField === 'template' ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="overflow-y-auto max-h-[220px]">
                      <div
                        className="text-xs leading-relaxed p-4 rounded-xl min-h-[160px] select-all whitespace-normal transition-all duration-300"
                        style={{
                          color: isa_currentTheme.id === 'laser-tag' ? '#ff007f' : 'var(--theme-accent, #f59e0b)',
                          backgroundColor:
                            isa_currentTheme.id === 'laser-tag' ? 'rgba(255, 0, 127, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                          borderColor:
                            isa_currentTheme.id === 'laser-tag' ? 'rgba(255, 0, 127, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                          borderWidth: '1px',
                          fontFamily: 'system-ui',
                        }}
                      >
                        {isa_analysis?.styleTemplate}
                      </div>
                    </div>

                    <div className="text-[10px] text-zinc-500 font-mono uppercase bg-zinc-900/30 px-2 py-1 rounded inline-flex self-start border border-white/5">
                      Ready to use in prompt generators
                    </div>
                  </div>
                </div>

                <div
                  className="panel-glass rounded-2xl p-5 shadow-lg transition-all duration-300"
                  style={
                    isa_currentTheme.id === 'laser-tag'
                      ? {
                          borderColor: 'rgba(57, 255, 20, 0.45)',
                          boxShadow: '0 0 20px rgba(57, 255, 20, 0.15), inset 0 0 12px rgba(57, 255, 20, 0.05)',
                          backgroundColor: 'rgba(6, 16, 6, 0.8)',
                        }
                      : undefined
                  }
                >
                  <h3
                    className="text-[11px] uppercase tracking-wider font-semibold font-display border-b border-white/5 pb-3 mb-4 flex items-center gap-1.5"
                    style={{
                      color: isa_currentTheme.id === 'laser-tag' ? '#39ff14' : 'var(--theme-text-muted, #a1a1aa)',
                      fontFamily: 'system-ui',
                    }}
                  >
                    <Layers
                      className="w-3.5 h-3.5"
                      style={{
                        color: isa_currentTheme.id === 'laser-tag' ? '#39ff14' : 'var(--theme-text-muted, #71717a)',
                      }}
                    />
                    Art & Design Breakdown
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <div className="bg-[#0b0b0e] border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 block">
                        Artistic Medium
                      </span>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">{isa_analysis?.creativeMedium}</p>
                    </div>

                    <div className="bg-[#0b0b0e] border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 block">
                        Lighting & Shadow Style
                      </span>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">{isa_analysis?.lightingShadows}</p>
                    </div>

                    <div className="bg-[#0b0b0e] border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 block">
                        Color Palette & Mood
                      </span>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">{isa_analysis?.colorPalette}</p>
                    </div>

                    <div className="bg-[#0b0b0e] border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 block">
                        Camera Composition & Angle
                      </span>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">{isa_analysis?.compositionCamera}</p>
                    </div>

                    <div className="bg-[#0b0b0e] border border-white/5 rounded-xl p-4 flex flex-col gap-2 sm:col-span-2 md:col-span-2">
                      <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 block">
                        Atmospheric Texture & Finish
                      </span>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">{isa_analysis?.textureFinish}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <footer className="border-t border-white/5 bg-[#09090b]/90 backdrop-blur-md p-4 mt-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span>Image Style Analyzer</span>
          <span className="text-emerald-500/80">Unlimited local use</span>
        </div>
      </footer>
    </div>
  );
}
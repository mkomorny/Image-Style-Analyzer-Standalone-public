import React, { useEffect, useState } from 'react';
import { KeyRound, Loader2, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface ApiKeySetupProps {
  open: boolean;
  required: boolean;
  maskedKey?: string;
  onClose: () => void;
  onSaved: () => void;
}

export function ApiKeySetup({ open, required, maskedKey, onClose, onSaved }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setApiKey('');
      setError(null);
      setShowKey(false);
    }
  }, [open]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setError('Please enter your xAI API key.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/config/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: trimmed }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save API key.');
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save API key.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={required ? undefined : onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="panel-glass w-full max-w-md rounded-2xl p-6 shadow-2xl border border-amber-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                <KeyRound className="w-5 h-5 text-black" />
              </div>
              <div>
                <h2 className="text-sm font-display font-bold tracking-wide text-white">
                  {required ? 'Connect Your xAI API Key' : 'Update API Key'}
                </h2>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-0.5">
                  Required for Grok image analysis
                </p>
              </div>
            </div>

            {required && (
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Enter your xAI API key to analyze image styles. Your key is stored locally on this
                computer and is never sent anywhere except the xAI API.
              </p>
            )}

            {maskedKey && !required && (
              <p className="text-[11px] text-zinc-500 font-mono mb-4">
                Current key: <span className="text-zinc-300">{maskedKey}</span>
              </p>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="xai-api-key"
                  className="text-[10px] uppercase tracking-wider font-mono text-zinc-500 block"
                >
                  xAI API Key
                </label>
                <div className="relative">
                  <input
                    id="xai-api-key"
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="xai-..."
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-zinc-200 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    aria-label={showKey ? 'Hide API key' : 'Show API key'}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <a
                href="https://console.x.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] text-amber-500/80 hover:text-amber-400 font-mono transition-colors"
              >
                Get an API key from console.x.ai
                <ExternalLink className="w-3 h-3" />
              </a>

              {error && (
                <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-xs text-red-400 font-mono">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                {!required && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 px-4 rounded-xl text-[10px] font-bold tracking-widest uppercase border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSaving}
                  className={cn(
                    'py-2.5 px-4 rounded-xl text-[10px] font-bold tracking-widest uppercase border flex items-center justify-center gap-2 transition-all cursor-pointer',
                    required ? 'w-full' : 'flex-1',
                    isSaving
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 cursor-wait'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black border-amber-400 hover:from-amber-400 hover:to-amber-500',
                  )}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save & Continue'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
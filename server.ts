import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import dotenv from 'dotenv';

const APP_ROOT = process.env.APP_ROOT || process.cwd();

function getEnvFilePath(): string {
  if (process.env.ELECTRON_USER_DATA) {
    return path.join(process.env.ELECTRON_USER_DATA, '.env');
  }
  return path.join(APP_ROOT, '.env');
}

function loadEnvFiles() {
  if (process.env.ELECTRON_USER_DATA) {
    dotenv.config({ path: path.join(process.env.ELECTRON_USER_DATA, '.env') });
  }
  dotenv.config({ path: path.join(APP_ROOT, '.env') });
}

loadEnvFiles();

function getApiKey(): string {
  return process.env.XAI_API_KEY?.trim() || '';
}

function maskApiKey(key: string): string {
  if (key.length <= 8) return '••••••••';
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}

function readEnvFile(): string {
  const envPath = getEnvFilePath();
  if (!fs.existsSync(envPath)) return '';
  return fs.readFileSync(envPath, 'utf8');
}

function updateEnvVariable(name: string, value: string): void {
  const envPath = getEnvFilePath();
  fs.mkdirSync(path.dirname(envPath), { recursive: true });

  let content = readEnvFile();
  const lineRegex = new RegExp(`^${name}=.*$`, 'm');

  if (lineRegex.test(content)) {
    content = content.replace(lineRegex, `${name}=${value}`);
  } else if (content.length > 0) {
    content = `${content.trimEnd()}\n${name}=${value}\n`;
  } else {
    content = `${name}=${value}\n`;
  }

  fs.writeFileSync(envPath, content, 'utf8');
  process.env[name] = value;
}

async function validateApiKey(apiKey: string): Promise<void> {
  const response = await fetch('https://api.x.ai/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string | { message?: string };
    };
    const apiError = payload.error;
    const detail =
      typeof apiError === 'string'
        ? apiError
        : apiError?.message || `Invalid API key (${response.status})`;
    throw new Error(detail);
  }
}

const PORT = Number(process.env.PORT) || 3000;
const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';
const DEFAULT_EXPORT_DIR =
  process.env.EXPORT_OUTPUT_DIR ||
  'C:\\Users\\<you>\\Documents\\Mirror\\My Apps\\Image Style Analyzer\\Image Style Analyzer OUTPUTS';
const MASTER_EXPORT_FILE =
  process.env.EXPORT_MASTER_FILE || 'Image Style Analyzer - All Exports.txt';

const STYLE_ANALYSIS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    creativeMedium: {
      type: 'string',
      description:
        'The visual medium used e.g. digital vector, retro analog 35mm photography, matte graphic novel illustration.',
    },
    lightingShadows: {
      type: 'string',
      description:
        'Quality of illumination, direction, highlights, shadows, and contrast.',
    },
    colorPalette: {
      type: 'string',
      description: 'Dominant colors, accents, tones, temperature, and saturation.',
    },
    compositionCamera: {
      type: 'string',
      description: 'Camera lens specs, focal length, angle, composition, framing, and depth of field.',
    },
    textureFinish: {
      type: 'string',
      description: 'Finishing texture details, grain, rendering style, and brush strokes.',
    },
    detailedAesthetic: {
      type: 'string',
      description:
        'Detailed analysis of emotional and artistic atmosphere with no mention of subjects, scenes, or events.',
    },
    styleTemplate: {
      type: 'string',
      description:
        'A reusable comma-separated style modifier prompt that is strictly subject-agnostic.',
    },
  },
  required: [
    'creativeMedium',
    'lightingShadows',
    'colorPalette',
    'compositionCamera',
    'textureFinish',
    'detailedAesthetic',
    'styleTemplate',
  ],
  additionalProperties: false,
} as const;

const SYSTEM_INSTRUCTION =
  'You are an elite Director of Photography, Art Historian, and Visual Style Extraction Expert.\n' +
  'Analyze the aesthetic and technical style of the uploaded image and extract its properties into a structured JSON format.\n' +
  'CRITICAL INSTRUCTION: Under absolutely NO circumstances should you describe, label, or mention the actual subject matter, objects, people, animals, or scene in the image. ' +
  'Do not mention what the objects are, what is happening, where it takes place, or any semantic labels of the content. ' +
  'Focus 100% EXCLUSIVELY on the pure, raw visual style, artistic medium, lens/camera attributes, color grading, brushwork, light qualities, and composition. ' +
  "Your analysis must be completely 'subject-blind' so that the extracted style profile can be applied as a template to any other prompt.";

const USER_PROMPT =
  'Deconstruct the style of this image. Extract detailed information for each stylistic field in the schema. ' +
  "Do not mention the subject in any field. For example, do not say 'a retro style picture of a woman sitting on a chair', " +
  "say 'retro editorial photography style, warm split-toned lighting, low frame composition'.";

interface StyleAnalysis {
  creativeMedium: string;
  lightingShadows: string;
  colorPalette: string;
  compositionCamera: string;
  textureFinish: string;
  detailedAesthetic: string;
  styleTemplate: string;
}

interface GrokChatResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
}

function getExportDir(): string {
  return path.resolve(DEFAULT_EXPORT_DIR);
}

function getMasterExportPath(): string {
  return path.join(getExportDir(), MASTER_EXPORT_FILE);
}

function countExistingEntries(filePath: string): number {
  if (!fs.existsSync(filePath)) return 0;
  const content = fs.readFileSync(filePath, 'utf8');
  return (content.match(/^IMAGE STYLE ANALYZER — EXPORT$/gm) || []).length;
}

function appendToMasterExport(analysis: StyleAnalysis, sourceLabel?: string) {
  const exportDir = getExportDir();
  const filePath = getMasterExportPath();
  const fileName = path.basename(filePath);

  fs.mkdirSync(exportDir, { recursive: true });

  const isNewFile = !fs.existsSync(filePath);
  const entryNumber = countExistingEntries(filePath) + 1;
  const entryText = formatAnalysisAsText(analysis, sourceLabel);

  if (isNewFile) {
    const header = [
      'IMAGE STYLE ANALYZER — MASTER EXPORT',
      '='.repeat(56),
      'All analyses are saved together in this single file.',
      `File: ${fileName}`,
      '='.repeat(56),
      '',
    ].join('\n');
    fs.writeFileSync(filePath, header + entryText, 'utf8');
  } else {
    const divider = `\n\n${'#'.repeat(56)}\nENTRY ${entryNumber}\n${'#'.repeat(56)}\n\n`;
    fs.appendFileSync(filePath, divider + entryText, 'utf8');
  }

  if (!fs.existsSync(filePath)) {
    throw new Error('Master export file was not written to disk.');
  }

  return { filePath, fileName, entryNumber, appended: !isNewFile };
}

function revealExportedFile(filePath: string): boolean {
  if (process.platform !== 'win32') return false;

  try {
    const normalized = path.normalize(filePath);
    spawn('explorer.exe', ['/select,', normalized], {
      detached: true,
      stdio: 'ignore',
    }).unref();
    return true;
  } catch (err) {
    console.error('[STYLE-ANALYZER] Failed to open Explorer:', err);
    return false;
  }
}

function openExportFolder(): boolean {
  if (process.platform !== 'win32') return false;

  try {
    const exportDir = getExportDir();
    fs.mkdirSync(exportDir, { recursive: true });
    spawn('explorer.exe', [exportDir], {
      detached: true,
      stdio: 'ignore',
    }).unref();
    return true;
  } catch (err) {
    console.error('[STYLE-ANALYZER] Failed to open export folder:', err);
    return false;
  }
}

function sanitizeFileName(name: string): string {
  const base = path.basename(name, path.extname(name));
  const cleaned = base.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').replace(/\s+/g, '_').trim();
  return cleaned.slice(0, 80) || 'image';
}

function formatAnalysisAsText(analysis: StyleAnalysis, sourceLabel?: string): string {
  const sections: Array<[string, string]> = [
    ['DETAILED ART STYLE DESCRIPTION', analysis.detailedAesthetic],
    ['AI PROMPT ASSISTANT (STYLE ONLY)', analysis.styleTemplate],
    ['ARTISTIC MEDIUM', analysis.creativeMedium],
    ['LIGHTING & SHADOW STYLE', analysis.lightingShadows],
    ['COLOR PALETTE & MOOD', analysis.colorPalette],
    ['CAMERA COMPOSITION & ANGLE', analysis.compositionCamera],
    ['ATMOSPHERIC TEXTURE & FINISH', analysis.textureFinish],
  ];

  const lines = [
    'IMAGE STYLE ANALYZER — EXPORT',
    '='.repeat(56),
    `Exported: ${new Date().toLocaleString()}`,
  ];

  if (sourceLabel) {
    lines.push(`Source: ${sourceLabel}`);
  }

  lines.push('');

  for (const [title, body] of sections) {
    lines.push(title, '-'.repeat(56), body, '');
  }

  return lines.join('\n').trimEnd() + '\n';
}

function isValidAnalysis(value: unknown): value is StyleAnalysis {
  if (!value || typeof value !== 'object') return false;
  const fields: (keyof StyleAnalysis)[] = [
    'creativeMedium',
    'lightingShadows',
    'colorPalette',
    'compositionCamera',
    'textureFinish',
    'detailedAesthetic',
    'styleTemplate',
  ];
  return fields.every((field) => typeof (value as StyleAnalysis)[field] === 'string');
}

function parseJsonContent(raw: string): StyleAnalysis {
  let jsonText = raw.trim();
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return JSON.parse(jsonText) as StyleAnalysis;
}

async function callGrokVision(
  apiKey: string,
  model: string,
  imageDataUrl: string,
): Promise<StyleAnalysis> {
  const response = await fetch(XAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageDataUrl, detail: 'high' },
            },
            { type: 'text', text: USER_PROMPT },
          ],
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'style_analysis',
          strict: true,
          schema: STYLE_ANALYSIS_JSON_SCHEMA,
        },
      },
    }),
  });

  const payload = (await response.json()) as GrokChatResponse;

  if (!response.ok) {
    const errBody = payload as GrokChatResponse & { error?: string | { message?: string } };
    const apiError = errBody.error;
    const detail =
      typeof apiError === 'string'
        ? apiError
        : apiError?.message || `xAI API error (${response.status})`;
    throw new Error(detail);
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Grok returned an empty analysis response.');
  }

  return parseJsonContent(content);
}

async function analyzeWithGrok(
  apiKey: string,
  imageDataUrl: string,
): Promise<StyleAnalysis> {
  const configuredModel = process.env.XAI_MODEL?.trim();
  const modelsToTry = configuredModel
    ? [configuredModel]
    : ['grok-4.3', 'grok-4.20-0309-non-reasoning'];

  let lastError: unknown = null;

  for (const model of modelsToTry) {
    const maxRetries = 2;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[STYLE-ANALYZER] Attempting analysis with ${model} (try ${attempt}/${maxRetries})...`);
        const analysis = await callGrokVision(apiKey, model, imageDataUrl);
        console.log(`[STYLE-ANALYZER] Analysis complete via ${model}`);
        return analysis;
      } catch (err) {
        lastError = err;
        const message = err instanceof Error ? err.message : String(err);
        const isRetryable =
          message.includes('503') ||
          message.includes('429') ||
          message.includes('UNAVAILABLE') ||
          message.includes('Overloaded') ||
          message.includes('rate limit');

        console.error(`[STYLE-ANALYZER] ${model} failed:`, message);

        if (isRetryable && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('All Grok models failed to complete style analysis.');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  const uploadDir = path.join(APP_ROOT, 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const cleanName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
      cb(null, cleanName);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are supported.'));
      }
    },
  });

  app.get('/api/config/api-key', (_req, res) => {
    const apiKey = getApiKey();
    res.json({
      configured: Boolean(apiKey),
      masked: apiKey ? maskApiKey(apiKey) : undefined,
    });
  });

  app.post('/api/config/api-key', async (req, res) => {
    try {
      const rawKey = req.body?.apiKey;
      if (typeof rawKey !== 'string' || !rawKey.trim()) {
        return res.status(400).json({ error: 'API key is required.' });
      }

      const apiKey = rawKey.trim();
      await validateApiKey(apiKey);
      updateEnvVariable('XAI_API_KEY', apiKey);

      console.log('[STYLE-ANALYZER] xAI API key saved successfully.');
      res.json({ success: true, masked: maskApiKey(apiKey) });
    } catch (err) {
      console.error('[STYLE-ANALYZER] API key save error:', err);
      const message = err instanceof Error ? err.message : 'Failed to save API key.';
      res.status(400).json({ error: message });
    }
  });

  app.post('/api/analyze', (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'Invalid image upload.' });
      }
      next();
    });
  }, async (req, res) => {
    let filePath: string | null = null;

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded.' });
      }

      const apiKey = getApiKey();
      if (!apiKey) {
        return res.status(401).json({
          error: 'No xAI API key configured. Enter your API key to continue.',
        });
      }

      filePath = req.file.path;
      const fileMime = req.file.mimetype;
      const imageBuffer = fs.readFileSync(filePath);
      const base64Data = imageBuffer.toString('base64');
      const imageDataUrl = `data:${fileMime};base64,${base64Data}`;

      const analysis = await analyzeWithGrok(apiKey, imageDataUrl);

      res.json({
        success: true,
        imagePreview: imageDataUrl,
        analysis,
      });
    } catch (err) {
      console.error('[STYLE-ANALYZER] Fatal analyze error:', err);
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during analysis.';
      res.status(500).json({ error: message });
    } finally {
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.error('[STYLE-ANALYZER] Failed to delete temp upload:', unlinkErr);
        }
      }
    }
  });

  app.post('/api/export', (req, res) => {
    try {
      const { analysis, imageName } = req.body ?? {};

      if (!isValidAnalysis(analysis)) {
        return res.status(400).json({ error: 'Invalid or missing analysis data.' });
      }

      const label = typeof imageName === 'string' && imageName.trim() ? imageName.trim() : undefined;
      const { filePath, fileName, entryNumber, appended } = appendToMasterExport(analysis, label);
      const exportDir = getExportDir();
      const openedInExplorer = revealExportedFile(filePath);

      console.log(
        `[STYLE-ANALYZER] ${appended ? 'Appended' : 'Created'} entry #${entryNumber} in ${filePath}`,
      );

      res.json({
        success: true,
        fileName,
        filePath,
        exportDir,
        entryNumber,
        appended,
        openedInExplorer,
      });
    } catch (err) {
      console.error('[STYLE-ANALYZER] Export error:', err);
      const message = err instanceof Error ? err.message : 'Failed to export analysis.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/export/open-folder', (_req, res) => {
    try {
      const exportDir = getExportDir();
      const filePath = getMasterExportPath();
      fs.mkdirSync(exportDir, { recursive: true });

      const openedInExplorer = fs.existsSync(filePath)
        ? revealExportedFile(filePath)
        : openExportFolder();

      res.json({
        success: true,
        exportDir,
        filePath: fs.existsSync(filePath) ? filePath : undefined,
        openedInExplorer,
      });
    } catch (err) {
      console.error('[STYLE-ANALYZER] Open folder error:', err);
      const message = err instanceof Error ? err.message : 'Failed to open export folder.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      configFile: path.join(APP_ROOT, 'vite.config.ts'),
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { port: 24700 },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(APP_ROOT, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '127.0.0.1', () => {
    console.log(`Image Style Analyzer running at http://127.0.0.1:${PORT}`);
  });
}

process.on('unhandledRejection', (reason) => {
  console.error('[STYLE-ANALYZER] Unhandled rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[STYLE-ANALYZER] Uncaught exception:', err);
});

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
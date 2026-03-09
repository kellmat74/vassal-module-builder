/**
 * Express backend for the VASSAL Module Builder.
 * Handles .vmod upload, analysis, and modified download.
 */

import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { readVmod, type VmodContents } from '../core/vmod-reader.js';
import { writeModifiedVmod } from '../core/vmod-writer.js';
import { analyzeModule } from '../core/module-analyzer.js';

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

// In-memory store for uploaded module binary data (images, sounds, other files).
// Keyed by a session ID returned to the client at upload time.
const moduleStore = new Map<string, { images: VmodContents['images']; otherFiles: VmodContents['otherFiles'] }>();

app.use(express.json({ limit: '100mb' }));

// CORS for Vite dev server
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/upload', upload.single('module'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded. Use field name "module".' });
      return;
    }

    const result = await readVmod(req.file.buffer);

    // Store binary assets server-side, return a sessionId to the client
    const sessionId = crypto.randomUUID();
    moduleStore.set(sessionId, { images: result.images, otherFiles: result.otherFiles });

    res.json({
      componentTree: result.componentTree,
      moduledata: result.moduledata,
      imageList: Array.from(result.images.keys()),
      sessionId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid .vmod file';
    res.status(400).json({ error: message });
  }
});

app.post('/api/analyze', (req, res) => {
  try {
    const { componentTree } = req.body;
    if (!componentTree) {
      res.status(400).json({ error: 'Missing componentTree in request body.' });
      return;
    }

    const suggestions = analyzeModule(componentTree);
    res.json({ suggestions });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed';
    res.status(500).json({ error: message });
  }
});

app.post('/api/download', async (req, res) => {
  try {
    const { componentTree, moduledata, manifest, originalFilename, sessionId } = req.body;
    if (!componentTree || !moduledata) {
      res.status(400).json({ error: 'Missing componentTree or moduledata.' });
      return;
    }

    // Retrieve stored binary assets from upload
    const stored = sessionId ? moduleStore.get(sessionId) : undefined;
    const images = stored?.images ?? new Map();
    const otherFiles = stored?.otherFiles ?? new Map();

    // Tag moduledata and root XML name with modded suffix
    const moddedModuledata = {
      ...moduledata,
      version: `${moduledata.version} (modded)`,
    };

    // Also update the root componentTree name attribute to show modded in VASSAL title bar
    if (componentTree.attributes?.name) {
      componentTree.attributes.name = `${componentTree.attributes.name} (modded)`;
    }

    const buffer = await writeModifiedVmod(
      { componentTree, moduledata: moddedModuledata, images, otherFiles },
      manifest,
    );

    // Clean up stored data after download
    if (sessionId) moduleStore.delete(sessionId);
    const baseName = (originalFilename ?? 'module.vmod').replace(/\.vmod$/i, '');
    const outName = `${baseName}_modded.vmod`;

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    res.send(buffer);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Download generation failed';
    res.status(500).json({ error: message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`VASSAL Module Builder server running on http://localhost:${PORT}`);
});

export default app;

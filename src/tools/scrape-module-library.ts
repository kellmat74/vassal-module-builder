/**
 * Scrape vassalengine.org module library for .vmod download URLs.
 *
 * Uses Playwright because the site is JS-rendered.
 *
 * Usage:
 *   npx tsx src/tools/scrape-module-library.ts [--publisher "GMT Games"] [--headed]
 *
 * Output: data/module-index.json
 */

import { chromium } from 'playwright';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface ModuleDownload {
  url: string;
  version: string;
  filename: string;
}

export interface ModulePageMetadata {
  description?: string;
  contributors?: string[];
  publisher?: string;
  year?: string;
  allText?: string; // full text content of metadata section for future parsing
}

export interface ModuleIndexEntry {
  name: string;
  pageUrl: string;
  downloads: ModuleDownload[];
  publisher: string;
  pageMetadata?: ModulePageMetadata;
}

const OUTPUT_PATH = join(process.cwd(), 'data', 'module-index.json');

function parseArgs() {
  const args = process.argv.slice(2);
  let publisher = 'GMT Games';
  let headed = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--publisher' && args[i + 1]) publisher = args[++i];
    if (args[i] === '--headed') headed = true;
  }

  return { publisher, headed };
}

async function scrapeModuleLibrary() {
  const { publisher, headed } = parseArgs();
  const searchUrl = `https://vassalengine.org/library/search?publisher=${encodeURIComponent(publisher)}`;

  console.log(`🔍 Scraping module library for publisher: ${publisher}`);
  console.log(`   URL: ${searchUrl}`);
  console.log(`   Mode: ${headed ? 'headed (visible browser)' : 'headless'}\n`);

  const browser = await chromium.launch({ headless: !headed });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Load existing index to merge/resume
  let existingIndex: ModuleIndexEntry[] = [];
  if (existsSync(OUTPUT_PATH)) {
    try {
      existingIndex = JSON.parse(readFileSync(OUTPUT_PATH, 'utf-8'));
      console.log(`   Loaded ${existingIndex.length} existing entries from index\n`);
    } catch { /* start fresh */ }
  }
  const existingUrls = new Set(existingIndex.map(e => e.pageUrl));

  // Navigate to search results
  await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });

  // Wait for content to render
  await page.waitForTimeout(3000);

  // Scroll to bottom repeatedly to trigger lazy loading of all results
  console.log('   Scrolling to load all results...');
  let previousHeight = 0;
  let scrollAttempts = 0;
  while (scrollAttempts < 50) {
    const currentHeight = await page.evaluate(() => document.body.scrollHeight);
    if (currentHeight === previousHeight) {
      // Try one more scroll + wait to be sure
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
      const finalHeight = await page.evaluate(() => document.body.scrollHeight);
      if (finalHeight === currentHeight) break;
    }
    previousHeight = currentHeight;
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
    scrollAttempts++;
    if (scrollAttempts % 5 === 0) {
      const linkCount = await page.evaluate(() => document.querySelectorAll('a[href*="/library/"]').length);
      process.stdout.write(`   ...scrolled ${scrollAttempts} times, ${linkCount} links so far\n`);
    }
  }
  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  // Discover page structure — get all module links
  const moduleLinks = await page.evaluate(() => {
    const links: { name: string; url: string }[] = [];
    // Try multiple selectors to find module entries
    const allLinks = document.querySelectorAll('a[href*="/library/"]');
    for (const link of allLinks) {
      const href = (link as HTMLAnchorElement).href;
      const text = (link as HTMLElement).textContent?.trim() ?? '';
      // Module detail pages typically have a path like /library/ModuleName
      // Skip search, category, and other navigation links
      if (href && text && !href.includes('/search') && !href.includes('/category')
        && href.includes('/library/') && text.length > 2) {
        links.push({ name: text, url: href });
      }
    }
    return links;
  });

  console.log(`📋 Found ${moduleLinks.length} module links on search page\n`);

  // If no links found, dump the page for debugging
  if (moduleLinks.length === 0) {
    const html = await page.content();
    const debugPath = join(process.cwd(), 'data', 'debug-search-page.html');
    writeFileSync(debugPath, html);
    console.log(`⚠️  No module links found. Page HTML saved to ${debugPath} for debugging.`);

    // Also try to get any useful text content
    const text = await page.evaluate(() => document.body?.innerText?.substring(0, 2000) ?? '');
    console.log(`\nPage text preview:\n${text}\n`);

    // Take a screenshot for visual debugging
    const screenshotPath = join(process.cwd(), 'data', 'debug-search-page.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to ${screenshotPath}`);

    await browser.close();
    return;
  }

  // Deduplicate and filter module links
  const uniqueModules = new Map<string, { name: string; url: string }>();
  for (const link of moduleLinks) {
    if (!uniqueModules.has(link.url)) {
      uniqueModules.set(link.url, link);
    }
  }

  console.log(`📦 ${uniqueModules.size} unique modules to process\n`);

  // Check for pagination
  const hasNextPage = await page.evaluate(() => {
    const allLinks = document.querySelectorAll('a');
    for (const link of allLinks) {
      const text = (link as HTMLElement).textContent?.trim().toLowerCase() ?? '';
      if (text === 'next' || text === 'next page' || text === '>' || link.getAttribute('rel') === 'next') {
        return true;
      }
    }
    return false;
  });

  if (hasNextPage) {
    console.log('⚠️  Pagination detected — currently only scraping first page. TODO: handle pagination.\n');
  }

  // Visit each module page to get download links
  const index: ModuleIndexEntry[] = [...existingIndex.filter(e => e.publisher !== publisher)];
  let processed = 0;

  for (const [url, { name }] of uniqueModules) {
    processed++;

    // Skip already-indexed modules
    if (existingUrls.has(url)) {
      console.log(`  [${processed}/${uniqueModules.size}] ⏭️  ${name} (already indexed)`);
      continue;
    }

    process.stdout.write(`  [${processed}/${uniqueModules.size}] ${name}...`);

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1500);

      // Extract download links and page metadata from the module detail page
      const pageData = await page.evaluate(() => {
        // Downloads
        const downloads: { url: string; version: string; filename: string }[] = [];
        const allLinks = document.querySelectorAll('a[href*=".vmod"]');
        for (const link of allLinks) {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLElement).textContent?.trim() ?? '';
          const filename = href.split('/').pop() ?? '';
          const versionMatch = text.match(/v?(\d+[\d.]*\d+)/) ?? filename.match(/v?(\d+[\d.]*\d+)/);
          downloads.push({
            url: href,
            version: versionMatch?.[1] ?? '',
            filename: decodeURIComponent(filename),
          });
        }

        // Page metadata — scrape all visible text content for analysis
        // Look for common metadata patterns on the page
        const bodyText = document.body?.innerText ?? '';

        // Try to find contributors/authors
        const contributors: string[] = [];
        const contribSection = bodyText.match(/(?:Contributors?|Authors?|Module by|Created by)[:\s]*([^\n]+)/i);
        if (contribSection) {
          contributors.push(...contribSection[1].split(/[,&]/).map(s => s.trim()).filter(Boolean));
        }

        // Try to find description
        let description = '';
        const descMeta = document.querySelector('meta[name="description"]');
        if (descMeta) description = descMeta.getAttribute('content') ?? '';

        // Capture all page text for future parsing (truncated to avoid huge entries)
        const allText = bodyText.substring(0, 3000);

        return { downloads, metadata: { description, contributors, allText } };
      });

      if (pageData.downloads.length > 0) {
        index.push({
          name,
          pageUrl: url,
          downloads: pageData.downloads,
          publisher,
          pageMetadata: {
            description: pageData.metadata.description || undefined,
            contributors: pageData.metadata.contributors.length > 0 ? pageData.metadata.contributors : undefined,
            allText: pageData.metadata.allText || undefined,
          },
        });
        console.log(` ✅ ${pageData.downloads.length} download(s)`);
      } else {
        console.log(` ⚠️ no .vmod links found`);
      }
    } catch (e) {
      console.log(` ❌ ${e}`);
    }

    // Rate limiting
    await page.waitForTimeout(1000);
  }

  await browser.close();

  // Save index
  mkdirSync('data', { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(index, null, 2));
  console.log(`\n📊 Index saved to ${OUTPUT_PATH}`);
  console.log(`   Total entries: ${index.length}`);
  console.log(`   With downloads: ${index.filter(e => e.downloads.length > 0).length}`);
}

scrapeModuleLibrary().catch(console.error);

// Renders the 1200×630 Open Graph image shown when a page is shared, in the site's
// dark style. Satori lays out the card and turns its text into paths; resvg makes the PNG.
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori, { type Font } from 'satori';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export type OgCard = {
  notebook: string;
  title: string;
  /** Section names above the title, e.g. ['Math', '矩陣']. */
  path?: string[];
  tags?: string[];
  difficulty?: number;
  /** Small line under the title, e.g. "3 notes". */
  caption?: string;
};

const require = createRequire(import.meta.url);
const fontDir = (pkg: string) => join(dirname(require.resolve(`${pkg}/package.json`)), 'files');
const files = new Map<string, Promise<ArrayBuffer>>();
const read = (pkg: string, file: string) => {
  const path = join(fontDir(pkg), file);
  if (!files.has(path)) files.set(path, readFile(path).then((b) => b.buffer as ArrayBuffer));
  return files.get(path)!;
};

/**
 * Inter has no CJK glyphs, so Noto Sans TC fills them in. Fontsource splits Noto into
 * ~100 files by unicode-range; only the files that contain characters in `text` are loaded.
 */
async function loadFonts(text: string): Promise<Font[]> {
  const fonts: Font[] = [
    { name: 'Inter', weight: 400, data: await read('@fontsource/inter', 'inter-latin-400-normal.woff') },
    { name: 'Inter', weight: 500, data: await read('@fontsource/inter', 'inter-latin-500-normal.woff') },
    { name: 'Inter', weight: 600, data: await read('@fontsource/inter', 'inter-latin-600-normal.woff') },
    { name: 'DM Mono', weight: 400, data: await read('@fontsource/dm-mono', 'dm-mono-latin-400-normal.woff') },
  ];
  const codes = [...new Set(text)].map((c) => c.codePointAt(0)!).filter((c) => c > 0x7e);
  const css = await readFile(join(fontDir('@fontsource/noto-sans-tc'), '..', '500.css'), 'utf8');
  for (const [, file, ranges] of css.matchAll(/url\(\.\/files\/([^)]+\.woff)\) format\('woff'\);\s*unicode-range: ([^;]+);/g)) {
    const covers = ranges.split(',').some((range) => {
      const [lo, hi = lo] = range.trim().replace(/^U\+/i, '').split('-').map((hex) => parseInt(hex, 16));
      return codes.some((c) => c >= lo && c <= hi);
    });
    // A unique name per file: Satori falls back through every loaded font for a missing glyph.
    if (covers) fonts.push({ name: `Noto Sans TC ${file}`, weight: 500, data: await read('@fontsource/noto-sans-tc', file) });
  }
  return fonts;
}

// Minimal element builder for Satori, which takes React-shaped objects.
type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: (Node | string | false | undefined)[]): Node => ({
  type,
  props: { style, children: children.filter((c) => c !== false && c !== undefined) },
});

// The favicon's mark: code brackets on a white rounded square.
const mark = (size: number): Node => ({
  type: 'svg',
  props: {
    width: size,
    height: size,
    viewBox: '0 0 32 32',
    children: [
      { type: 'rect', props: { width: 32, height: 32, rx: 8, fill: '#fff' } },
      {
        type: 'path',
        props: { d: 'M13 10l-6 6 6 6M19 10l6 6-6 6', fill: 'none', stroke: '#090909', 'stroke-width': 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
      },
    ],
  },
});

function card({ notebook, title, path = [], tags = [], difficulty, caption }: OgCard): Node {
  // CJK characters are about 1em wide, so long titles step down to stay within two lines.
  const width = [...title].reduce((sum, c) => sum + (c.charCodeAt(0) > 0x2e7f ? 1 : 0.55), 0);
  const size = width <= 12 ? 96 : width <= 20 ? 80 : 64;

  return h(
    'div',
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      padding: 80,
      background: '#090909',
      color: '#fff',
      fontFamily: 'Inter',
    },
    h(
      'div',
      { display: 'flex', alignItems: 'center', gap: 18 },
      mark(44),
      h('div', { fontSize: 30, fontWeight: 600, letterSpacing: -1, color: '#efefef' }, notebook),
    ),
    h(
      'div',
      { display: 'flex', flexDirection: 'column' },
      path.length > 0 && h('div', { fontSize: 30, fontWeight: 500, color: '#7d7d7d', marginBottom: 20 }, path.join(' / ')),
      h('div', { fontSize: size, fontWeight: 500, lineHeight: 1.15, letterSpacing: -size * 0.035, lineClamp: 2 }, title),
      caption && h('div', { fontSize: 30, fontWeight: 500, color: '#7d7d7d', marginTop: 24 }, caption),
      (tags.length > 0 || difficulty !== undefined) &&
        h(
          'div',
          { display: 'flex', alignItems: 'center', gap: 14, marginTop: 40 },
          ...tags.map((tag) =>
            h(
              'div',
              { display: 'flex', alignItems: 'center', height: 48, padding: '0 22px', borderRadius: 999, border: '2px solid rgba(255,255,255,0.18)', fontSize: 22, fontWeight: 500, color: '#a8a8a8' },
              tag,
            ),
          ),
          difficulty !== undefined &&
            h(
              'div',
              { display: 'flex', marginLeft: tags.length ? 10 : 0, fontFamily: 'DM Mono', fontSize: 24, color: '#d6d6d6' },
              h('span', { color: '#6f6f6f', marginRight: 12 }, 'Difficulty'),
              `${difficulty}/10`,
            ),
        ),
    ),
  );
}

export async function renderOgImage(data: OgCard): Promise<Uint8Array> {
  const text = [data.notebook, data.title, ...(data.path ?? []), ...(data.tags ?? []), data.caption ?? ''].join('');
  const svg = await satori(card(data) as never, { width: OG_WIDTH, height: OG_HEIGHT, fonts: await loadFonts(text) });
  return new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH } }).render().asPng();
}

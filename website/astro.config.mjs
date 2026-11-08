import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { lineNumbers, remarkHackmdCode, remarkNoteLinks } from './src/lib/markdown.mjs';

export default defineConfig({
  site: 'https://blog.jimmywu.app',
  // Pages build to /cp/math/fast-power.html, which Cloudflare serves at /cp/math/fast-power.
  build: { format: 'file' },
  trailingSlash: 'never',
  markdown: {
    shikiConfig: { theme: 'vitesse-dark', transformers: [lineNumbers] },
    processor: unified({
      // HackMD keeps single line breaks and does not curl quotes.
      smartypants: false,
      remarkPlugins: [remarkBreaks, remarkMath, remarkHackmdCode, remarkNoteLinks],
      rehypePlugins: [rehypeKatex],
    }),
  },
  vite: { plugins: [tailwindcss()] },
});

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Every .md file in notes/. Its id is its path without `.md` (e.g. math/fast-power),
// which is also its URL.
const notes = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: '../notes',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    // `tags: [math, dp]`, or a single `tags: math`.
    tags: z
      .union([z.string(), z.array(z.string())])
      .default([])
      .transform((tags) => (Array.isArray(tags) ? tags : [tags])),
    // 1 (easiest) to 10.
    difficulty: z.number().int().min(1).max(10).optional(),
  }),
});

export const collections = { notes };

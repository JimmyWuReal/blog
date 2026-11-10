import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Frontmatter shared by blog posts and notebook notes.
const page = z.object({
  title: z.string(),
  // Shown on cards and in link previews. Nothing is shown if it's left out.
  description: z.string().optional(),
  // `date: 2026-11-01`. Shown on cards and on the page.
  date: z.coerce.date().optional(),
  // Additional authors: `author: [x, y]`. Jimmy Wu is always credited first.
  author: z.array(z.string().trim().min(1)).default([]),
  // `draft: true` keeps a post or notebook note off the site.
  draft: z.boolean().default(false),
  // `tags: [math, dp]`, or a single `tags: math`.
  tags: z
    .union([z.string(), z.array(z.string())])
    .default([])
    .transform((tags) => (Array.isArray(tags) ? tags : [tags])),
  // 0 (easiest) to 10.
  difficulty: z.number().int().min(0).max(10).optional(),
  // Prerequisite knowledge: `pre: 遞迴` or `pre: [遞迴, 模運算]`.
  // Shown before the article; omitted or empty means no prerequisites section.
  pre: z
    .union([z.string(), z.array(z.string())])
    .default([])
    .transform((pre) => (Array.isArray(pre) ? pre : [pre]))
    .transform((pre) => pre.map((item) => item.trim()).filter(Boolean)),
});

// An entry's id is its path without `.md`, which is also its URL.
const generateId = ({ entry }: { entry: string }) => entry.replace(/\.md$/, '');

// Every .md file in blogs/: blogs/hello.md → /hello.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: '../blogs', generateId }),
  schema: page,
});

// Every .md file in notebooks/: notebooks/cp/math/fast-power.md → /cp/math/fast-power.
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: '../notebooks', generateId }),
  schema: page,
});

export const collections = { posts, notes };

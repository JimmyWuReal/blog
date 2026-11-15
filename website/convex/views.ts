// View counters for notebook notes. Opening a note counts one view for it and one for
// its notebook, so the notebook's total is a single read.
import { mutation, query, type MutationCtx } from './_generated/server';
import { v } from 'convex/values';

// Note ids look like cp/math/fast-power; anything else is not a note.
const NOTE_PATH = /^[\w-]+(?:\/[\w-]+)+$/;

async function bump(ctx: MutationCtx, path: string) {
  const row = await ctx.db.query('views').withIndex('by_path', (q) => q.eq('path', path)).unique();
  if (!row) {
    await ctx.db.insert('views', { path, count: 1 });
    return 1;
  }
  await ctx.db.patch(row._id, { count: row.count + 1 });
  return row.count + 1;
}

/** Counts a view of a note and returns the note's new total. */
export const hit = mutation({
  args: { path: v.string() },
  handler: async (ctx, { path }) => {
    if (path.length > 200 || !NOTE_PATH.test(path)) throw new Error(`Not a note path: ${path}`);
    await bump(ctx, path.split('/')[0]);
    return await bump(ctx, path);
  },
});

/** A note's or notebook's view count, 0 if it has never been viewed. */
export const get = query({
  args: { path: v.string() },
  handler: async (ctx, { path }) => {
    const row = await ctx.db.query('views').withIndex('by_path', (q) => q.eq('path', path)).unique();
    return row?.count ?? 0;
  },
});

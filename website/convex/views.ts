// View counters for notes and posts. Opening a note counts one view for it and one for
// its notebook, so the notebook's total is a single read. Posts count at posts/<id> (see
// viewPath in src/lib/site.ts), which adds to an all-posts total at `posts` the same way. Each view also counts toward its day, which
// the charts on /views read.
import { mutation, query, type MutationCtx } from './_generated/server';
import { v } from 'convex/values';

// Note ids look like cp/math/fast-power, post counters like posts/hello; anything else is refused.
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

/** Today in Taipei, which is UTC+8 all year, as YYYY-MM-DD. */
const today = () => new Date(Date.now() + 8 * 3_600_000).toISOString().slice(0, 10);

/** Adds a view to today. Call before the view is added to any path's counter. */
async function bumpDay(ctx: MutationCtx) {
  const day = today();
  const last = await ctx.db.query('days').withIndex('by_day').order('desc').first();
  if (last?.day === day) {
    await ctx.db.patch(last._id, { count: last.count + 1, total: last.total + 1 });
    return;
  }
  // The very first day carries on from the views counted before days were recorded: every
  // notebook's total plus all posts', whose paths are the ones without a slash.
  let total = last?.total;
  if (total === undefined) {
    const counters = await ctx.db.query('views').collect();
    total = counters.filter(({ path }) => !path.includes('/')).reduce((sum, { count }) => sum + count, 0);
  }
  await ctx.db.insert('days', { day, count: 1, total: total + 1 });
}

/** Counts a view of a note and returns the note's new total. */
export const hit = mutation({
  args: { path: v.string() },
  handler: async (ctx, { path }) => {
    if (path.length > 200 || !NOTE_PATH.test(path)) throw new Error(`Not a note path: ${path}`);
    await bumpDay(ctx);
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

/** The latest 30 days that have views, oldest first. */
export const daily = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('days').withIndex('by_day').order('desc').take(30);
    return rows.reverse().map(({ day, count, total }) => ({ day, count, total }));
  },
});

import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // One counter per page, keyed by its path without slashes at the ends: a note
  // (cp/math/fast-power) or a notebook (cp), whose count is the total of its notes. Posts
  // count at posts/<id>, with the total of all posts at posts.
  views: defineTable({ path: v.string(), count: v.number() }).index('by_path', ['path']),
  // One row per Taipei day (YYYY-MM-DD) with at least one view: that day's views across every
  // post and note, and the all-time total at the end of it. Days without views have no row.
  days: defineTable({ day: v.string(), count: v.number(), total: v.number() }).index('by_day', ['day']),
});

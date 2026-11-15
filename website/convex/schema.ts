import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // One counter per page, keyed by its path without slashes at the ends: a note
  // (cp/math/fast-power) or a notebook (cp), whose count is the total of its notes.
  views: defineTable({ path: v.string(), count: v.number() }).index('by_path', ['path']),
});

// Site-wide data: blog posts, tags across posts and notes, and URLs.
import { getCollection, type CollectionEntry } from 'astro:content';
import { getNotebooks, type Note } from './notebook';

export const SITE_TITLE = 'Blog - Jimmy Wu';

export type Post = CollectionEntry<'posts'>;
/** Anything with its own page: a blog post or a notebook note. */
export type Entry = Post | Note;

export const isPost = (entry: Entry): entry is Post => entry.collection === 'posts';
/** Posts and notes both live at their id: /hello, /cp/math/fast-power. */
export const entryUrl = (entry: Entry) => `/${entry.id}`;

// URLs that a post can't take, besides notebook slugs.
const RESERVED = ['index', '404', 'tags', 'og'];

/** Published posts, newest first with undated posts last. Fails on URL collisions. */
export async function getPosts() {
  const notebooks = new Set((await getNotebooks()).map((notebook) => notebook.slug));
  const posts = (await getCollection('posts')).filter((post) => !post.data.draft);
  const clashes = posts.filter((post) => {
    const first = post.id.split('/')[0];
    return notebooks.has(first) || RESERVED.includes(first);
  });
  if (clashes.length) {
    throw new Error(`These posts' URLs collide with a notebook or a site page; rename them:\n- ${clashes.map((post) => `blogs/${post.id}.md`).join('\n- ')}`);
  }
  return posts.sort((a, b) => {
    if (!a.data.date) return b.data.date ? 1 : a.id.localeCompare(b.id);
    if (!b.data.date) return -1;
    return b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id);
  });
}

/** Every tag with its posts (newest first), then its notes (in notebook order). */
export async function getTags() {
  const tags = new Map<string, Entry[]>();
  const entries: Entry[] = [...(await getPosts()), ...(await getNotebooks()).flatMap((notebook) => notebook.order)];
  for (const entry of entries) {
    for (const tag of entry.data.tags) tags.set(tag, [...(tags.get(tag) ?? []), entry]);
  }
  return tags;
}

/** A frontmatter date as YYYY-MM-DD. YAML dates are midnight UTC, so format in UTC. */
export const formatDate = (date: Date) => date.toISOString().slice(0, 10);

/** Jimmy Wu, followed by any additional authors from the frontmatter. */
export function formatAuthors(author: string[]) {
  const names = ['Jimmy Wu', ...author];
  return names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

export const plural = (count: number, word: string) => `${count} ${count === 1 ? word : `${word}s`}`;

/** "2 posts · 3 notes", leaving out a kind there are none of. */
export function countEntries(entries: Entry[]) {
  const posts = entries.filter(isPost).length;
  const notes = entries.length - posts;
  return [posts && plural(posts, 'post'), notes && plural(notes, 'note')].filter(Boolean).join(' · ');
}

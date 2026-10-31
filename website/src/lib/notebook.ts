// Reads notes/notebook.yml and pairs it with the note files, so pages can render
// the sidebar, the contents page, and previous / next links.
import { getCollection, type CollectionEntry } from 'astro:content';
import { parse } from 'yaml';
import notebookYml from '../../../notes/notebook.yml?raw';

export type Note = CollectionEntry<'notes'>;
export type Section = { title: string; items: Item[] };
export type Item = Note | Section;
export type Notebook = {
  title: string;
  sections: Section[];
  order: Note[];
  /** Each note's section names, outermost first, keyed by note id. */
  sectionPath: Map<string, string[]>;
};

type RawSection = { section: string; notes: (string | RawSection)[] };

export const isSection = (item: Item): item is Section => 'items' in item;
export const noteUrl = (note: Note) => `/${note.id}`;

// Cached for the build; reloaded on every request in dev so edits show up.
let cached: Promise<Notebook> | undefined;
export const getNotebook = () => (import.meta.env.DEV ? load() : (cached ??= load()));

async function load(): Promise<Notebook> {
  const raw = parse(notebookYml) as { title: string; sections: RawSection[] };
  const notes = new Map((await getCollection('notes')).map((note) => [note.id, note]));
  const order: Note[] = [];
  const sectionPath = new Map<string, string[]>();
  const problems: string[] = [];

  const toSection = ({ section, notes: entries }: RawSection, parents: string[] = []): Section => ({
    title: section,
    items: (entries ?? []).flatMap((entry): Item[] => {
      if (typeof entry !== 'string') return [toSection(entry, [...parents, section])];
      const id = entry.replace(/\.md$/, '');
      const note = notes.get(id);
      if (!note) problems.push(`"${entry}" is listed but notes/${id}.md does not exist.`);
      else if (order.includes(note)) problems.push(`"${entry}" is listed more than once.`);
      else return order.push(note), sectionPath.set(id, [...parents, section]), [note];
      return [];
    }),
  });

  const sections = (raw.sections ?? []).map((section) => toSection(section));
  for (const id of notes.keys()) {
    if (!order.some((note) => note.id === id)) problems.push(`notes/${id}.md is not listed.`);
  }
  if (problems.length) {
    throw new Error(`notes/notebook.yml has problems:\n- ${problems.join('\n- ')}`);
  }
  return { title: raw.title, sections, order, sectionPath };
}

/** Every tag with its notes, in notebook order. */
export async function getTags() {
  const tags = new Map<string, Note[]>();
  for (const note of (await getNotebook()).order) {
    for (const tag of note.data.tags) tags.set(tag, [...(tags.get(tag) ?? []), note]);
  }
  return tags;
}

/** The note's opening text as plain text, for link previews. Empty if it opens with code or a heading. */
export function noteDescription(note: Note, max = 150) {
  const paragraph = (note.body ?? '').trim().split(/\n\s*\n/)[0] ?? '';
  return isProse(paragraph) ? plainText(paragraph, max) : '';
}

/** The note's first prose paragraph as plain text, skipping headings and code, for note cards. */
export function notePreview(note: Note, max = 110) {
  const body = (note.body ?? '').replace(/^```[\s\S]*?^```/gm, '').replace(/^\$\$[\s\S]*?\$\$/gm, '');
  const paragraph = body.trim().split(/\n\s*\n/).find(isProse) ?? '';
  return plainText(paragraph, max);
}

const isProse = (paragraph: string) => paragraph !== '' && !/^(#|```|\$\$|\||>|<|-{3,}\s*$)/.test(paragraph);

function plainText(paragraph: string, max: number) {
  const text = paragraph
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\*\*|__|~~|[`$]/g, '')
    .replace(/^\s*(?:[-+]|\d+\.)\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
  return [...text].length > max ? `${[...text].slice(0, max - 1).join('').trimEnd()}…` : text;
}

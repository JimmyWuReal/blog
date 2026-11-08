// Reads every notebooks/<slug>/notebook.yml and pairs it with that folder's notes, so
// pages can render the sidebar, the contents page, and previous / next links.
import { getCollection, type CollectionEntry } from 'astro:content';
import { parse } from 'yaml';

export type Note = CollectionEntry<'notes'>;
export type Section = { title: string; items: Item[] };
export type Item = Note | Section;
export type Notebook = {
  /** The folder name, which is also the notebook's URL: cp → /cp. */
  slug: string;
  title: string;
  description?: string;
  sections: Section[];
  order: Note[];
  /** Each note's section names, outermost first, keyed by note id. */
  sectionPath: Map<string, string[]>;
};

type RawSection = { section: string; notes: (string | RawSection)[] };
type RawNotebook = { title: string; description?: string; sections: RawSection[] };

const ymls = import.meta.glob<string>('../../../notebooks/*/notebook.yml', { query: '?raw', import: 'default', eager: true });

export const isSection = (item: object): item is Section => 'items' in item;

// Cached for the build; reloaded on every request in dev so edits show up.
let cached: Promise<Notebook[]> | undefined;
export const getNotebooks = () => (import.meta.env.DEV ? load() : (cached ??= load()));

async function load(): Promise<Notebook[]> {
  const notes = new Map((await getCollection('notes')).map((note) => [note.id, note]));
  const listed = new Set<string>();
  const problems: string[] = [];

  const notebooks = Object.entries(ymls).map(([file, yml]): Notebook => {
    const slug = file.split('/').at(-2)!;
    const raw = parse(yml) as RawNotebook;
    const order: Note[] = [];
    const sectionPath = new Map<string, string[]>();

    const toSection = ({ section, notes: entries }: RawSection, parents: string[] = []): Section => ({
      title: section,
      items: (entries ?? []).flatMap((entry): Item[] => {
        if (typeof entry !== 'string') return [toSection(entry, [...parents, section])];
        const id = `${slug}/${entry.replace(/\.md$/, '')}`;
        const note = notes.get(id);
        if (!note) problems.push(`notebooks/${slug}/notebook.yml: "${entry}" is listed but notebooks/${id}.md does not exist.`);
        else if (listed.has(id)) problems.push(`notebooks/${slug}/notebook.yml: "${entry}" is listed more than once.`);
        else {
          listed.add(id);
          if (note.data.draft) return [];
          order.push(note);
          sectionPath.set(id, [...parents, section]);
          return [note];
        }
        return [];
      }),
    });

    const sections = (raw.sections ?? []).map((section) => toSection(section));
    return { slug, title: raw.title, description: raw.description, sections, order, sectionPath };
  });

  // Every published note needs a place in its notebook's sidebar.
  for (const [id, note] of notes) {
    if (!note.data.draft && !listed.has(id)) {
      const slug = id.split('/')[0];
      problems.push(`notebooks/${id}.md is not listed in notebooks/${slug}/notebook.yml; add it or set draft: true.`);
    }
  }
  if (problems.length) throw new Error(`Notebook problems:\n- ${problems.join('\n- ')}`);
  return notebooks.sort((a, b) => a.title.localeCompare(b.title));
}

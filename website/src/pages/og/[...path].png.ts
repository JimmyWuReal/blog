// Open Graph images: /og/index.png for the contents page, /og/<note id>.png for each
// note, and /og/tags/<tag>.png for each tag page. Rendered once at build time.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getNotebook, getTags } from '../../lib/notebook';
import { renderOgImage, type OgCard } from '../../lib/og';

export const getStaticPaths = (async () => {
  const { title: notebook, order, sectionPath } = await getNotebook();
  const cards: { path: string; card: OgCard }[] = [
    { path: 'index', card: { notebook, title: 'Contents', caption: `${order.length} notes` } },
    ...order.map((note) => ({
      path: note.id,
      card: { notebook, title: note.data.title, path: sectionPath.get(note.id), tags: note.data.tags, difficulty: note.data.difficulty },
    })),
    ...[...(await getTags())].map(([tag, notes]) => ({
      path: `tags/${tag}`,
      card: { notebook, title: tag, caption: `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}` },
    })),
  ];
  return cards.map(({ path, card }) => ({ params: { path }, props: { card } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) =>
  new Response(await renderOgImage(props.card as OgCard), { headers: { 'Content-Type': 'image/png' } });

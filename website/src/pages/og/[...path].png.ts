// Open Graph images, rendered once at build time: /og/index.png for the home page,
// /og/<notebook>.png for each notebook's contents, /og/<post or note id>.png for each
// post and note, and /og/tags/<tag>.png for each tag page.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getNotebooks } from '../../lib/notebook';
import { SITE_TITLE, countEntries, formatDate, getPosts, getTags, plural } from '../../lib/site';
import { renderOgImage, type OgCard } from '../../lib/og';

export const getStaticPaths = (async () => {
  const notebooks = await getNotebooks();
  const posts = await getPosts();
  const cards: { path: string; card: OgCard }[] = [
    {
      path: 'index',
      card: { label: 'Jimmy Wu', title: 'Blog', caption: [posts.length && plural(posts.length, 'post'), plural(notebooks.length, 'notebook')].filter(Boolean).join(' · ') },
    },
    ...notebooks.flatMap(({ slug, title: notebook, order, sectionPath }) => [
      { path: slug, card: { label: SITE_TITLE, title: notebook, caption: plural(order.length, 'note') } },
      ...order.map((note) => ({
        path: note.id,
        card: { label: notebook, title: note.data.title, path: sectionPath.get(note.id), tags: note.data.tags, difficulty: note.data.difficulty },
      })),
    ]),
    ...posts.map((post) => ({
      path: post.id,
      card: { label: SITE_TITLE, title: post.data.title, caption: post.data.date ? formatDate(post.data.date) : undefined, tags: post.data.tags, difficulty: post.data.difficulty },
    })),
    ...[...(await getTags())].map(([tag, entries]) => ({
      path: `tags/${tag}`,
      card: { label: SITE_TITLE, title: tag, caption: countEntries(entries) },
    })),
  ];
  return cards.map(({ path, card }) => ({ params: { path }, props: { card } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) =>
  new Response(await renderOgImage(props.card as OgCard), { headers: { 'Content-Type': 'image/png' } });

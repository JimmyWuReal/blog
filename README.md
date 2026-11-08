# blog

Jimmy Wu's blog and notebooks, published at **https://blog.jimmywu.app**.

```
blogs/       blog posts: one .md file per post
notebooks/   notebooks: one folder per notebook, with a notebook.yml and its notes
website/     the Astro site that renders both
```

Edit anything in `blogs/` or `notebooks/` and push to `main`. Cloudflare Pages rebuilds and deploys the site in about a minute.

## Writing a blog post

Create a `.md` file under `blogs/`, e.g. `blogs/hello.md`. It's published at `blog.jimmywu.app/hello`, and the home page lists posts newest first.

```md
---
title: Hello
description: The first post.
date: 2026-11-08
tags: [life]
---

Text starts here. The page's title comes from `title`, so don't repeat it as a `# heading`.
```

A post needs a `date`. Add `draft: true` to keep a post off the site while you write it.

A post can't use a notebook's folder name or `tags`, `og`, `index`, or `404` as its URL. The build fails if one does.

## Writing a note

Each folder in `notebooks/` is one notebook, and its folder name is its URL: `notebooks/cp/` → `blog.jimmywu.app/cp`.

1. Create a `.md` file in the notebook, e.g. `notebooks/cp/graph/dijkstra.md`.
2. Add its path to that notebook's `notebook.yml` where it should appear in the sidebar. Notes left out of `notebook.yml` are drafts and aren't published.

```md
---
title: Dijkstra
description: Shortest paths from one source when no edge is negative.
date: 2026-11-01
tags: [graph, shortest-path]
difficulty: 4
---
```

The note's URL is the notebook plus its path: `notebooks/cp/graph/dijkstra.md` → `blog.jimmywu.app/cp/graph/dijkstra`.

To start a new notebook, create `notebooks/<name>/notebook.yml` with a `title`, an optional `description`, and `sections`. It shows up on the home page.

### Frontmatter

Posts and notes use the same fields.

| Field         | Required       | Notes                                                        |
| ------------- | -------------- | ------------------------------------------------------------ |
| `title`       | yes            | Shown on the site. The file name is only the URL.            |
| `description` | no             | Shown on the card and in link previews. Left empty if missing. |
| `date`        | posts only     | `YYYY-MM-DD`. Shown on the card and the page.                |
| `tags`        | no             | A list, or a single word. Each tag gets a page at `/tags/<tag>` listing posts and notes. |
| `difficulty`  | no             | Whole number from 1 (easiest) to 10.                         |
| `draft`       | no, posts only | `true` keeps the post off the site.                          |

Every post and note also gets a link-preview (Open Graph) image at `/og/<its URL>.png`, made at build time. The preview text is its `description`.

### Markdown

Posts and notes are written the way they were on HackMD:

- `$x^n$` inline math and `$$ ... $$` display math (KaTeX).
- ` ```cpp ` for a highlighted code block, ` ```cpp= ` to add line numbers, ` ```cpp=11 ` to start numbering at 11.
- A single line break is kept as a line break.
- Tables, task lists, and strikethrough (GitHub-flavored Markdown).
- Link to another post or note by its relative file path: `[快速冪](../math/fast-power.md)`. The site turns this into the right URL, and the same link also works on GitHub and in editors.

### notebook.yml

`notebooks/<name>/notebook.yml` sets the notebook's title, sections, their order, and the notes in each, including sub-sections.

The build fails with a message that names the problem if:

- a note is listed twice, or is listed without a matching file,
- a post or note links to a `.md` file that doesn't exist,
- frontmatter is missing `title` (or `date` on a post), or `difficulty` isn't a whole number from 1 to 10,
- a post's URL collides with a notebook or a site page.

GitHub Actions runs the same build on every push, so a mistake shows up as a failed check on the commit.

## Running the site locally

Use Node.js 24.

```sh
cd website
npm ci
npm run dev      # http://localhost:4321, reloads when posts or notes change
npm run build    # production build into website/dist
```

## Deployment

Cloudflare Pages is connected to this GitHub repository. Every push to `main` builds and deploys the site. No Cloudflare token is stored in the repository.

Cloudflare build settings:

- Production branch: `main`
- Root directory: `website`
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: `24`, from `website/.nvmrc`

`blog.jimmywu.app` is set up under the Pages project's **Custom domains** tab. Cloudflare manages its DNS record and HTTPS certificate. The Pages project is still named `cp-note` because Cloudflare can't rename projects.

- Custom domain: https://blog.jimmywu.app
- Cloudflare hostname: https://cp-note-nfn.pages.dev
- [Cloudflare project](https://dash.cloudflare.com/3573cf391dd2d9dc99966427952b98ee/pages/view/cp-note)

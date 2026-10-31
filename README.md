# cp-note

Jimmy Wu's competitive programming notebook, published at **https://cp.jimmywu.app**.

```
notes/      the notebook: one .md file per note, plus notebook.yml
website/    the Astro site that renders notes/
```

Edit anything in `notes/` and push to `main`. Cloudflare Pages rebuilds and deploys the site in about a minute.

## Writing a note

1. Create a `.md` file under `notes/`, e.g. `notes/graph/dijkstra.md`.
2. Add its path to `notes/notebook.yml` where it should appear in the sidebar.

```md
---
title: Dijkstra
tags: [graph, shortest-path]
difficulty: 4
---

Text starts here. The page's title comes from `title`, so don't repeat it as a `# heading`.
```

| Field        | Required | Notes                                                        |
| ------------ | -------- | ------------------------------------------------------------ |
| `title`      | yes      | Shown on the site. The file name is only the URL.            |
| `tags`       | no       | A list, or a single word. Each tag gets a page at `/tags/<tag>`. |
| `difficulty` | no       | Whole number from 1 (easiest) to 10.                         |

The note's URL is its path: `notes/graph/dijkstra.md` → `cp.jimmywu.app/graph/dijkstra`.

Each note also gets a link-preview (Open Graph) image at `/og/graph/dijkstra.png`, made at build time from its title, section, tags, and difficulty. The preview text is the note's first paragraph.

### Markdown

Notes are written the way they were on HackMD:

- `$x^n$` inline math and `$$ ... $$` display math (KaTeX).
- ` ```cpp ` for a highlighted code block, ` ```cpp= ` to add line numbers, ` ```cpp=11 ` to start numbering at 11.
- A single line break is kept as a line break.
- Tables, task lists, and strikethrough (GitHub-flavored Markdown).
- Link to another note by its relative file path: `[快速冪](../math/fast-power.md)`. The site turns this into the right URL, and the same link also works on GitHub and in editors.

### notebook.yml

`notes/notebook.yml` sets the sections, their order, and the notes in each, including sub-sections. Every note must be listed exactly once.

The build fails with a message that names the problem if:

- a note isn't listed in `notebook.yml`, is listed twice, or is listed without a matching file,
- a note links to a `.md` file that doesn't exist,
- frontmatter is missing `title`, or `difficulty` isn't a whole number from 1 to 10.

GitHub Actions runs the same build on every push, so a mistake shows up as a failed check on the commit.

## Running the site locally

Use Node.js 24.

```sh
cd website
npm ci
npm run dev      # http://localhost:4321, reloads when notes change
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

`cp.jimmywu.app` is set up under the Pages project's **Custom domains** tab. Cloudflare manages its DNS record and HTTPS certificate.

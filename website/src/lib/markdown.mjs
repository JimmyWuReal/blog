// Markdown plugins that make notes render the way HackMD renders them.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { visit } from 'unist-util-visit';

export const NOTES_DIR = fileURLToPath(new URL('../../../notes/', import.meta.url));

/**
 * HackMD code fences: ```cpp= shows line numbers, ```cpp=101 starts them at 101,
 * and a bare ```= numbers a plain-text block. Rewrites the fence to a normal
 * language plus a `lines=N` meta that `lineNumbers` below turns into markup.
 */
export function remarkHackmdCode() {
  return (tree) => {
    visit(tree, 'code', (node) => {
      const match = /^([^=]*)=(\d*)$/.exec(node.lang ?? '');
      if (!match) return;
      node.lang = match[1] || 'plaintext';
      node.meta = `lines=${match[2] || 1} ${node.meta ?? ''}`.trim();
    });
  };
}

/** Shiki transformer: adds line numbers to blocks marked by `remarkHackmdCode`. */
export const lineNumbers = {
  name: 'hackmd-line-numbers',
  pre(node) {
    const start = /\blines=(\d+)/.exec(this.options.meta?.__raw ?? '')?.[1];
    if (!start) return;
    this.addClassToHast(node, 'has-line-numbers');
    // The CSS counter increments before each line, so start one below.
    node.properties.style = `${node.properties.style ?? ''};--line-start:${Number(start) - 1}`;
  },
};

/**
 * Links between notes are written as relative paths to the .md file
 * (e.g. `[快速冪](../math/fast-power.md)`), so they also work on GitHub and in
 * editors. This turns them into site URLs and fails the build on broken links.
 */
export function remarkNoteLinks() {
  return (tree, file) => {
    visit(tree, 'link', (node) => {
      const [, target, hash = ''] = /^([^:#?]+\.md)(#.*)?$/.exec(node.url) ?? [];
      if (!target) return;
      const absolute = path.resolve(path.dirname(file.path), decodeURI(target));
      if (!fs.existsSync(absolute)) {
        throw new Error(`Broken link "${node.url}" in ${path.relative(NOTES_DIR, file.path)}`);
      }
      node.url = '/' + path.relative(NOTES_DIR, absolute).replace(/\.md$/, '').split(path.sep).join('/') + hash;
    });
  };
}

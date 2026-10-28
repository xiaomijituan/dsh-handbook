import path from 'node:path';

const EXTERNAL = /^[a-z][a-z0-9+.-]*:/i;

export function resolveContentUrl(filePath, url, contentDir) {
  if (!filePath || typeof url !== 'string') return url;
  if (url.startsWith('/') || url.startsWith('#')) return url;
  if (url.startsWith('//') || EXTERNAL.test(url)) return url;

  const hashIndex = url.indexOf('#');
  const hash = hashIndex === -1 ? '' : url.slice(hashIndex);
  const beforeHash = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const queryIndex = beforeHash.indexOf('?');
  const query = queryIndex === -1 ? '' : beforeHash.slice(queryIndex);
  const filePart = queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex);
  if (!filePart.endsWith('.mdx')) return url;

  const target = path.resolve(path.dirname(filePath), filePart);
  const rel = path.relative(contentDir, target).split(path.sep).join('/');
  if (rel.startsWith('../') || path.isAbsolute(rel)) return url;

  let slug = rel.replace(/\.mdx$/, '');
  if (slug === 'index') slug = '';
  else if (slug.endsWith('/index')) slug = slug.slice(0, -'/index'.length);

  return `/${slug}${slug ? '/' : ''}${query}${hash}`;
}

function visitLinks(node, fn) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'link') fn(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) visitLinks(child, fn);
  }
}

export default function remarkContentLinks(options = {}) {
  const contentDir = path.resolve(options.contentDir ?? 'src/content/guide');
  return (tree, file) => {
    visitLinks(tree, (node) => {
      node.url = resolveContentUrl(file.path, node.url, contentDir);
    });
  };
}

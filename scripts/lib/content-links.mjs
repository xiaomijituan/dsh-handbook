import path from 'node:path';

const EXTERNAL = /^[a-z][a-z0-9+.-]*:/i;
const URL_ATTRIBUTES = new Set(['href', 'src', 'poster']);

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

export function prefixBase(url, base) {
  if (!base || typeof url !== 'string') return url;
  if (url.startsWith('//') || EXTERNAL.test(url) || url.startsWith('#')) return url;
  return url.startsWith('/') ? `${base}${url}` : url;
}

function visit(node, dir, base) {
  if (!node || typeof node !== 'object') return;

  if (node.type === 'link' || node.type === 'image') {
    node.url = prefixBase(resolveContentUrl(dir.path, node.url, dir.contentDir), base);
  }

  if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
    for (const attribute of node.attributes ?? []) {
      if (attribute?.type !== 'mdxJsxAttribute' || !URL_ATTRIBUTES.has(attribute.name)) continue;
      if (typeof attribute.value === 'string') attribute.value = prefixBase(attribute.value, base);
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) visit(child, dir, base);
  }
}

export default function remarkContentLinks(options = {}) {
  const contentDir = path.resolve(options.contentDir ?? 'src/content/guide');
  const base = options.base ?? '';
  return (tree, file) => {
    visit(tree, { path: file.path, contentDir }, base);
  };
}

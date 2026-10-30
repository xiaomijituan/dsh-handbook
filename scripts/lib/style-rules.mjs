export const REGISTER_TERMS = [
  '乱子',
  '坑',
  '咬你',
  '炸掉',
  '崩掉',
  '兜底',
  '收口',
  '落定',
  '重打',
  '说白了',
  '其实就是',
  '速查',
  '严拒',
  '顺手',
  '这章',
  '那章',
];

export const SELF_REFERENCES = ['本章', '本节', '这一节', '这里', '这套文章', '本系列', '本文', '本篇'];
export const SELF_REFERENCE_LIMIT = 3;
export const READER_TERM = '读者';
export const DANGLING_PRONOUNS = ['它', '这个', '那种', '前者', '后者'];

const FRONTMATTER = /^---\n[\s\S]*?\n---\n/;
const DISPLAY_KEYS = /^(answer|description|crumb):\s*/;

function frontmatterProse(text) {
  const match = text.match(FRONTMATTER);
  if (!match) return new Map();
  const byLineNumber = new Map();
  let insideFaq = false;
  match[0].split('\n').forEach((raw, index) => {
    if (index === 0 || raw === '---') return;
    if (/^faq:/.test(raw)) insideFaq = true;
    else if (!/^\s/.test(raw) && raw.trim() !== '') insideFaq = false;
    if (insideFaq && /^(\s*)(?:-\s*)?[qa]:\s*\S/.test(raw)) {
      byLineNumber.set(index + 1, raw.replace(/^(\s*)(?:-\s*)?[qa]:\s*/, '$1'));
      return;
    }
    if (DISPLAY_KEYS.test(raw)) byLineNumber.set(index + 1, raw.replace(DISPLAY_KEYS, ''));
  });
  return byLineNumber;
}

export function toProseLines(text) {
  const displayFields = frontmatterProse(text);
  const withoutFrontmatter = text.replace(FRONTMATTER, (match) => match.replace(/[^\n]/g, ' '));
  let inFence = false;
  return withoutFrontmatter.split('\n').map((line, index) => {
    if (/^```/.test(line.trim())) {
      inFence = !inFence;
      return { number: index + 1, prose: '' };
    }
    if (inFence) return { number: index + 1, prose: '' };
    const source = displayFields.get(index + 1) ?? line;
    const prose = source.replace(/`[^`]*`/g, '').replace(/<[^>]*>/g, '');
    return { number: index + 1, prose };
  });
}

function findTerm(line, term) {
  if (term === '怎么验') return /怎么验(?![证])/.test(line);
  if (term === '它') return /(^|[^其])它/.test(line);
  return line.includes(term);
}

export function scanProseLines(lines) {
  const findings = [];
  const selfReferenceCount = {};

  for (const line of lines) {
    if (!line.prose) continue;
    const trimmed = line.prose.trim();
    const isTable = trimmed.startsWith('|');

    for (const term of REGISTER_TERMS) {
      if (findTerm(line.prose, term)) {
        findings.push({ level: 'fail', kind: '语域错位', term, line: line.number, text: trimmed });
      }
    }
    if (line.prose.includes(READER_TERM)) {
      findings.push({ level: 'fail', kind: '人称错位', term: READER_TERM, line: line.number, text: trimmed });
    }
    if (/^#{2,6}\s/.test(trimmed) && /(？|\?|怎么)/.test(trimmed)) {
      findings.push({ level: 'fail', kind: '疑问式标题', term: trimmed, line: line.number, text: trimmed });
    }
    for (const term of SELF_REFERENCES) {
      const occurrences = line.prose.split(term).length - 1;
      if (occurrences > 0) selfReferenceCount[term] = (selfReferenceCount[term] ?? 0) + occurrences;
    }
    if (isTable) continue;
    for (const term of DANGLING_PRONOUNS) {
      if (findTerm(line.prose, term)) {
        findings.push({ level: 'warn', kind: '悬空代词', term, line: line.number, text: trimmed });
      }
    }
  }

  const selfReferenceTotal = Object.values(selfReferenceCount).reduce((sum, count) => sum + count, 0);
  if (selfReferenceTotal > SELF_REFERENCE_LIMIT) {
    const detail = Object.entries(selfReferenceCount)
      .map(([term, count]) => `${term}×${count}`)
      .join(' ');
    findings.push({ level: 'fail', kind: '自称词过量', term: `合计×${selfReferenceTotal}（${detail}）`, line: 0, text: `整页上限 ${SELF_REFERENCE_LIMIT} 次` });
  }

  for (const block of secondPersonBlocks(lines)) {
    const count = block.text.split('你').length - 1;
    if (count > 1) findings.push({ level: 'warn', kind: '第二人称过密', term: `你×${count}`, line: block.number, text: '' });
  }

  return findings;
}

function secondPersonBlocks(lines) {
  const blocks = [];
  let current = null;
  for (const line of lines) {
    if (line.prose === '' || line.prose.startsWith('|') || line.prose.trim() === '') {
      if (current) {
        blocks.push(current);
        current = null;
      }
      continue;
    }
    if (!current) current = { number: line.number, text: '' };
    current.text += line.prose;
  }
  if (current) blocks.push(current);
  return blocks;
}

export function scanText(text) {
  return scanProseLines(toProseLines(text));
}

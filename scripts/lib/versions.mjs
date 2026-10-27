export function parseVersion(value) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-([a-z]+)\.(\d+))?$/.exec(String(value).trim());
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    pre: match[4] ?? null,
    preNum: match[5] ? Number(match[5]) : null,
  };
}

export function minorDistance(a, b) {
  const left = parseVersion(a);
  const right = parseVersion(b);
  if (!left || !right) return Infinity;
  return Math.abs(left.major * 1000 + left.minor - (right.major * 1000 + right.minor));
}

export function evaluatePages(pages, ctx) {
  const errors = [];
  const warnings = [];
  const known = new Set(
    [ctx.npm.latest, ctx.npm.next, ctx.npm.alpha, ctx.ghTag.replace(/^dsh-v/, '')].filter(Boolean),
  );

  for (const page of pages) {
    if (!page.verified) {
      errors.push(`${page.id}: missing verified`);
      continue;
    }
    const { dsh, date } = page.verified;
    if (!parseVersion(dsh)) errors.push(`${page.id}: bad dsh version "${dsh}"`);

    const time = new Date(date).getTime();
    if (Number.isNaN(time)) {
      errors.push(`${page.id}: bad date "${date}"`);
    } else {
      const days = Math.floor((ctx.now - time) / 86400000);
      if (days > 30) warnings.push(`${page.id}: verified ${days} days ago`);
    }

    if (dsh && !known.has(dsh)) warnings.push(`${page.id}: dsh ${dsh} not in current tags`);
    if (ctx.npm.latest && minorDistance(dsh, ctx.npm.latest) > 1) {
      warnings.push(`${page.id}: dsh ${dsh} far from latest ${ctx.npm.latest}`);
    }
  }

  return { errors, warnings };
}

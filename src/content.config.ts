import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const verified = z.object({
  dsh: z.string().regex(/^\d+\.\d+\.\d+(?:-[a-z]+\.\d+)?$/),
  npm_latest: z.string(),
  npm_next: z.string(),
  gh_tag: z.string(),
  date: z.coerce.date(),
  os: z.array(z.enum(['windows', 'macos', 'linux'])).min(1),
});

const guide = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/guide' }),
  schema: z.object({
    title: z.string().min(4).max(60),
    crumb: z.string().max(24).optional(),
    description: z.string().min(20).max(160),
    answer: z.string().min(40).max(220),
    updated: z.coerce.date(),
    verified,
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    keywords: z.array(z.string()).default([]),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    related: z.array(z.string()).default([]),
    noindex: z.boolean().default(false),
  }),
});

export const collections = { guide };

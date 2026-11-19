// Site-wide settings. Edit freely.
export const site = {
  name: 'AI Advantage',
  tagline: 'Learn it. Apply it. Build with it. Lead with it.',
  description:
    'A self-directed guide for IT professionals building practical AI skills — from confident prompting to reusable workflows, agents, AI-assisted coding, and leading AI adoption.',
  // Absolute public URL of the site, used for canonical links, social metadata and the sitemap.
  // Leave empty locally. The GitHub Actions workflow sets SITE_URL automatically at build time.
  url: process.env.SITE_URL || '',
  lang: 'en',
};

// The four phases of the tagline, mapped onto the six stages.
export const phases = [
  { id: 'learn', label: 'Learn it', stages: [1] },
  { id: 'apply', label: 'Apply it', stages: [2] },
  { id: 'build', label: 'Build with it', stages: [3, 4, 5] },
  { id: 'lead', label: 'Lead with it', stages: [6] },
];

// Top navigation. `path` is relative to the site root.
export const nav = [
  { label: 'Learning journey', path: 'journey/' },
  { label: 'Your role', path: 'roles/' },
  { label: 'Resources', path: 'resources/' },
  { label: 'Stay current', path: 'stay-current/' },
  { label: 'Ground rules', path: 'ground-rules/' },
];

// Content for the Home and Ground Rules pages.
// Same formatting rules as the other content files.

export const home = {
  intro:
    'A practical, self-paced guide for IT professionals who want to get genuinely good at using AI at work — from your first confident prompts to reusable workflows, agents and AI-assisted coding. No account, no schedule, no homework. Pick what is useful and come back when you are ready for more.',

  // "Where to begin" — three quick entry points. `link` is a site path; `resource` is an id from resources.mjs.
  startPaths: [
    {
      label: 'New to AI assistants',
      text: 'Build an accurate mental model first. It makes everything else easier.',
      link: 'journey/understand/',
      linkText: 'Start with Stage 1',
      resource: 'claude-ai-fluency',
    },
    {
      label: 'Already using ChatGPT or Claude',
      text: 'Make it a daily habit on real tasks, then turn what works into something reusable.',
      link: 'journey/apply/',
      linkText: 'Go to Stage 2',
      resource: 'openai-ai-at-work',
    },
    {
      label: 'Ready to build',
      text: 'Skills, agents and coding tools — with the judgment to use them safely.',
      link: 'journey/reusable-workflows/',
      linkText: 'Jump to Stage 3',
      resource: 'claude-skills-course',
    },
  ],

  principles: [
    {
      title: 'You choose the path',
      text: 'Six stages to explore in any order. Skip what you know.',
    },
    {
      title: 'Real work, safe data',
      text: 'Every exercise uses synthetic or public information — never your employer’s.',
    },
    {
      title: 'Concepts outlast products',
      text: 'We point out which skills transfer between ChatGPT, Claude and whatever comes next.',
    },
    {
      title: 'Trusted sources, not a stale catalog',
      text: 'We link to maintained course catalogs and official documentation.',
    },
  ],
};

export const groundRules = {
  intro:
    'AI tools are genuinely useful and genuinely fallible. These rules apply at every stage of the journey. They are not about fear — they are what makes you credible when you start recommending AI to others.',
  rules: [
    {
      title: 'Keep employer and client data out of personal accounts',
      text: 'Unless your organization has explicitly authorized it, do not paste or upload confidential, personal, client or proprietary information into a personal AI subscription. That includes code, customer records, financials, internal strategy and anything under NDA. When in doubt, it does not go in.',
    },
    {
      title: 'Practice with synthetic or public data',
      text: 'Every exercise on this site can be done with fictional or public information. AI assistants are excellent at generating realistic practice material — see below.',
    },
    {
      title: 'Verify before you rely',
      text: 'Treat AI output as a draft from a fast, well-read colleague who sometimes makes things up. Check facts, figures, citations and quotes against sources. The more consequential the use, the more thorough the check.',
    },
    {
      title: 'Review generated requirements and analysis',
      text: 'AI can invent requirements, smooth over ambiguities and miscalculate. Check that every requirement traces to a real source, and that every number can be reproduced from code or a formula you can see.',
    },
    {
      title: 'Understand code before you run it',
      text: 'Ask the assistant to explain anything you do not understand. Use Git so you can undo changes, and tests so you know things work. Never put passwords, API keys or tokens in prompts or code.',
    },
    {
      title: 'Do not connect employer systems without approval',
      text: 'Connectors, MCP servers, browser extensions and agents can read and act on whatever they can reach. Do not connect them to work email, files, repositories or business systems without your organization’s permission.',
    },
    {
      title: 'Give agents the least access they need',
      text: 'Start read-only. Require approval for actions that send, delete, buy, publish or change things. Remember that content an agent reads — a web page, a document, an email — can contain instructions designed to manipulate it.',
    },
    {
      title: 'Keep humans accountable',
      text: 'AI can inform a decision; it should not own one. Be open about where AI contributed to your work, follow your organization’s policies, and keep the final judgment with a person.',
    },
  ],

  syntheticTitle: 'Make your own practice data',
  syntheticIntro:
    'Ask any assistant to generate realistic fictional material for exercises. Include deliberate problems so you can test whether your workflow catches them.',
  syntheticPrompt:
    'Create realistic but entirely fictional practice material for a [project manager / business analyst / product owner / data analyst].\nScenario: a mid-sized company replacing its customer support ticketing system.\nGenerate:\n- 6 weekly status updates from different team members\n- notes from 2 stakeholder meetings\n- an issue log with 10 entries\nInclude, without pointing them out: two conflicting statements, one slipping milestone, one risk nobody has logged, and one action with no owner.\nUse invented names and companies only.',
  syntheticDataNote:
    'For data exercises, prefer real public datasets — they contain the messiness that synthetic data often lacks. See [public datasets](/resources/?topic=data).',

  policyTitle: 'If your organization has no AI policy yet',
  policyText:
    'Many don’t. Assume the strictest reasonable interpretation: no confidential data in personal tools, no connected work systems, and no AI-generated output shared as fact without review. Raising the question with your manager or IT/security team is itself a useful contribution — and an early step toward becoming a trusted AI champion.',
};

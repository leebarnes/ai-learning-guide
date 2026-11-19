// The six learning stages.
//
// Text fields support a tiny bit of formatting: **bold**, `code`, and [link text](https://url).
// Blank lines ("\n\n") separate paragraphs in longer fields.
// `resources` lists ids from resources.mjs — the build fails if an id doesn't exist.

export const stages = [
  {
    number: 1,
    slug: 'understand',
    title: 'Understand AI',
    phase: 'learn',
    short: 'How modern AI assistants actually work, where they fail, and how to use them responsibly.',
    outcome: 'Become a confident, skeptical, responsible AI user.',
    whatItMeans:
      'Building an accurate mental model of large language models (LLMs): what they are good at, why they sometimes produce confident nonsense, and what changes when you give them better context. You do not need any math or programming for this stage.',
    whyItMatters:
      'Almost every disappointing AI experience comes from a mismatched mental model — treating the assistant as a search engine, an oracle, or a mind reader. An hour spent here makes everything later faster and safer, and it is the knowledge colleagues will most often ask you about.',
    learn: [
      {
        title: 'What an LLM is, practically',
        text: 'A model trained on huge amounts of text to predict likely continuations. It has no live access to facts unless a tool gives it one, and its knowledge stops at a training cutoff.',
      },
      {
        title: 'Capabilities and limits',
        text: 'Strong at drafting, summarizing, restructuring, explaining and critiquing. Weaker at exact arithmetic, niche facts, recent events and anything it cannot see. Capabilities improve quickly, so re-test your assumptions every few months.',
      },
      {
        title: 'Prompting and context',
        text: 'The biggest lever is context: who the audience is, what “good” looks like, examples, constraints, and source material. Clever wording matters far less than clear information.',
      },
      {
        title: 'Hallucinations and verification',
        text: 'Models can invent citations, numbers and details that sound plausible. Verify anything factual, legal, numerical or consequential — and ask the model to show its sources and assumptions.',
      },
      {
        title: 'Reasoning vs. general-purpose models',
        text: 'Reasoning (or “thinking”) modes spend more time working through a problem before answering. They help with analysis, planning and tricky logic; fast modes are fine for drafting and quick edits.',
      },
      {
        title: 'Privacy and responsible use',
        text: 'Know what your account does with your data, what your employer allows, and what must never be pasted into a personal tool. See the [ground rules](/ground-rules/).',
      },
    ],
    canDo: [
      'Explain in plain language what an LLM is and why it can be wrong.',
      'Write a prompt that supplies role, audience, context, constraints and a desired format.',
      'Spot answers that need verification and check them efficiently.',
      'Choose between a fast mode and a reasoning mode for a given task.',
      'Decide what information is and isn’t appropriate to share with a personal AI account.',
    ],
    exercises: [
      {
        title: 'Catch a hallucination',
        time: '15 minutes',
        steps: [
          'Ask your assistant about a narrow topic you know very well — an obscure feature of a tool you use, or a niche part of your industry.',
          'Ask for specific facts, numbers and sources.',
          'Check each claim. Note which were correct, which were vague, and which were invented.',
          'Ask the assistant to re-answer, this time saying “if you are not sure, say so.” Compare.',
        ],
      },
      {
        title: 'Same task, three prompts',
        time: '20 minutes',
        steps: [
          'Pick a realistic task, such as explaining a technical change to non-technical stakeholders.',
          'Try a one-line prompt. Then a prompt that adds the audience and purpose. Then one that adds an example of the tone you want and the format.',
          'Compare the three results and write down which additions mattered most.',
        ],
        prompt:
          'You are helping me explain a technical change to a non-technical audience.\nAudience: department heads who care about cost, risk and timing.\nChange: [describe a fictional or public example]\nGoal: they should understand what changes for them and what they need to do.\nFormat: under 200 words, a one-line summary first, then three short bullets.\nIf anything is ambiguous, ask me before writing.',
      },
    ],
    transferable:
      'Everything in this stage applies to ChatGPT, Claude, Copilot, Gemini and whatever comes next. Product names and model versions change; the underlying behaviour of LLMs is remarkably consistent.',
    watchOut: [
      'Fluent, confident writing is not evidence of accuracy.',
      'Model knowledge has a cutoff date unless web search or another tool is in use — check which is happening.',
    ],
    resources: [
      'claude-ai-fluency',
      'openai-academy',
      'dlai-genai-for-everyone',
      'dlai-ai-for-everyone',
      'claude-prompting-docs',
      'ms-genai-intro',
    ],
  },

  {
    number: 2,
    slug: 'apply',
    title: 'Apply AI to Everyday Work',
    phase: 'apply',
    short: 'Use AI as a daily working partner for research, writing, analysis and review.',
    outcome: 'Use AI regularly to improve speed, quality and consistency.',
    whatItMeans:
      'Moving from occasional experiments to habitual use on real tasks: synthesizing research, drafting and reviewing deliverables, working with documents and spreadsheets, and getting structured output you can drop straight into your work.',
    whyItMatters:
      'This is where most of the day-to-day value is. The skill is less about “prompt tricks” and more about knowing which parts of your work to hand over, how to iterate, and how to review the result quickly.',
    learn: [
      {
        title: 'Research and synthesis',
        text: 'Use AI to summarize long material, compare sources, extract themes and identify open questions — while keeping track of what came from which source.',
      },
      {
        title: 'Documents and spreadsheets',
        text: 'Upload files (when appropriate) and ask for summaries, comparisons, extractions or analysis. For spreadsheets, ask the assistant to show its working or the formula it used.',
      },
      {
        title: 'Drafting and reviewing',
        text: 'AI is often more valuable as a reviewer than as a writer: ask it to critique a draft against a checklist, find gaps, or argue the opposite position.',
      },
      {
        title: 'Structured outputs',
        text: 'Ask for tables, numbered lists, JSON, or a fixed template. Structured output is easier to check, compare and reuse.',
      },
      {
        title: 'Iterative collaboration',
        text: 'Treat the first answer as a draft. Push back, ask “what did you assume?”, give corrections, and ask for alternatives. The conversation is the tool.',
      },
      {
        title: 'Improving existing work',
        text: 'Point AI at things you already produce — status reports, requirements, analysis write-ups — and ask how to make them clearer, shorter or more consistent.',
      },
    ],
    canDo: [
      'Name three recurring tasks where AI saves you meaningful time.',
      'Produce a structured deliverable (table, checklist, template) from messy input.',
      'Use AI to review your own work against explicit criteria.',
      'Iterate deliberately instead of accepting or abandoning the first answer.',
    ],
    exercises: [
      {
        title: 'Reviewer, not writer',
        time: '20 minutes',
        steps: [
          'Take something you wrote recently that contains nothing confidential (or rewrite it with fictional details).',
          'Ask the assistant to review it as a skeptical stakeholder and list the five most important weaknesses.',
          'Decide which critiques are valid. Revise it yourself, then ask for a second review.',
        ],
        prompt:
          'Review the draft below as a skeptical senior stakeholder.\nList the 5 most important weaknesses, most serious first.\nFor each: quote the passage, explain the problem, and suggest a fix.\nDo not rewrite the whole document.\n\n[paste draft]',
      },
      {
        title: 'Messy notes to structured table',
        time: '15 minutes',
        steps: [
          'Ask the assistant to generate a page of realistic but fictional meeting notes for your type of work.',
          'In a new message, ask it to extract decisions, actions (owner, due date) and open questions into a table.',
          'Check every row against the notes. Did it invent owners or dates? Ask it to mark anything not stated as “not specified”.',
        ],
      },
    ],
    transferable:
      'Uploading files, asking for structured output and iterating work in every major assistant. Exact limits (file sizes, which file types, whether code runs on your spreadsheet) differ by product and plan.',
    watchOut: [
      'Summaries can silently drop the one detail that mattered. Spot-check against the source.',
      'Do not upload employer or client documents to a personal account unless you are authorized to.',
    ],
    resources: [
      'openai-ai-at-work',
      'claude-101',
      'ms-copilot-path',
      'dlai-genai-for-everyone',
      'claude-prompting-docs',
    ],
  },

  {
    number: 3,
    slug: 'reusable-workflows',
    title: 'Create Reusable Workflows and Skills',
    phase: 'build',
    short: 'Turn your best prompts into instructions, projects, templates and skills you can reuse.',
    outcome: 'Move beyond one-off prompting into repeatable, validated solutions.',
    whatItMeans:
      'Capturing what works so you stop re-explaining it: saved instructions, project spaces with standing context, templates for consistent output, and packaged “skills” the assistant can load when a task calls for them.',
    whyItMatters:
      'One-off prompting does not scale and is hard to share. A reusable workflow can be tested, improved, handed to a colleague and trusted — which is the difference between a personal trick and an organizational asset.',
    learn: [
      {
        title: 'Reusable prompts and instructions',
        text: 'Write instructions once — role, audience, standards, output format, what to do when information is missing — and reuse them. Custom instructions and custom GPTs/assistants are forms of this.',
      },
      {
        title: 'Projects and context management',
        text: 'Project spaces let you attach reference documents and standing instructions to a body of work. Learn what to include, what to leave out, and how stale context causes errors.',
      },
      {
        title: 'Structured workflows',
        text: 'Break a task into steps (gather → analyse → draft → check) with a clear output at each stage. Smaller steps are easier to verify and improve.',
      },
      {
        title: 'Skills and reusable task definitions',
        text: 'Skills package instructions, examples and sometimes scripts into a folder that an assistant loads on demand. Claude supports Agent Skills; other tools offer similar concepts under different names.',
      },
      {
        title: 'Templates and standard outputs',
        text: 'A good template defines the sections, the level of detail, and the rules — e.g. “flag missing information rather than inventing it.”',
      },
      {
        title: 'Prompt vs. skill vs. workflow',
        text: 'Use a prompt for one-off tasks; a saved instruction or skill for a task you repeat with the same standards; a multi-step workflow when the task has distinct stages that each need checking.',
      },
    ],
    canDo: [
      'Write a reusable instruction set that produces consistent output for a recurring task.',
      'Set up a project space with appropriate reference material.',
      'Test a workflow against several inputs, including awkward ones, and improve it.',
      'Explain when to use a prompt, a skill, or a multi-step workflow.',
    ],
    exercises: [
      {
        title: 'Build and test a reusable instruction',
        time: '45 minutes',
        steps: [
          'Pick a task you do at least weekly (status update, meeting summary, requirement review).',
          'Write instructions covering: purpose, audience, required sections, quality rules, and what to do when input is incomplete.',
          'Create three fictional test inputs: a typical one, an incomplete one, and a contradictory one.',
          'Run all three. Fix the instructions wherever the output was wrong. Repeat until all three pass.',
        ],
        prompt:
          'Purpose: Turn raw meeting notes into a decision log.\nAudience: project team and sponsor.\nOutput: a table with Decision | Rationale | Owner | Date | Source quote.\nRules:\n- Only record decisions explicitly stated in the notes.\n- If an owner or date is not stated, write "Not specified" — never guess.\n- After the table, list any statements that sound like decisions but are ambiguous.',
      },
      {
        title: 'Write your first skill',
        time: '60 minutes',
        steps: [
          'Read an introduction to Agent Skills (see resources below).',
          'Turn the instruction you built above into a skill: a short description of when to use it, the instructions, and one worked example.',
          'Test whether the assistant picks it up when you describe the task naturally, without naming the skill.',
        ],
      },
    ],
    transferable:
      'The craft — clear instructions, good examples, explicit rules for missing information, testing against edge cases — transfers everywhere. The packaging differs: Projects, custom GPTs, Gems, Copilot agents and Agent Skills are vendor-specific containers for the same idea.',
    watchOut: [
      'A workflow that worked once is not validated. Test it with awkward inputs.',
      'Project knowledge goes stale. Review attached documents periodically.',
    ],
    resources: ['claude-skills-course', 'claude-skills-docs', 'claude-101', 'openai-academy', 'claude-prompting-docs'],
  },

  {
    number: 4,
    slug: 'agents',
    title: 'Understand Agents and Integrations',
    phase: 'build',
    short: 'How AI systems use tools, connect to other software and carry out multi-step work.',
    outcome: 'Understand how to delegate multistep work to AI systems safely.',
    whatItMeans:
      'An agent is an AI system that pursues a goal by deciding which actions to take — searching, reading files, calling tools, writing results — and checking its progress, rather than answering a single message. Integrations such as the Model Context Protocol (MCP) let agents connect to other systems.',
    whyItMatters:
      'Agents are where AI moves from advising you to acting for you. That brings real leverage and real risk. Knowing how they work lets you evaluate claims, design sensible human checkpoints, and recognise when a simpler approach is better.',
    learn: [
      {
        title: 'Agent vs. chatbot',
        text: 'A chatbot responds; an agent plans, acts with tools, observes results and continues until a goal is reached or it needs help.',
      },
      {
        title: 'Tool use and integrations',
        text: 'Models call tools — web search, code execution, file access, business applications — by producing structured requests that software then carries out.',
      },
      {
        title: 'Model Context Protocol (MCP)',
        text: 'An open standard for connecting AI applications to data sources and tools. An MCP server exposes capabilities once; any compatible AI client can use them.',
      },
      {
        title: 'Planning, execution and human-in-the-loop',
        text: 'Good agent designs make plans visible, pause for approval before consequential actions, and keep humans accountable for outcomes.',
      },
      {
        title: 'Permissions and safety boundaries',
        text: 'Give agents the least access needed. Read-only before write. Sandbox before production. Be wary of instructions hidden in content the agent reads (prompt injection).',
      },
      {
        title: 'Reliability — and when not to use an agent',
        text: 'Small error rates compound over many steps. Measure on realistic test cases. If a fixed workflow or a single prompt does the job, it is usually cheaper, faster and more predictable.',
      },
    ],
    canDo: [
      'Explain the difference between a chatbot, a workflow and an agent.',
      'Describe what MCP is and why it matters, in two sentences.',
      'Design human approval points for an agent task.',
      'Identify permission and data risks before connecting a tool.',
      'Argue convincingly when an agent is not the right solution.',
    ],
    exercises: [
      {
        title: 'Watch an agent work',
        time: '30 minutes',
        steps: [
          'Use an agentic feature you already have access to — such as a deep research mode or an agent mode in ChatGPT or Claude — on a public topic.',
          'Read the steps it shows: what did it search, read, decide?',
          'Verify three claims in the final output. Note where the process was strong and where it cut corners.',
        ],
      },
      {
        title: 'Design an agent on paper',
        time: '30 minutes',
        steps: [
          'Pick a multistep task from your role (see [your role](/roles/)).',
          'List: the goal, the tools it would need, the data it would touch, and what it must never do.',
          'Mark each step as “agent decides”, “human approves”, or “human does”.',
          'Ask an AI assistant to critique your design for risks you missed.',
        ],
      },
    ],
    transferable:
      'Agent concepts — tools, planning loops, permissions, evaluation — are vendor-neutral, and MCP is an open standard supported by multiple vendors. Specific agent products and their capabilities change quickly; read current documentation before relying on any of them.',
    watchOut: [
      'Never connect an employer system, mailbox or data source to a personal AI tool without approval.',
      'Content an agent reads (web pages, emails, documents) can contain instructions designed to manipulate it.',
      'Demos show the successful run. Ask how often it fails.',
    ],
    resources: ['dlai-agentic-ai', 'mcp-site', 'claude-mcp-course', 'dlai-mcp', 'ms-genai-intro', 'nist-ai-rmf'],
  },

  {
    number: 5,
    slug: 'ai-assisted-coding',
    title: 'Explore AI-Assisted Coding',
    phase: 'build',
    short: 'Build small scripts, tools and automations with Claude Code, Codex and similar tools.',
    outcome: 'Build useful lightweight tools and automations without necessarily becoming a professional developer.',
    whatItMeans:
      'Using coding agents — such as Claude Code and OpenAI Codex — to create and modify scripts and simple applications, while learning enough fundamentals (files, terminals, Git, a little Python and SQL) to understand, test and review what they produce.',
    whyItMatters:
      'Many valuable automations are small: a script that cleans a weekly export, a report generator, a simple internal web page. AI coding tools put these within reach of non-developers — but only people who can review and test the output can use them responsibly.',
    learn: [
      {
        title: 'Basic development concepts',
        text: 'Files and folders, the terminal, running a program, dependencies, and what “environment” means. Just enough to follow what a coding agent is doing.',
      },
      {
        title: 'Git and version control',
        text: 'Commits are save points you can return to. Using Git means an AI mistake is an inconvenience, not a disaster.',
      },
      {
        title: 'Python and SQL fundamentals',
        text: 'Enough to read a script and a query and roughly understand them. Python for automation and data work; SQL for asking questions of databases.',
      },
      {
        title: 'Claude Code and OpenAI Codex',
        text: 'Coding agents that read your project, propose changes, run commands and iterate. Learn how they ask for permission and how to review their changes.',
      },
      {
        title: 'Testing, debugging and review',
        text: 'Ask for tests, run them, read the diff, and ask the agent to explain any line you do not understand. Never run code you cannot roughly explain.',
      },
      {
        title: 'Limits and risks',
        text: 'Generated code can be insecure, subtly wrong, or depend on packages that do not exist. Keep credentials out of code, work on copies of data, and do not deploy anything others rely on without review.',
      },
    ],
    canDo: [
      'Use the terminal and Git to create a project and save your progress.',
      'Ask a coding agent to build a small script and run it safely.',
      'Read a short Python script or SQL query and explain what it does.',
      'Write or request tests, and check that they actually test something.',
      'Know when a tool needs a professional developer’s review.',
    ],
    exercises: [
      {
        title: 'Your first script with a coding agent',
        time: '60 minutes',
        steps: [
          'Create an empty folder and run `git init` in it.',
          'Download a small public CSV dataset (see [resources](/resources/?topic=data)).',
          'Ask Claude Code or Codex to write a Python script that summarizes the file — row counts, missing values, basic statistics — and saves a short report.',
          'Read the script before running it. Ask the agent to explain anything unclear. Run it, check the numbers against the file, and commit.',
        ],
      },
      {
        title: 'Break it on purpose',
        time: '30 minutes',
        steps: [
          'Feed your script a file with a missing column, blank rows and a text value in a numeric column.',
          'Watch what happens. Ask the agent to add validation and clear error messages, plus tests for each case.',
          'Run the tests yourself and confirm they fail if you undo the fix.',
        ],
      },
    ],
    transferable:
      'Git, the terminal, Python, SQL and the habit of reviewing and testing are permanent skills. Claude Code, Codex, GitHub Copilot and Cursor differ in interface and pricing but follow the same pattern: describe, review, run, test, commit.',
    watchOut: [
      'Never paste passwords, API keys or tokens into prompts or code.',
      'Coding agents can run commands on your machine. Read permission requests before approving them.',
      'Do not point a coding agent at an employer repository without permission.',
    ],
    resources: [
      'claude-code-course',
      'codex-docs',
      'dlai-claude-code',
      'git-book',
      'kaggle-learn',
      'sqlbolt',
      'python-beginners',
      'claude-code-docs',
    ],
  },

  {
    number: 6,
    slug: 'ai-champion',
    title: 'Become an AI Champion',
    phase: 'lead',
    short: 'Find valuable use cases, build credible demos and help your organization adopt AI responsibly.',
    outcome: 'Become a credible source of practical AI knowledge and leadership within an organization.',
    whatItMeans:
      'Turning personal skill into organizational value: spotting the right opportunities, being honest about feasibility and risk, building convincing prototypes, and explaining AI to colleagues without hype or fear.',
    whyItMatters:
      'In organizations where AI adoption is immature, people who combine hands-on experience with sound judgment are rare and valuable. Credibility comes from realistic claims, careful demonstrations and respect for governance — not enthusiasm.',
    learn: [
      {
        title: 'Identifying valuable use cases',
        text: 'Look for frequent, text-heavy, time-consuming tasks with clear quality criteria and tolerance for review. Start with your own team’s pain points.',
      },
      {
        title: 'Feasibility and risk',
        text: 'Consider data sensitivity, error consequences, required integrations, policy constraints and who reviews output. A small reliable win beats an ambitious fragile one.',
      },
      {
        title: 'Realistic benefits',
        text: 'Measure before and after on real tasks. Count review time, not just generation time. Include quality and consistency, not only speed.',
      },
      {
        title: 'Demonstrations and prototypes',
        text: 'Use synthetic or public data, show failures as well as successes, and make the human review step visible.',
      },
      {
        title: 'Communicating with non-technical colleagues',
        text: 'Explain what it does, where it fails, what it costs and who stays accountable. Avoid jargon and avoid overclaiming.',
      },
      {
        title: 'Evaluating new tools and staying current',
        text: 'Have a repeatable way to test a new tool on your own tasks. Follow release notes and documentation — see [Stay current](/stay-current/).',
      },
    ],
    canDo: [
      'Write a one-page use-case proposal with benefits, risks and a measurement plan.',
      'Run a short, honest demo for colleagues using non-confidential data.',
      'Evaluate a new AI tool against a consistent checklist.',
      'Answer common colleague questions about AI accurately.',
    ],
    exercises: [
      {
        title: 'Use-case one-pager',
        time: '45 minutes',
        steps: [
          'Pick one task you have improved with AI in earlier stages.',
          'Write: the problem, the current effort, the AI-assisted approach, the review step, data and policy considerations, and how you would measure the benefit.',
          'Ask an AI assistant to challenge it as a risk-averse manager would. Revise.',
        ],
        prompt:
          'Act as a risk-averse operations manager reviewing this AI use-case proposal.\nList your top concerns about data, reliability, cost, accountability and change management.\nFor each concern, say what evidence would reassure you.\n\n[paste proposal]',
      },
      {
        title: 'A personal tool-evaluation checklist',
        time: '30 minutes',
        steps: [
          'Write 5–8 realistic test tasks from your role, with what a good answer looks like.',
          'Run them on two different assistants or modes and score the results.',
          'Keep the checklist. Re-run it whenever a significant new model or tool is released.',
        ],
      },
    ],
    transferable:
      'Use-case selection, risk assessment, measurement and communication are entirely vendor-neutral and will outlast any specific tool.',
    watchOut: [
      'Follow your organization’s AI policy. If there is none, ask before acting as if there were.',
      'Overpromising is the fastest way to lose credibility.',
    ],
    resources: ['dlai-ai-for-everyone', 'openai-academy', 'nist-ai-rmf', 'pmi-ai-hub', 'the-batch', 'simon-willison'],
  },
];

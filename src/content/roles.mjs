// Role-specific guidance. Foundational material lives in stages.mjs — role pages link to it
// rather than repeating it. Same formatting rules as stages.mjs: **bold**, `code`, [text](url),
// and links beginning with "/" are resolved relative to the site root.
//
// `stage` fields refer to stage numbers (1–6). `resources` lists ids from resources.mjs.

export const roles = [
  {
    slug: 'product-owner',
    title: 'Technical Product Owner',
    short: 'Discovery, user stories, acceptance criteria and backlog quality.',
    intro:
      'Product ownership is full of structured writing, ambiguity-hunting and synthesis — all things AI assistants do well, provided you stay the judge of what the product actually needs. The biggest risk is AI that confidently fills gaps with invented requirements, so a recurring theme here is making missing information visible.',
    focus: [
      'Product discovery',
      'Requirements and user stories',
      'Acceptance criteria',
      'Backlog refinement',
      'Product research',
      'Dependencies and ambiguities',
    ],
    useCases: [
      {
        title: 'Draft user stories from a feature idea',
        text: 'Turn a rough feature description into candidate stories — then use your judgment to split, merge and prioritize.',
      },
      {
        title: 'Stress-test acceptance criteria',
        text: 'Ask for edge cases, negative paths and testability problems in criteria you have written.',
      },
      {
        title: 'Find ambiguity before refinement',
        text: 'Have the assistant list every vague term, undefined actor and unstated assumption in a backlog item.',
      },
      {
        title: 'Synthesize discovery research',
        text: 'Cluster public reviews, survey comments or (fictional) interview notes into themes, with supporting quotes.',
      },
      {
        title: 'Competitive and market scans',
        text: 'Use research modes to compile public information on comparable products — and verify the claims before sharing.',
      },
      {
        title: 'Release notes and stakeholder updates',
        text: 'Convert technical change lists into audience-specific summaries.',
      },
    ],
    learningAreas: [
      { stage: 1, note: 'Especially hallucinations — invented requirements look exactly like real ones.' },
      { stage: 2, note: 'Structured outputs: stories, criteria and test scenarios in consistent templates.' },
      { stage: 3, note: 'Your story-writing standards are an ideal first reusable skill.' },
      { stage: 4, note: 'Understand what a backlog-reviewing agent could and could not safely do.' },
    ],
    beginner: [
      {
        title: 'Find the gaps',
        text: 'Write a deliberately vague fictional feature request. Ask the assistant to list every question a developer would need answered. Compare with your own list.',
      },
      {
        title: 'Criteria critique',
        text: 'Give the assistant a story with acceptance criteria and ask which criteria are untestable, ambiguous or missing negative cases.',
      },
    ],
    intermediate: {
      title: 'Feature-to-story workflow',
      text: 'Create a reusable workflow that transforms feature descriptions into draft user stories, acceptance criteria (Given/When/Then) and test scenarios — and that **flags missing information rather than inventing requirements**.',
      steps: [
        'Write instructions defining your story template, acceptance-criteria format and quality rules.',
        'Add an explicit rule: anything not stated in the input goes into an “Open questions” section, never into the stories.',
        'Test it on three fictional features: one clear, one vague, one with contradictory requirements.',
        'Package it as a project instruction set or a skill so you can reuse it.',
      ],
      prompt:
        'You turn feature descriptions into draft backlog items.\nFor the feature below, produce:\n1. User stories ("As a… I want… so that…").\n2. Acceptance criteria in Given/When/Then form for each story.\n3. Test scenarios, including negative and edge cases.\n4. Open questions: anything you would otherwise have to assume.\nRules: do not invent business rules, users, data fields or integrations. If it is not in the description, it belongs in Open questions.\n\nFeature: [paste fictional feature description]',
    },
    advanced: {
      title: 'Supervised backlog-review agent',
      text: 'Build a supervised agent that reviews backlog items for completeness, inconsistencies and dependencies, producing a report for you to act on. Run it on an exported, fictional or sanitized backlog (a CSV is fine) — not a live connection to your employer’s tools unless that is approved.',
      steps: [
        'Define the checks: missing criteria, vague terms, duplicate stories, conflicting rules, implied dependencies.',
        'Start as a skill run against a file; graduate to a coding agent that processes the file and writes a report.',
        'Keep the agent read-only. You decide what changes.',
        'Measure: how many of its flags were genuinely useful?',
      ],
    },
    resources: ['claude-ai-fluency', 'claude-101', 'claude-skills-course', 'openai-ai-at-work', 'iiba'],
  },

  {
    slug: 'project-manager',
    title: 'Project Manager',
    short: 'Planning, risk, RAID logs, status reporting and meeting synthesis.',
    intro:
      'Project managers live in a stream of updates, meetings and logs. AI can turn that stream into structured, consistent outputs and help you see risks earlier — but schedules, commitments and judgments about people remain yours. Treat AI-produced plans as starting points to challenge, not answers.',
    focus: [
      'Project planning',
      'Risk identification',
      'Status reporting',
      'RAID logs',
      'Meeting synthesis',
      'Schedule and dependency analysis',
    ],
    useCases: [
      {
        title: 'Meeting notes to actions',
        text: 'Extract decisions, actions, owners and open questions — with “not specified” where the notes are silent.',
      },
      {
        title: 'First-draft plans and WBS',
        text: 'Generate a work breakdown or plan skeleton for a project type, then correct it with your real constraints.',
      },
      {
        title: 'Risk brainstorming',
        text: 'Ask for risks by category (technical, people, vendor, regulatory) and for early warning signs of each.',
      },
      {
        title: 'Consistent status reports',
        text: 'Turn raw updates into a standard status format, with RAG ratings you then confirm.',
      },
      {
        title: 'RAID log hygiene',
        text: 'Check a RAID log for stale items, missing owners, duplicates and issues that should be risks (or vice versa).',
      },
      {
        title: 'Difficult communications',
        text: 'Draft and rehearse messages about delays, scope changes or escalations; ask for the stakeholder’s likely reaction.',
      },
    ],
    learningAreas: [
      { stage: 1, note: 'Verification — AI-generated plans and estimates can look authoritative and be wrong.' },
      { stage: 2, note: 'Meeting synthesis and structured reporting are your fastest wins.' },
      { stage: 3, note: 'A reusable status-report workflow pays off every week.' },
      { stage: 6, note: 'Project managers are well placed to run AI pilots and measure benefits.' },
    ],
    beginner: [
      {
        title: 'Notes to RAID',
        text: 'Ask the assistant to generate realistic fictional meeting notes for a software rollout, then extract risks, assumptions, issues and dependencies into a RAID table. Check each row against the notes.',
      },
      {
        title: 'Pre-mortem',
        text: 'Describe a fictional project and ask: “It is six months from now and this project failed. Give the ten most likely reasons.” Turn the useful ones into risks.',
      },
    ],
    intermediate: {
      title: 'Project health report workflow',
      text: 'Build a reporting workflow that combines synthetic status updates, milestones and an issue log into a consistent project health report.',
      steps: [
        'Have the assistant generate a fictional project: 8–10 weekly status updates, a milestone list and an issue log (save each as a file).',
        'Write instructions for your report format: overall status, milestone progress, top risks, decisions needed, and a short narrative.',
        'Require the report to cite which update or log entry supports each statement.',
        'Run it, check every claim, refine the instructions, and save as a reusable project or skill.',
      ],
      prompt:
        'Using only the attached status updates, milestone list and issue log, produce a project health report:\n- Overall status (Green/Amber/Red) with a one-sentence justification.\n- Milestones: planned vs. forecast date, with variance.\n- Top 5 risks or issues, each with the source entry it comes from.\n- Decisions needed from the sponsor.\nIf the sources conflict, show the conflict rather than resolving it. Do not add information that is not in the sources.',
    },
    advanced: {
      title: 'Risk-scanning agent with human review',
      text: 'Build an agent that analyzes project information, identifies emerging risks and drafts recommendations — for a human to review before anything is shared.',
      steps: [
        'Use your synthetic project files from the intermediate project, adding a few hidden warning signs (slipping dates, a recurring blocker, an overloaded owner).',
        'Use a coding agent to build a script or skill that reads the files and produces a risk briefing with evidence.',
        'Test whether it finds the warning signs you planted — and whether it raises false alarms.',
        'Write down exactly where a human must approve before output reaches stakeholders.',
      ],
    },
    resources: ['pmi-ai', 'pmi-practical-ai', 'pmi-ai-hub', 'openai-ai-at-work', 'claude-ai-fluency', 'ms-copilot-path'],
  },

  {
    slug: 'data-analyst',
    title: 'Data Analyst',
    short: 'Exploration, data quality, SQL, Python, visualization and validation.',
    intro:
      'AI can write queries, generate analysis code, suggest visualizations and explain results — which makes analytical rigor more important, not less. Every number an AI produces must be traceable to code you can rerun. Data analysts often move fastest into AI-assisted coding, so Stage 5 is especially relevant.',
    focus: ['Data exploration', 'Data quality', 'SQL', 'Python', 'Data visualization', 'Analytical validation', 'Reporting automation'],
    useCases: [
      {
        title: 'Write and explain SQL',
        text: 'Describe the question and the schema; get a query plus a plain-English explanation. Test it on data where you know the answer.',
      },
      {
        title: 'Exploratory analysis',
        text: 'Upload a public dataset and ask for a profile: distributions, missing values, outliers, candidate questions.',
      },
      {
        title: 'Data-quality checks',
        text: 'Generate validation rules and the code to apply them — type checks, ranges, duplicates, referential integrity.',
      },
      {
        title: 'Visualization choices',
        text: 'Ask which chart fits the message, then have the assistant generate the plotting code.',
      },
      {
        title: 'Explaining results',
        text: 'Draft plain-language explanations of findings for different audiences, including caveats and limitations.',
      },
      {
        title: 'Code review and refactoring',
        text: 'Ask an assistant to review your existing scripts for bugs, edge cases and readability.',
      },
    ],
    learningAreas: [
      { stage: 1, note: 'Assistants can miscalculate in text. Insist on code execution for any number.' },
      { stage: 2, note: 'Working with spreadsheets and files; asking for the method, not just the answer.' },
      { stage: 5, note: 'Python, SQL, Git and coding agents — your highest-leverage stage.' },
      { stage: 4, note: 'MCP connections to databases are powerful; learn the permission risks first.' },
    ],
    beginner: [
      {
        title: 'Profile a public dataset',
        text: 'Download a public CSV (e.g. from data.gov or Kaggle). Ask an assistant with code execution to profile it. Verify three of its statistics yourself in a spreadsheet.',
      },
      {
        title: 'Query explain-back',
        text: 'Paste a SQL query you understand and ask for an explanation. Then paste one you don’t, and test whether the explanation matches what the query actually returns.',
      },
    ],
    intermediate: {
      title: 'AI-assisted exploratory analysis',
      text: 'Use AI to explore a sample dataset, generate analysis scripts, produce visualizations and explain the results — with every result reproducible from saved code.',
      steps: [
        'Pick a public dataset and write three questions you want answered.',
        'Use Claude Code, Codex or an assistant with code execution to write Python (pandas) scripts for each question. Save them in a Git repository.',
        'Generate charts, then ask the assistant to explain the results and list caveats.',
        'Re-run the scripts from scratch and hand-check at least one result per question.',
      ],
      prompt:
        'I have a CSV with these columns: [list columns and types].\nWrite a Python script using pandas that answers: [question].\nRequirements:\n- Print the intermediate counts so I can verify each step.\n- Handle missing values explicitly and report how many rows were excluded.\n- Save one chart as PNG with a clear title and labeled axes.\nThen explain, in plain English, what the script does step by step.',
    },
    advanced: {
      title: 'Lightweight AI-assisted analytics app',
      text: 'Build a small application that validates input data and generates reproducible reports — for example a command-line tool or simple web app that accepts a CSV, runs quality checks, and produces a standard report.',
      steps: [
        'Define the input schema and validation rules first.',
        'Use a coding agent to build it incrementally, committing after each working step.',
        'Write tests with known-answer fixture files, including bad data.',
        'Document how to run it so a colleague could reproduce your report exactly.',
      ],
    },
    resources: ['kaggle-learn', 'sqlbolt', 'datacamp', 'claude-code-course', 'codex-docs', 'public-data', 'kaggle-datasets'],
  },

  {
    slug: 'business-analyst',
    title: 'Business Analyst',
    short: 'Elicitation, process analysis, business rules, documentation and traceability.',
    intro:
      'Business analysis turns conversations into precise, traceable requirements. AI can speed up synthesis, draft documentation and spot gaps and contradictions — but it cannot know what stakeholders meant, and it will happily smooth over the very ambiguities you are paid to surface. Use it to sharpen your questions, not to answer them for you.',
    focus: [
      'Stakeholder interviews',
      'Requirements elicitation',
      'Process analysis',
      'Business rules',
      'Requirements documentation',
      'Traceability',
      'Gap analysis',
    ],
    useCases: [
      {
        title: 'Interview preparation',
        text: 'Generate question sets for different stakeholder types, then refine them with your own knowledge.',
      },
      {
        title: 'Notes to requirements',
        text: 'Convert interview notes into candidate requirements, each tagged with its source.',
      },
      {
        title: 'Process documentation',
        text: 'Turn a described process into numbered steps, swimlane outlines or Mermaid diagram code you can render.',
      },
      {
        title: 'Business-rule extraction',
        text: 'Pull explicit and implied rules out of policies or notes, marking which are implied.',
      },
      {
        title: 'Gap and contradiction analysis',
        text: 'Compare two stakeholder perspectives or a current vs. future state and list differences.',
      },
      {
        title: 'Traceability support',
        text: 'Draft trace links between objectives, requirements and test cases for you to confirm.',
      },
    ],
    learningAreas: [
      { stage: 1, note: 'Especially verification: AI paraphrase can subtly change a requirement’s meaning.' },
      { stage: 2, note: 'Synthesis and structured outputs for requirements and process documents.' },
      { stage: 3, note: 'Your requirements standards make an excellent reusable skill.' },
      { stage: 6, note: 'BAs are natural AI-opportunity finders — process analysis is use-case discovery.' },
    ],
    beginner: [
      {
        title: 'Interview question set',
        text: 'Describe a fictional process (e.g. employee onboarding) and ask for interview questions for an HR manager, a new hire and an IT administrator. Mark which questions you would actually use and why.',
      },
      {
        title: 'Process to diagram',
        text: 'Describe a simple process in a paragraph and ask for Mermaid flowchart code. Paste it into a Mermaid live editor to view it, then correct the logic.',
      },
    ],
    intermediate: {
      title: 'Interview-notes workflow',
      text: 'Create a workflow that converts synthetic stakeholder interview notes into requirements, follow-up questions and draft process documentation.',
      steps: [
        'Have an assistant generate three fictional interviews about the same process, with some deliberate disagreement between stakeholders.',
        'Write instructions: requirements in your preferred format, each with a source reference; open questions; process steps.',
        'Require it to surface contradictions between interviewees rather than resolving them.',
        'Check every requirement traces to a real statement in the notes. Save the workflow for reuse.',
      ],
      prompt:
        'From the interview notes below, produce:\n1. Candidate requirements, each with an ID, a "shall" statement, and the interviewee + quote it came from.\n2. Contradictions between interviewees, quoted side by side.\n3. Follow-up questions for each interviewee.\n4. A numbered draft of the current process.\nDo not create requirements that are not supported by a quote. Mark anything inferred as INFERRED.\n\n[paste fictional interview notes]',
    },
    advanced: {
      title: 'Requirements-analysis skill with traceability',
      text: 'Build a requirements-analysis skill that identifies gaps and contradictions and generates a traceability matrix linking objectives, requirements and test cases.',
      steps: [
        'Define your gap checklist (missing actors, undefined terms, unhandled exceptions, unmeasurable requirements).',
        'Package the checklist, output templates and a worked example as a skill.',
        'Have it output the traceability matrix as CSV so it opens in a spreadsheet.',
        'Test it on a fictional requirements set with known, planted gaps. Did it find them?',
      ],
    },
    resources: ['claude-ai-fluency', 'claude-skills-course', 'openai-ai-at-work', 'sqlbolt', 'iiba'],
  },
];

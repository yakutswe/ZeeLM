export type WorkspaceId = "assistant" | "product" | "engineering" | "research" | "models";

export const workspaces: { id: WorkspaceId; label: string; symbol: string }[] = [
  { id: "assistant", label: "AI Assistant", symbol: "✳" },
  { id: "product", label: "Product Studio", symbol: "▦" },
  { id: "engineering", label: "Engineering Lab", symbol: "⌘" },
  { id: "research", label: "Research Desk", symbol: "◎" },
  { id: "models", label: "Model Lab", symbol: "◇" },
];

export type StudioCard = {
  tag: string;
  title: string;
  body: string;
  prompt: string;
  destination?: WorkspaceId;
};

export type StudioContent = {
  eyebrow: string;
  lead: string;
  accent: string;
  subtitle: string;
  kicker: string;
  cards: StudioCard[];
};

export const studioContent: Record<Exclude<WorkspaceId, "models">, StudioContent> = {
  assistant: {
    eyebrow: "PRIVATE INTELLIGENCE / BUILT TO THINK",
    lead: "Your ideas,",
    accent: "in motion.",
    subtitle: "One place for the questions, decisions, and technical work that move your ideas forward.",
    kicker: "START WITH A DIRECTION",
    cards: [
      { tag: "01 / PRODUCT", title: "Define an MVP", body: "Turn an idea into a focused first release.", prompt: "Help me define an MVP. Ask the most important missing context first, one question at a time.", destination: "product" },
      { tag: "02 / ENGINEERING", title: "Design an API", body: "Review architecture, security, and trade-offs.", prompt: "Help me design a reliable REST API. Start by asking for requirements and constraints.", destination: "engineering" },
      { tag: "03 / RESEARCH", title: "Plan discovery", body: "Move from questions to evidence.", prompt: "Help me plan discovery research. Ask about the decision I need to make.", destination: "research" },
    ],
  },
  product: {
    eyebrow: "PRODUCT STUDIO / FROM PROBLEM TO PRODUCT",
    lead: "Make the right",
    accent: "thing first.",
    subtitle: "Shape customer problems into product strategy, prioritization, and measurable outcomes.",
    kicker: "PRODUCT WORKFLOWS",
    cards: [
      { tag: "01 / DISCOVERY", title: "Define the problem", body: "Identify users, pain points, and assumptions.", prompt: "Act as my product discovery partner. Help me define the customer, problem, assumptions, and opportunities. Ask one key question first." },
      { tag: "02 / PLANNING", title: "Scope an MVP", body: "Prioritize features, trade-offs, and milestones.", prompt: "Help me scope an MVP. Identify outcomes, must-haves, trade-offs, and success metrics. Ask for essential context first." },
      { tag: "03 / DELIVERY", title: "Draft a PRD", body: "Turn requirements into a practical product brief.", prompt: "Help me write a concise PRD including user stories, non-goals, acceptance criteria, and measurable success metrics. Ask for missing context first." },
    ],
  },
  engineering: {
    eyebrow: "ENGINEERING LAB / DESIGN TO DELIVERY",
    lead: "Build with",
    accent: "intention.",
    subtitle: "Explore architecture, code, system decisions, and implementation plans with clear trade-offs.",
    kicker: "ENGINEERING WORKFLOWS",
    cards: [
      { tag: "01 / ARCHITECTURE", title: "Design a system", body: "Plan components, data flow, and reliability.", prompt: "Help me design a system architecture. Begin by asking about users, scale, constraints, and reliability needs." },
      { tag: "02 / IMPLEMENTATION", title: "Build an API", body: "Define contracts, authentication, and tests.", prompt: "Help me design and implement an API. Ask which stack, entities, and constraints we're using before proposing endpoints." },
      { tag: "03 / QUALITY", title: "Debug a problem", body: "Investigate failures and choose the next test.", prompt: "Help me debug a software issue systematically. Ask me for the error, expected behavior, and reproducible steps first." },
    ],
  },
  research: {
    eyebrow: "RESEARCH DESK / QUESTIONS TO EVIDENCE",
    lead: "Explore what",
    accent: "matters.",
    subtitle: "Frame questions, examine evidence, and organize useful findings for decisions.",
    kicker: "RESEARCH WORKFLOWS",
    cards: [
      { tag: "01 / FRAME", title: "Research a question", body: "Define scope, hypotheses, and uncertainties.", prompt: "Help me frame a research question, clarify the decision, and build a research plan. Ask for context first. Do not pretend to browse the web." },
      { tag: "02 / SYNTHESIS", title: "Analyze findings", body: "Separate facts, assumptions, and open questions.", prompt: "Help me synthesize research findings I will provide. Distinguish evidence, interpretation, and gaps." },
      { tag: "03 / DECISION", title: "Compare options", body: "Evaluate trade-offs and document a recommendation.", prompt: "Help me compare options with criteria, uncertainties, and trade-offs. Ask what matters most to the decision first." },
    ],
  },
};

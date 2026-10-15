import type { WorkspaceId } from "./studio-data";

export type ChatMessage = { id: string; role: "user" | "assistant"; content: string; createdAt: number };
export type Conversation = {
  id: string;
  title: string;
  workspace: WorkspaceId;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  archived?: boolean;
  deletedAt?: number | null;
};

const STORAGE_KEY = "zeelm.studio.v2.conversations"; // Keep existing history.
export const TRASH_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
export const conversationTimestamp = (): number => Date.now();

export function purgeExpiredConversations(items: Conversation[], now: number): Conversation[] {
  return items.filter(c => !(typeof c.deletedAt === "number" && now - c.deletedAt >= TRASH_RETENTION_MS));
}

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const valid = parsed.filter((c): c is Conversation =>
      c !== null && typeof c === "object" &&
      typeof c.id === "string" && typeof c.title === "string" &&
      typeof c.workspace === "string" && Array.isArray(c.messages));
    const cleaned = purgeExpiredConversations(valid, conversationTimestamp());
    if (cleaned.length !== valid.length) saveConversations(cleaned);
    return cleaned;
  } catch { return []; }
}

export function saveConversations(items: Conversation[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(purgeExpiredConversations(items, conversationTimestamp()))); }
  catch { /* Browser storage can be disabled or full. */ }
}

export function newConversation(workspace: WorkspaceId): Conversation {
  const now = conversationTimestamp();
  return { id: crypto.randomUUID(), title: "New conversation", workspace, createdAt: now, updatedAt: now, messages: [] };
}

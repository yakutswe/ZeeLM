export type HistoryEntry = { role: "user" | "assistant"; content: string };
export async function askZeeLM(message: string, history: HistoryEntry[] = []): Promise<string> {
  const response = await fetch("/api/chat", { method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({message,history:history.slice(-12)}) });
  const data: unknown = await response.json();
  if (!response.ok) throw new Error(data && typeof data === "object" && "error" in data && typeof data.error === "string" ? data.error : "ZeeLM could not answer.");
  if (!data || typeof data !== "object" || !("reply" in data) || typeof data.reply !== "string") throw new Error("Unexpected response from ZeeLM.");
  return data.reply;
}

export async function askZeeLM(message: string): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("ZeeLM returned a response that could not be read.");
  }

  if (!response.ok) {
    const detail = payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
      ? payload.error
      : "ZeeLM could not answer right now.";
    throw new Error(detail);
  }

  if (!payload || typeof payload !== "object" || !("reply" in payload) || typeof payload.reply !== "string") {
    throw new Error("ZeeLM returned an unexpected reply.");
  }

  return payload.reply;
}

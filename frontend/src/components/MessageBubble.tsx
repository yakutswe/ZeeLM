import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type {ChatMessage} from "@/lib/conversations";
export function MessageBubble({message}:{message:ChatMessage}) {return <article className={`message message--${message.role}`}><div className="message-avatar">{message.role==="user"?"Y":"◇"}</div><div className="message-main"><div className="message-name">{message.role==="user"?"You":"ZeeLM"}</div><div className="message-content">{message.role==="assistant"?<ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>:message.content}</div></div></article>;}

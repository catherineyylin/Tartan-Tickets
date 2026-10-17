"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

type Ticket = {
  ticket_id: string;
  category: string;
  priority: string;
  summary: string;
};

type ToolPart = UIMessage["parts"][number] & {
  type: string;
  toolCallId: string;
  state?: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

const FACTS_KEY = "ridge-remembered-facts";
const TICKETS_KEY = "ridge-created-tickets";
const suggestions = [
  "Where is my order?",
  "I want to return something",
  "My backpack zipper broke",
];

function isToolPart(part: UIMessage["parts"][number]): part is ToolPart {
  return part.type.startsWith("tool-");
}

function displayToolName(type: string) {
  return type
    .replace(/^tool-/, "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function readable(value: unknown) {
  if (value === undefined) return "Waiting for result…";
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function RidgeMark() {
  return (
    <span className="ridge-mark" aria-hidden="true">
      <svg viewBox="0 0 40 40" fill="none">
        <path d="M5 29.5 17.2 12l6.1 8.2L27 14l8 15.5H5Z" fill="currentColor" />
        <path d="m14.6 20.1 2.6 3.4 3.8-5.4" stroke="#F7F8F2" strokeWidth="1.7" />
      </svg>
    </span>
  );
}

function ToolCard({ part }: { part: ToolPart }) {
  const toolName = part.type.replace(/^tool-/, "");
  const ticket = part.output as Partial<Ticket> | undefined;

  return (
    <details className="tool-card">
      <summary>
        <span className="tool-indicator" />
        <span>{displayToolName(part.type)}</span>
        <span className="tool-state">
          {part.state === "output-available" ? "Done" : "In progress"}
        </span>
        <span className="tool-chevron" aria-hidden="true">⌄</span>
      </summary>
      <div className="tool-card-body">
        <div>
          <span className="tool-label">INPUT</span>
          <pre>{readable(part.input)}</pre>
        </div>
        <div>
          <span className="tool-label">RESULT</span>
          <pre>{part.errorText ?? readable(part.output)}</pre>
        </div>
      </div>
      {toolName === "create_ticket" && ticket?.ticket_id && (
        <span className="ticket-created-chip">Ticket {ticket.ticket_id} created</span>
      )}
    </details>
  );
}

export default function RidgeChat() {
  const [input, setInput] = useState("");
  const [facts, setFacts] = useState<string[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [storageError, setStorageError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const processedTools = useRef(new Set<string>());
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { messages, rememberedFacts: facts },
        }),
      }),
    [facts],
  );
  const { messages, sendMessage, status, error } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const storedFacts = localStorage.getItem(FACTS_KEY);
        const storedTickets = localStorage.getItem(TICKETS_KEY);
        if (storedFacts) {
          const parsed = JSON.parse(storedFacts);
          if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
            setFacts(parsed);
          } else {
            throw new Error("Saved customer facts have an invalid format.");
          }
        }
        if (storedTickets) {
          const parsed = JSON.parse(storedTickets);
          if (
            Array.isArray(parsed) &&
            parsed.every(
              (item) =>
                typeof item.ticket_id === "string" &&
                typeof item.category === "string" &&
                typeof item.priority === "string" &&
                typeof item.summary === "string",
            )
          ) {
            setTickets(parsed);
          } else {
            throw new Error("Saved tickets have an invalid format.");
          }
        }
      } catch {
        setStorageError("We couldn’t read saved Ridge data from this browser.");
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    for (const message of messages) {
      for (const part of message.parts) {
        if (
          !isToolPart(part) ||
          part.state !== "output-available" ||
          processedTools.current.has(part.toolCallId)
        ) continue;
        processedTools.current.add(part.toolCallId);
        const output = part.output;
        if (!output || typeof output !== "object") continue;
        const result = output as Record<string, unknown>;

        if (part.type === "tool-remember_customer" && typeof result.fact === "string") {
          const fact = result.fact;
          window.setTimeout(() => {
            setFacts((current) => {
              if (current.includes(fact)) return current;
              const next = [...current, fact];
              try {
                localStorage.setItem(FACTS_KEY, JSON.stringify(next));
              } catch {
                setStorageError("Ridge couldn’t save your remembered facts in this browser.");
              }
              return next;
            });
          }, 0);
        }

        if (
          part.type === "tool-create_ticket" &&
          typeof result.ticket_id === "string" &&
          typeof result.category === "string" &&
          typeof result.priority === "string" &&
          typeof result.summary === "string"
        ) {
          const ticket: Ticket = {
            ticket_id: result.ticket_id,
            category: result.category,
            priority: result.priority,
            summary: result.summary,
          };
          window.setTimeout(() => {
            setTickets((current) => {
              if (current.some((existing) => existing.ticket_id === ticket.ticket_id)) return current;
              const next = [...current, ticket];
              try {
                localStorage.setItem(TICKETS_KEY, JSON.stringify(next));
              } catch {
                setStorageError("Ridge couldn’t save your ticket list in this browser.");
              }
              return next;
            });
          }, 0);
        }
      }
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput("");
  }

  function clearMemory() {
    try {
      localStorage.removeItem(FACTS_KEY);
      localStorage.removeItem(TICKETS_KEY);
      setFacts([]);
      setTickets([]);
      setStorageError("");
    } catch {
      setStorageError("Ridge couldn’t clear saved data from this browser.");
    }
  }

  return (
    <main className="ridge-page">
      <header className="ridge-header">
        <Link className="ridge-brand" href="/" aria-label="Allegheny Gear Co. home">
          <RidgeMark />
          <span className="brand-copy">
            <strong>ALLEGHENY GEAR CO.</strong>
            <span>OUT THERE, TOGETHER</span>
          </span>
        </Link>
        <span className="header-support">
          <span className="support-status" />
          RIDGE SUPPORT
        </span>
      </header>

      <div className="workspace">
        <section className="chat-panel" aria-label="Chat with Ridge">
          <div className="chat-heading">
            <div className="ridge-avatar"><RidgeMark /></div>
            <div>
              <div className="assistant-name">Ridge <span className="online-pill">ONLINE</span></div>
              <p>Customer care, with the outdoors in mind.</p>
            </div>
            <div className="secure-note">
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4.2 7V5.2a3.8 3.8 0 0 1 7.6 0V7m-8.4 0h9.2v7H3.4V7Z" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              PRIVATE CHAT
            </div>
          </div>

          <div className="conversation" aria-live="polite">
            {messages.length === 0 && (
              <div className="welcome-block">
                <span className="welcome-overline">YOUR TRAIL STARTS HERE</span>
                <h1>How can I help<br />you today?</h1>
                <p>Ask me about an order, a product, or anything you need a hand with. I’m all ears.</p>
                <span className="welcome-sprig" aria-hidden="true">✳</span>
              </div>
            )}
            {messages.map((message) => {
              const isUser = message.role === "user";
              const textParts = message.parts.filter((part) => part.type === "text");
              const toolParts = message.parts.filter(isToolPart);
              return (
                <article className={`message ${isUser ? "message-user" : "message-assistant"}`} key={message.id}>
                  {!isUser && <div className="message-avatar"><RidgeMark /></div>}
                  <div className="message-content">
                    {textParts.map((part, index) => (
                      <p className="message-bubble" key={`${message.id}-${index}`}>
                        {part.text}
                      </p>
                    ))}
                    {toolParts.map((part, index) => (
                      <ToolCard part={part} key={`${message.id}-tool-${index}`} />
                    ))}
                  </div>
                </article>
              );
            })}
            {busy && (
              <div className="thinking-row">
                <span className="thinking-dots"><i /><i /><i /></span>
                <span>Ridge is looking into it…</span>
              </div>
            )}
            {error && (
              <div className="error-message" role="alert">
                That didn’t go through. Please try again. {error.message}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length === 0 && (
            <div className="suggestions" aria-label="Suggested questions">
              {suggestions.map((suggestion) => (
                <button
                  type="button"
                  className="suggestion-button"
                  key={suggestion}
                  onClick={() => sendMessage({ text: suggestion })}
                  disabled={busy}
                >
                  {suggestion}<span aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
          )}

          <form className="composer" onSubmit={submitMessage}>
            <label className="sr-only" htmlFor="chat-input">Message Ridge</label>
            <input
              id="chat-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Write a message…"
              autoComplete="off"
            />
            <button className="send-button" type="submit" aria-label="Send message" disabled={!input.trim() || busy}>
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="m3 10 14-6-5.7 14-2.1-6L3 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="m9.2 12 4.1-4.1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </form>
          <p className="chat-footnote">Ridge can make mistakes. For account-specific help, share your order number and last name.</p>
        </section>

        <aside className="sidebar" aria-label="Your support details">
          <section className="sidebar-panel memory-panel">
            <div className="panel-heading">
              <span className="panel-icon memory-icon" aria-hidden="true">✳</span>
              <div>
                <h2>What Ridge remembers about you</h2>
                <p>Just the helpful bits.</p>
              </div>
            </div>
            {facts.length > 0 ? (
              <ul className="memory-list">
                {facts.map((fact, index) => <li key={`${fact}-${index}`}>{fact}</li>)}
              </ul>
            ) : (
              <p className="empty-panel">Nothing saved yet. I’ll remember useful details you share.</p>
            )}
            <button className="forget-button" type="button" onClick={clearMemory}>Forget me <span aria-hidden="true">↗</span></button>
          </section>

          <section className="sidebar-panel tickets-panel">
            <div className="panel-heading">
              <span className="panel-icon ticket-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="none"><path d="M3.5 5.5h13v3a2 2 0 0 0 0 4v3h-13v-3a2 2 0 0 0 0-4v-3Z" stroke="currentColor" strokeWidth="1.3" /><path d="M8 7.5v6" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.5 1.5" /></svg>
              </span>
              <div>
                <h2>Tickets created</h2>
                <p>{tickets.length === 1 ? "1 open ticket" : `${tickets.length} open tickets`}</p>
              </div>
              {tickets.length > 0 && <span className="ticket-count">{String(tickets.length).padStart(2, "0")}</span>}
            </div>
            {tickets.length > 0 ? (
              <ul className="ticket-list">
                {tickets.map((ticket) => (
                  <li className="ticket-item" key={ticket.ticket_id}>
                    <div className="ticket-topline">
                      <span className="ticket-id">{ticket.ticket_id}</span>
                      <span className={`priority-badge priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
                    </div>
                    <span className="ticket-category">{ticket.category}</span>
                    <p>{ticket.summary}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-panel empty-tickets">No tickets yet. If something needs a specialist, I can get the right team on it.</p>
            )}
          </section>

          <div className="side-note">
            <span className="side-note-icon" aria-hidden="true">↗</span>
            <p><strong>Made for the long way round.</strong><br />We’ll help you get back out there.</p>
          </div>
          {storageError && <p className="storage-error" role="alert">{storageError}</p>}
        </aside>
      </div>
      <footer className="ridge-footer"><span>ALLEGHENY GEAR CO.</span><span>Good gear. Good people. Great outdoors.</span></footer>
    </main>
  );
}

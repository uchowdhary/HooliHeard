import { useState, useRef, useEffect, useCallback } from "react";
import { apiFetch } from "@/api/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

/** Pre-seeded Q&A for suggested questions — no LLM needed */
const SEEDED_ANSWERS: Record<string, string> = {
  "Top 3 SUNK requests from customers":
    "1. Storage: Customers need S3-compatible object storage with cross-region replication (CrowdStrike, Midjourney)\n" +
    "2. Networking: Multiple customers requesting Site-to-Site VPN for private connectivity to on-prem (Mistral AI, Wayve, PDT Partners)\n" +
    "3. Kubernetes (CKS): Requests for multi-cluster federation and GPU-aware scheduling improvements (Perplexity AI, Waabi)",

  "Top 3 instance/compute requests":
    "1. CrowdStrike — B300 capacity at Round Rock deferred; also needs Alava (Spain) nodes blocked by DX contract\n" +
    "2. Midjourney — B300 first rack delivery delayed (est. Mar 30), network backbone Luma circuit issues\n" +
    "3. Superhuman — Won't commit beyond 1yr due to GPU market volatility; needs flexibility on model size/family changes",

  "Top 3 customers by pipeline value":
    "1. Hudson River Trading — $329M pipeline (Active Discussion / BMaaS)\n" +
    "2. Midjourney — $42M pipeline (Negotiations)\n" +
    "3. 1X Technologies — $40M pipeline (Negotiations)",

  "What are the biggest blockers?":
    "1. Security: Public K8s endpoints without auth concern (Xaira Therapeutics); FedRAMP High/IL5 certification needed (CrowdStrike)\n" +
    "2. Billing: No billing API or FOCUS-standard cost export for FinOps tools (Superhuman/Grammarly)\n" +
    "3. Connectivity: Site-to-Site VPN needed by 5+ customers for hybrid cloud setups",

  "Summarize CKS feedback":
    "11 key CKS insights across 8 accounts. Top themes: Enhancement requests (4) around multi-cluster and networking, " +
    "Education Gaps (3) on CKS best practices, and 1 critical issue. Perplexity AI using Tailscale for bi-directional " +
    "CKS↔AWS EKS connectivity. Waabi needs alpha feature flags enabled.",
};

const SUGGESTIONS = Object.keys(SEEDED_ANSWERS);

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;
      const trimmed = text.trim();
      const userMsg: Message = { role: "user", content: trimmed };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");

      // Check for pre-seeded answer first
      const seeded = SEEDED_ANSWERS[trimmed];
      if (seeded) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: seeded },
        ]);
        return;
      }

      // Fall back to API for custom questions
      setLoading(true);
      try {
        const res = await apiFetch<{ answer: string }>("/chat", {
          method: "POST",
          body: JSON.stringify({ message: trimmed }),
        });
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.answer },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, something went wrong. Please try again." },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading],
  );

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-indigo-700"
        title="Ask Hooli Heard"
      >
        {open ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[500px] w-96 flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-2 rounded-t-2xl bg-indigo-600 px-4 py-3">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
            </svg>
            <span className="text-sm font-semibold text-white">Ask Hooli Heard</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && !loading && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Ask questions about customer insights, product requests, or pipeline data.
                </p>
                <div className="space-y-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-xs text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-3">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 px-3 py-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={loading}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

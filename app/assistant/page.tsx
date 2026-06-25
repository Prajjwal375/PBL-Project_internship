"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  facts?: string[];
};

const SUGGESTED = [
  "Which schools are at risk?",
  "Summarize September performance",
  "Which district improved the most?",
  "Generate grant summary",
  "Compare July and August",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [months, setMonths] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [month, setMonth] = useState("");
  const [district, setDistrict] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(0);

  const nextId = () => {
    idCounter.current += 1;
    return idCounter.current.toString();
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetch("/api/filters")
      .then(res => res.json())
      .then(data => {
        setMonths(data.months ?? []);
        setDistricts(data.districts ?? []);
      })
      .catch(() => {
        setMonths([]);
        setDistricts([]);
      });
  }, []);

  async function send(prompt: string) {
    if (!prompt.trim() || loading) return;
    const userMsg: Message = { id: nextId(), role: "user", text: prompt };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          month: month || undefined,
          district: district || undefined,
        }),
      });
      const data = await res.json();
      const assistantMsg: Message = {
        id: nextId(),
        role: "assistant",
        text: data.answer ?? "No response available.",
        facts: data.facts ?? [],
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: nextId(),
        role: "assistant",
        text: "Sorry, something went wrong. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="px-xl pt-xl pb-md border-b border-outline-variant bg-surface-container-lowest">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">AI Assistant</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
          Ask questions about school performance, grants, and program trends. Answers are grounded in your CSV data.
        </p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-xl py-lg flex flex-col gap-lg">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center mb-lg">
              <span className="material-symbols-outlined text-[32px] text-on-primary-container">smart_toy</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">PBL Intelligence Assistant</h3>
            <p className="font-body-md text-body-md text-on-surface-variant text-center max-w-md">
              I can analyze school performance, synthesize grant reports, and identify risk patterns across your dataset.
            </p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center mr-sm shrink-0 mt-xs">
                <span className="material-symbols-outlined text-[16px] text-on-primary-container">smart_toy</span>
              </div>
            )}
            <div className={`max-w-[70%] ${msg.role === "user"
              ? "bg-primary text-white rounded-2xl rounded-tr-sm px-lg py-md"
              : "bg-surface-container-lowest border border-outline-variant rounded-2xl rounded-tl-sm px-lg py-md shadow-sm"
            }`}>
              <p className={`font-body-md text-body-md leading-relaxed ${msg.role === "user" ? "text-white" : "text-on-surface"}`}>
                {msg.text}
              </p>
              {msg.facts && msg.facts.length > 0 && (
                <div className="mt-md pt-md border-t border-outline-variant">
                  <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Source Data</div>
                  {msg.facts.map((fact, i) => (
                    <div key={i} className="flex items-start gap-xs mt-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-on-surface-variant mt-1.5 shrink-0" />
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{fact}</span>
                    </div>
                  ))}
                  <div className="mt-sm flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[14px] text-[#16a34a]">verified</span>
                    <span className="font-label-sm text-label-sm text-[#16a34a]">Based on real CSV data</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center mr-sm shrink-0 mt-xs">
              <span className="material-symbols-outlined text-[16px] text-on-primary-container">smart_toy</span>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl rounded-tl-sm px-lg py-md shadow-sm">
              <div className="flex items-center gap-sm">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested Prompts */}
      {messages.length === 0 && (
        <div className="px-xl pb-sm flex flex-wrap gap-sm justify-center">
          {SUGGESTED.map(s => (
            <button key={s} onClick={() => send(s)}
              className="px-md py-xs rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface font-label-md hover:border-primary hover:bg-primary-container hover:text-on-primary-container transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="px-xl py-md border-t border-outline-variant bg-surface-container-lowest">
        <div className="flex flex-wrap gap-sm items-center max-w-4xl mx-auto mb-sm">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Context:</span>
          <select value={month} onChange={e => setMonth(e.target.value)}
            className="h-9 px-sm rounded border border-outline-variant bg-surface-container-lowest text-label-md font-label-md focus:border-primary outline-none">
            <option value="">Latest month</option>
            {months.map(mo => <option key={mo} value={mo}>{mo}</option>)}
          </select>
          <select value={district} onChange={e => setDistrict(e.target.value)}
            className="h-9 px-sm rounded border border-outline-variant bg-surface-container-lowest text-label-md font-label-md focus:border-primary outline-none">
            <option value="">All districts</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex gap-sm items-end max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
              placeholder="Ask PBL Intelligence to analyze data, generate reports, or find patterns..."
              className="w-full h-12 pl-lg pr-sm bg-surface-container-lowest border border-outline-variant rounded-xl text-body-md focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <button onClick={() => send(input)} disabled={loading || !input.trim()}
            className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
        <p className="text-center font-label-sm text-label-sm text-on-surface-variant mt-xs">
          AI responses are grounded in your uploaded CSV data. Verify critical decisions against raw reports.
        </p>
      </div>
    </div>
  );
}

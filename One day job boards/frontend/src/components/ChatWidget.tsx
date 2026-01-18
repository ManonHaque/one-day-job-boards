"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const initialMessages: ChatMessage[] = [
  { role: "assistant", content: "Hi! I can help you browse jobs, apply, or navigate the site. What do you need?" },
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);
    try {
      const response = await api.chat(nextMessages);
      const reply: ChatMessage = { role: "assistant", content: response.reply };
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      console.error(err);
      toast.error("Chat is unavailable right now.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-3 w-[360px] max-w-[90vw] rounded-2xl border border-neutral-800 bg-black/90 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
            <div className="text-sm font-semibold text-white">Help Chat</div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-white transition"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div ref={listRef} className="max-h-[60vh] overflow-y-auto px-4 py-3 space-y-3 text-sm">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-xl px-3 py-2 max-w-[80%] whitespace-pre-wrap leading-relaxed ${
                    msg.role === "user"
                      ? "bg-white text-black"
                      : "bg-neutral-900 text-neutral-100 border border-neutral-800"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="rounded-xl px-3 py-2 bg-neutral-900 text-neutral-400 border border-neutral-800">
                  Typing…
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-neutral-800 px-3 py-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                className="flex-1 rounded-lg bg-neutral-900 text-white px-3 py-2 text-sm border border-neutral-800 focus:outline-none focus:border-white"
                placeholder="Ask anything…"
                disabled={isSending}
              />
              <button
                onClick={sendMessage}
                disabled={isSending}
                className="px-3 py-2 rounded-lg bg-white text-black font-semibold text-sm hover:bg-neutral-200 disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-white text-black font-semibold px-4 py-3 shadow-lg hover:bg-neutral-200"
        aria-label="Toggle chat"
      >
        💬 Help
      </button>
    </div>
  );
}

export default ChatWidget;

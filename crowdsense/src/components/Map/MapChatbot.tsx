"use client";

import { useState, useRef, useEffect } from "react";
import { useFloorPlanData } from "@/hooks/useFloorPlanData";
import { MessageCircle, X, Send, Loader2, Bot, MapPin, User } from "lucide-react";

export interface PinnedLocation {
  lat: number;
  lng: number;
  label: string;
  type: string;
  id: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  pinLocation?: Omit<PinnedLocation, "id"> | null;
}

interface MapChatbotProps {
  userLat: number | null;
  userLng: number | null;
  zones: any[]; // Live zones with lat/lng
  onPinLocation: (pin: PinnedLocation) => void;
}

const SUGGESTIONS = [
  "Where is the nearest restroom?",
  "Which zone is least crowded?",
  "Where is the emergency exit?",
  "Where can I find food?",
];

const PIN_COLORS: Record<string, string> = {
  restroom: "text-cyan-400",
  exit: "text-red-400",
  food: "text-orange-400",
  stage: "text-violet-400",
  entry: "text-green-400",
  info: "text-blue-400",
  other: "text-[#7070a0]",
};

export function MapChatbot({ userLat, userLng, zones, onPinLocation }: MapChatbotProps) {
  const { data: fpData } = useFloorPlanData();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: fpData
        ? `Hi! 👋 I'm your venue guide for **${fpData.venue.venueName}**. Ask me anything — restrooms, exits, food stalls, crowd tips, and more!`
        : "Hi! 👋 I'm your venue assistant. Analyze a floor plan first for richer answers, or just ask me anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/map-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          venueName: fpData?.venue.venueName,
          venueAddress: fpData?.venue.formattedAddress || fpData?.venue.address,
          floorPlanZones: fpData?.analysis.zones ?? [],
          liveZones: zones, // Include zones with lat/lng
          userLat,
          userLng,
        }),
      });
      const json = await res.json();
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: json.answer ?? "Sorry, I couldn't process that.",
        pinLocation: json.pinLocation ?? null,
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Pin location on map if provided
      if (json.pinLocation) {
        onPinLocation({
          ...json.pinLocation,
          id: `pin-${Date.now()}`,
        });
      }
    } catch {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: "assistant",
        text: "Connection error — please try again.",
      }]);
    }
    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <>
      {/* ── Floating button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Close venue assistant" : "Open venue assistant"}
        className={`absolute bottom-6 right-4 z-20 w-12 h-12 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-200 ${
          open ? "bg-red-500/80 hover:bg-red-500 rotate-0" : "bg-gradient-to-br from-blue-500 to-violet-600 hover:scale-110"
        }`}
        style={{ boxShadow: "0 4px 32px rgba(79,126,255,0.4)" }}
      >
        {open ? <X className="w-5 h-5 text-white" /> : <MessageCircle className="w-5 h-5 text-white" />}
        {!open && messages.length > 1 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 border-2 border-[#04040a] rounded-full" />
        )}
      </button>

      {/* ── Chat panel ── */}
      {open && (
        <div className="absolute bottom-20 right-4 z-30 w-80 flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-border-subtle bg-bg-surface"
          style={{ maxHeight: "70vh", minHeight: "320px" }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-subtle bg-bg-elevated shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#e8e8f0]">Venue Assistant</p>
              <p className="text-[10px] text-[#404060] font-black uppercase tracking-widest">Powered by Gemini AI</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-green-400 font-black">Live</span>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.role === "assistant" ? "bg-blue-500/20" : "bg-white/[0.08]"
                }`}>
                  {msg.role === "assistant"
                    ? <Bot className="w-3.5 h-3.5 text-blue-400" />
                    : <User className="w-3.5 h-3.5 text-[#7070a0]" />}
                </div>
                <div className={`max-w-[78%] space-y-2 ${msg.role === "user" ? "items-end flex flex-col" : ""}`}>
                  <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-500/20 text-[#e8e8f0] rounded-tr-sm"
                      : "bg-white/[0.04] border border-border-subtle text-[#e8e8f0] rounded-tl-sm"
                  }`}>
                    {msg.text}
                  </div>
                  {/* Pin badge */}
                  {msg.pinLocation && (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold ${PIN_COLORS[msg.pinLocation.type] ?? "text-blue-400"}`}>
                      <MapPin className="w-3 h-3" />
                      Pinned: {msg.pinLocation.label}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="px-3.5 py-3 rounded-2xl rounded-tl-sm bg-white/[0.04] border border-border-subtle">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-[#7070a0] rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex gap-1.5 flex-wrap shrink-0">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-[10px] px-2.5 py-1.5 rounded-full bg-white/[0.04] border border-border-subtle hover:border-blue-500/30 hover:text-blue-400 text-[#7070a0] font-semibold transition-all whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 pb-4 pt-2 shrink-0 border-t border-border-subtle">
            <div className="flex gap-2 items-center">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask anything about the venue…"
                className="input-field !py-2 !px-3 text-xs flex-1"
                disabled={loading}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity hover:opacity-80"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Send className="w-3.5 h-3.5 text-white" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

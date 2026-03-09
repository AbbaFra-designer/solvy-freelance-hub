import { useState } from "react";
import { X, Send } from "lucide-react";

interface Message {
  role: "user" | "bot";
  text: string;
}

interface Advisor {
  name: string;
  role: string;
  accent: string;
  initials: string;
  mockMessages: Message[];
}

interface Props {
  advisor: Advisor;
  open: boolean;
  onClose: () => void;
}

export default function AdvisorChatModal({ advisor, open, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>(advisor.mockMessages);
  const [input, setInput] = useState("");

  if (!open) return null;

  const send = () => {
    if (!input.trim()) return;
    setMessages((m) => [
      ...m,
      { role: "user", text: input.trim() },
      { role: "bot", text: `Grazie per la domanda! Come ${advisor.name}, posso dirti che questo è un argomento importante. Ti consiglio di approfondire con un professionista per il tuo caso specifico.` },
    ]);
    setInput("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-lg h-[85vh] sm:h-[70vh] bg-card border border-border rounded-t-2xl sm:rounded-2xl flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border shrink-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
            style={{ backgroundColor: advisor.accent }}
          >
            {advisor.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm">{advisor.name}</p>
            <p className="text-xs text-muted-foreground">{advisor.role}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-accent-orange text-white rounded-br-md"
                    : "bg-secondary text-foreground rounded-bl-md"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border shrink-0">
          <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={`Fai una domanda a ${advisor.name}…`}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button onClick={send} className="w-8 h-8 rounded-lg flex items-center justify-center gradient-accent text-foreground shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

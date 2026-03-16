import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useGetMessages, useSendMessage } from "../hooks/useQueries";

const SENDER_KEY = "justus_sender_name";

function formatTime(timestamp: bigint): string {
  const d = new Date(Number(timestamp) / 1_000_000); // nanoseconds to ms
  // Try both nanoseconds and milliseconds
  const asMs = new Date(Number(timestamp));
  // Heuristic: if nanoseconds value gives a sensible year
  const year = d.getFullYear();
  const useNs = year > 2000 && year < 2100;
  const date = useNs ? d : asMs;
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Chat() {
  const [senderName, setSenderName] = useState(
    () => localStorage.getItem(SENDER_KEY) ?? "",
  );
  const [nameInput, setNameInput] = useState("");
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useGetMessages();
  const sendMessage = useSendMessage();

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll trigger
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSetName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    localStorage.setItem(SENDER_KEY, nameInput.trim());
    setSenderName(nameInput.trim());
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !senderName) return;
    const text = messageText.trim();
    setMessageText("");
    try {
      await sendMessage.mutateAsync({ sender: senderName, message: text });
    } catch {
      toast.error("Message failed to send");
      setMessageText(text);
    }
  };

  if (!senderName) {
    return (
      <div className="pb-24 px-5 pt-10">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Chat
          </h1>
          <p className="text-sm text-muted-foreground">Just the two of us</p>
        </div>
        <motion.div
          className="bg-card rounded-3xl p-6 shadow-card border border-border/40 space-y-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="font-display text-xl font-medium">
              What's your name?
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Your partner will see it on messages
            </p>
          </div>
          <form onSubmit={handleSetName} className="space-y-3">
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your nickname..."
              className="rounded-xl h-12 text-center text-base"
              autoFocus
              data-ocid="chat.name.input"
            />
            <Button
              type="submit"
              disabled={!nameInput.trim()}
              className="w-full rounded-xl h-12 font-semibold"
              data-ocid="chat.name.submit_button"
            >
              Start Chatting 💬
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen pb-16">
      {/* Header */}
      <div className="px-5 pt-10 pb-3 flex-shrink-0 bg-background/80 backdrop-blur-sm border-b border-border/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">
              Chat
            </h1>
            <p className="text-sm text-muted-foreground">
              Chatting as{" "}
              <strong className="text-foreground">{senderName}</strong>
            </p>
          </div>
          <button
            type="button"
            className="text-xs text-muted-foreground underline underline-offset-2"
            onClick={() => {
              localStorage.removeItem(SENDER_KEY);
              setSenderName("");
            }}
          >
            Change name
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
        {isLoading ? (
          <div className="space-y-3" data-ocid="chat.loading_state">
            {["s1", "s2", "s3", "s4"].map((sk, idx) => (
              <div
                key={sk}
                className={`flex ${idx % 2 === 0 ? "justify-start" : "justify-end"}`}
              >
                <Skeleton
                  className={`h-12 rounded-2xl ${idx % 2 === 0 ? "w-2/3" : "w-1/2"}`}
                />
              </div>
            ))}
          </div>
        ) : !messages?.length ? (
          <div
            className="flex flex-col items-center justify-center h-full gap-3 text-center"
            data-ocid="chat.empty_state"
          >
            <p className="text-4xl">💌</p>
            <p className="font-display text-xl text-foreground/70">
              Start the conversation
            </p>
            <p className="text-sm text-muted-foreground">
              Say something sweet...
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => {
              const isMe = msg.sender === senderName;
              return (
                <motion.div
                  key={`${msg.sender}-${String(msg.timestamp)}-${idx}`}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  data-ocid={`chat.item.${idx + 1}`}
                >
                  <p className="text-[10px] text-muted-foreground mb-1 px-1">
                    {msg.sender}
                  </p>
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card border border-border/60 text-foreground rounded-bl-sm shadow-xs"
                    }`}
                  >
                    {msg.message}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 px-1">
                    {formatTime(msg.timestamp)}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex-shrink-0 px-4 py-3 bg-background/90 backdrop-blur-sm border-t border-border/30 flex gap-2 items-center"
      >
        <Input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Say something sweet..."
          className="flex-1 rounded-full h-10 px-4 border-border/50 bg-card"
          data-ocid="chat.message.input"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!messageText.trim() || sendMessage.isPending}
          className="w-10 h-10 rounded-full shadow-soft flex-shrink-0"
          data-ocid="chat.send.primary_button"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

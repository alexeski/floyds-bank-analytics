"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import ScoutChat from "./ScoutChat";
import { askScout, type ScoutMessage } from "./askScout";
import type { TranscriptMessage } from "./protocol";

export type ScoutStatus = {
  label: string;
  /** performance.now() when the current question was sent. */
  startedAt: number;
};

type ScoutContextValue = {
  isOpen: boolean;
  isThinking: boolean;
  status: ScoutStatus | null;
  messages: readonly ScoutMessage[];
  openChat: () => void;
  closeChat: () => void;
  ask: (question: string) => Promise<void>;
};

const ScoutContext = createContext<ScoutContextValue | null>(null);

export function useScout() {
  const context = useContext(ScoutContext);
  if (!context) {
    throw new Error("useScout must be used within a ScoutProvider");
  }
  return context;
}

export default function ScoutProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<ScoutStatus | null>(null);
  const [messages, setMessages] = useState<ScoutMessage[]>([]);
  // The full transcript, including tool calls and results, which the server
  // needs to continue multi-step tools. Only the text is shown.
  const transcriptRef = useRef<TranscriptMessage[]>([]);
  const busyRef = useRef(false);

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);

  const ask = useCallback(async (question: string) => {
    const content = question.trim();
    if (!content || busyRef.current) return;
    busyRef.current = true;

    const replyId = crypto.randomUUID();
    const startedAt = performance.now();
    setIsOpen(true);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content },
      { id: replyId, role: "assistant", content: "" },
    ]);
    setStatus({ label: "Sending", startedAt });

    const updateReply = (update: (message: ScoutMessage) => ScoutMessage) =>
      setMessages((prev) =>
        prev.map((message) => (message.id === replyId ? update(message) : message)),
      );

    try {
      await askScout(content, transcriptRef.current, (event) => {
        switch (event.type) {
          case "status":
            setStatus({ label: event.label, startedAt });
            break;
          case "text":
            updateReply((message) => ({ ...message, content: message.content + event.delta }));
            break;
          case "discard":
            updateReply((message) => ({ ...message, content: "" }));
            break;
          case "done":
            transcriptRef.current = event.transcript;
            break;
          case "error":
            updateReply((message) => ({
              ...message,
              error: true,
              content: message.content
                ? `${message.content}\n\n${event.message}`
                : event.message,
            }));
            break;
        }
      });
    } catch {
      updateReply((message) => ({
        ...message,
        error: true,
        content: "Scout couldn't be reached. Check that the dev server is running.",
      }));
    } finally {
      busyRef.current = false;
      setStatus(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      isThinking: status !== null,
      status,
      messages,
      openChat,
      closeChat,
      ask,
    }),
    [isOpen, status, messages, openChat, closeChat, ask],
  );

  return (
    <ScoutContext value={value}>
      {children}
      <ScoutChat />
    </ScoutContext>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import ScoutChat from "./ScoutChat";
import { askScout, type ScoutMessage } from "./askScout";

type ScoutContextValue = {
  isOpen: boolean;
  isThinking: boolean;
  messages: readonly ScoutMessage[];
  openChat: () => void;
  closeChat: () => void;
  ask: (question: string) => Promise<void>;
  /** Clears the conversation, unless Scout is still answering. */
  newChat: () => void;
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
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ScoutMessage[]>([]);

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);

  const ask = useCallback(
    async (question: string) => {
      const content = question.trim();
      if (!content) return;

      const userMessage: ScoutMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
      };
      setIsOpen(true);
      setMessages((prev) => [...prev, userMessage]);
      setIsThinking(true);
      try {
        const reply = await askScout(content, [...messages, userMessage]);
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: reply },
        ]);
      } finally {
        setIsThinking(false);
      }
    },
    [messages],
  );

  const newChat = useCallback(() => {
    if (!isThinking) setMessages([]);
  }, [isThinking]);

  const value = useMemo(
    () => ({ isOpen, isThinking, messages, openChat, closeChat, ask, newChat }),
    [isOpen, isThinking, messages, openChat, closeChat, ask, newChat],
  );

  return (
    <ScoutContext value={value}>
      {children}
      <ScoutChat />
    </ScoutContext>
  );
}

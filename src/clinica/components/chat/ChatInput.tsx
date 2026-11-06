import React, { useEffect, useRef, useState } from "react";
import { SendHorizontal, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isStreaming: boolean;
  onCancelStream: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
  onCancelStream,
}) => {
  const [inputMessage, setInputMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height según contenido
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const nextHeight = Math.min(textareaRef.current.scrollHeight, 160);
      textareaRef.current.style.height = `${nextHeight}px`;
      textareaRef.current.style.overflowY = textareaRef.current.scrollHeight > 160 ? "auto" : "hidden";
    }
  }, [inputMessage]);

  const handleSend = () => {
    if (!inputMessage.trim() || isStreaming) return;
    onSendMessage(inputMessage.trim());
    setInputMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Detectar dispositivo móvil / táctil
    const isMobile =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth < 768;

    if (e.key === "Enter" && !e.shiftKey) {
      if (!isMobile) {
        e.preventDefault();
        handleSend();
      }
      // En móvil, Enter inserta salto de línea por defecto
    }
  };

  return (
    <div className="shrink-0 border-t border-border/60 bg-background/90 px-3 py-3 backdrop-blur md:px-6 md:py-4">
      <div className="mx-auto flex max-w-4xl items-end gap-2 rounded-xl border border-border bg-card p-2 transition-colors focus-within:border-sidebar-primary/50 focus-within:ring-2 focus-within:ring-sidebar-primary/10">
        <Textarea
          ref={textareaRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={4000}
          placeholder="Pregunta por citas, pacientes u horarios…"
          aria-label="Escribe tu pregunta para el asistente clínico"
          className="min-h-[44px] max-h-[160px] flex-1 resize-none border-0 bg-transparent px-3 py-3 text-sm leading-6 focus-visible:ring-0 focus-visible:ring-offset-0"
          rows={1}
        />

        {isStreaming ? (
          <Button
            type="button"
            size="icon"
            onClick={onCancelStream}
            className="h-11 w-11 shrink-0 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            title="Detener respuesta"
            aria-label="Detener respuesta"
          >
            <Square className="w-4 h-4 fill-current" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            className="h-11 w-11 shrink-0 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary/90"
            title="Enviar mensaje"
            aria-label="Enviar mensaje"
          >
            <SendHorizontal className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="mx-auto mt-2 max-w-4xl px-1 text-[11px] leading-5 text-muted-foreground">
        El asistente consulta solo la información habilitada para tu usuario. Confirma los datos antes de actuar.
      </div>
    </div>
  );
};

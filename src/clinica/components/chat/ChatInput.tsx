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
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        160
      )}px`;
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
    <div className="shrink-0 p-3 md:p-4 border-t border-border/60 bg-background/95 backdrop-blur-xs select-none">
      <div className="max-w-4xl mx-auto flex items-end gap-2 bg-muted/50 rounded-2xl p-2 border border-border/60 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
        <Textarea
          ref={textareaRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe una pregunta sobre citas, pacientes, consultas u horarios..."
          className="flex-1 min-h-[40px] max-h-[160px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-xs resize-none py-2.5 px-3"
          rows={1}
        />

        {isStreaming ? (
          <Button
            type="button"
            size="icon"
            onClick={onCancelStream}
            className="h-9 w-9 rounded-xl shrink-0 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            title="Detener respuesta"
          >
            <Square className="w-4 h-4 fill-current" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            className="h-9 w-9 rounded-xl shrink-0 shadow-xs"
            title="Enviar mensaje"
          >
            <SendHorizontal className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="text-[10px] text-center text-muted-foreground mt-2">
        El asistente puede cometer errores. Verifica la información clínica importante.
      </div>
    </div>
  );
};

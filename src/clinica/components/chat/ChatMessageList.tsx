import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import {
  Bot,
  Calendar,
  Clock,
  Loader2,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  User,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useSendChatFeedback } from "@/clinica/hooks/useChat";
import type { ChatMessageDto } from "@/interfaces/Chat.response";

interface ChatMessageListProps {
  messages: ChatMessageDto[];
  isLoading: boolean;
  isStreaming: boolean;
  streamingText: string;
  activeToolName?: string | null;
  onSelectSuggestion: (question: string) => void;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isLoading,
  isStreaming,
  streamingText,
  activeToolName,
  onSelectSuggestion,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Estado para modal de feedback
  const [feedbackMsgId, setFeedbackMsgId] = useState<number | null>(null);
  const [isPositiveFeedback, setIsPositiveFeedback] = useState<boolean>(true);
  const [feedbackComment, setFeedbackComment] = useState<string>("");

  const sendFeedbackMutation = useSendChatFeedback();

  // Auto-scroll inteligente: solo baja automáticamente si el usuario ya estaba abajo
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    setIsAtBottom(distanceToBottom < 80);
  };

  useEffect(() => {
    if (isAtBottom && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, streamingText, isStreaming, isAtBottom]);

  const handleOpenFeedback = (msgId: number, isPositive: boolean) => {
    setFeedbackMsgId(msgId);
    setIsPositiveFeedback(isPositive);
    setFeedbackComment("");
  };

  const handleSaveFeedback = async () => {
    if (!feedbackMsgId) return;
    await sendFeedbackMutation.mutateAsync({
      messageId: feedbackMsgId,
      isPositive: isPositiveFeedback,
      comment: feedbackComment.trim() || null,
    });
    setFeedbackMsgId(null);
  };

  const getToolDisplayName = (name?: string | null) => {
    if (!name) return "Ejecutando acción del sistema...";
    if (name.includes("ObtenerCitas")) return "Consultando las citas agendadas...";
    if (name.includes("BuscarPacientes")) return "Buscando pacientes en el sistema...";
    if (name.includes("ObtenerHorarios")) return "Consultando horarios de la clínica...";
    return `Ejecutando ${name}...`;
  };

  // Determinar índice para colocar el separador de los 5 mensajes de memoria
  const memoryBoundaryIndex = Math.max(0, messages.length - 5);

  const suggestedQuestions = [
    {
      icon: Calendar,
      title: "Citas agendadas hoy",
      prompt: "¿Cuáles son las citas médicas agendadas para el día de hoy?",
    },
    {
      icon: Users,
      title: "Buscar paciente",
      prompt: "Buscar información del paciente con DNI o por su nombre.",
    },
    {
      icon: Clock,
      title: "Horarios de la clínica",
      prompt: "¿Cuáles son los horarios de apertura y cierre de la clínica esta semana?",
    },
    {
      icon: Sparkles,
      title: "Disponibilidad médica",
      prompt: "¿Qué doctores y especialidades tienen horario disponible hoy?",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 p-6 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-16 w-3/4 rounded-xl" />
        </div>
        <div className="flex items-start gap-3 flex-row-reverse">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-12 w-2/3 rounded-xl" />
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto select-none">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-sm">
          <Bot className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-foreground mb-1">
          Asistente Virtual Clínico
        </h3>
        <p className="text-xs text-muted-foreground mb-6 max-w-md">
          Puedo ayudarte a consultar la agenda de citas, buscar información de pacientes, horarios
          de atención y gestionar consultas de la clínica.
        </p>

        {/* Sugerencias de preguntas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {suggestedQuestions.map((s, idx) => {
            const Icon = s.icon;
            return (
              <button
                key={idx}
                onClick={() => onSelectSuggestion(s.prompt)}
                className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-card hover:bg-accent/50 text-left transition-colors group shadow-xs"
              >
                <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">{s.title}</div>
                  <div className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                    {s.prompt}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      role="log"
      aria-live="polite"
      className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-4"
    >
      {messages.map((msg, index) => {
        const sender = (msg.senderType || "").toLowerCase();
        const isUser =
          sender === "usuario" ||
          sender === "user" ||
          sender === "1" ||
          sender.includes("user") ||
          sender.includes("usuario");

        const showMemorySeparator = index === memoryBoundaryIndex && messages.length > 5;

        return (
          <React.Fragment key={msg.id || index}>
            {/* Separador de memoria de 5 mensajes */}
            {showMemorySeparator && (
              <div className="flex items-center gap-3 my-4">
                <div className="h-px flex-1 bg-border/60" />
                <Badge
                  variant="outline"
                  className="text-[10px] text-muted-foreground font-normal bg-background/80"
                >
                  Límite de memoria del asistente (últimos 5 mensajes)
                </Badge>
                <div className="h-px flex-1 bg-border/60" />
              </div>
            )}

            <div
              className={`flex items-start gap-3 w-full ${
                isUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <Avatar className="w-7 h-7 shrink-0 border border-border/40">
                <AvatarFallback
                  className={
                    isUser
                      ? "bg-primary text-primary-foreground text-xs"
                      : "bg-muted text-foreground text-xs"
                  }
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </AvatarFallback>
              </Avatar>

              {/* Burbuja de Mensaje */}
              <div className={`group flex flex-col max-w-[85%] md:max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    isUser
                      ? "bg-primary text-primary-foreground rounded-tr-xs rounded-br-2xl"
                      : "bg-muted/80 text-foreground border border-border/50 rounded-tl-xs rounded-bl-2xl"
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <div className="prose prose-xs dark:prose-invert max-w-none break-words">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* Acciones del mensaje del asistente (Feedback y métricas) */}
                {!isUser && (
                  <div className="flex items-center gap-2 mt-1.5 px-1 text-[11px] text-muted-foreground opacity-95 group-hover:opacity-100 transition-opacity">
                    {msg.executionTimeMs && (
                      <span className="text-[10px]">{msg.executionTimeMs}ms</span>
                    )}
                    {msg.tokensUsed && (
                      <span className="text-[10px]">• {msg.tokensUsed} tokens</span>
                    )}

                    <div className="flex items-center gap-1 ml-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenFeedback(msg.id, true)}
                        className="h-5 w-5 hover:text-green-600"
                        title="Respuesta útil"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenFeedback(msg.id, false)}
                        className="h-5 w-5 hover:text-destructive"
                        title="Respuesta no útil"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* Streaming Activo y Herramientas */}
      {isStreaming && (
        <div className="flex items-start gap-3 flex-row">
          <Avatar className="w-7 h-7 shrink-0 border border-border/40">
            <AvatarFallback className="bg-muted text-foreground text-xs">
              <Bot className="w-3.5 h-3.5" />
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col max-w-[85%] md:max-w-[75%] space-y-2">
            {/* Indicador de Ejecución de Herramienta en lenguaje natural */}
            {activeToolName && (
              <Badge
                variant="secondary"
                className="w-fit gap-1.5 py-1 px-2.5 text-[11px] font-normal animate-pulse"
              >
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                {getToolDisplayName(activeToolName)}
              </Badge>
            )}

            {/* Contenido progresivo en streaming */}
            <div className="p-3.5 rounded-2xl rounded-tl-xs bg-muted/80 text-foreground border border-border/50 text-xs leading-relaxed shadow-xs">
              {streamingText ? (
                <div className="prose prose-xs dark:prose-invert max-w-none break-words">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                  >
                    {streamingText}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Escribiendo respuesta...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Diálogo para Comentario de Feedback */}
      <Dialog open={!!feedbackMsgId} onOpenChange={(open) => !open && setFeedbackMsgId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {isPositiveFeedback ? "Calificar respuesta positiva" : "Reportar problema en respuesta"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <p className="text-xs text-muted-foreground">
              {isPositiveFeedback
                ? "¿Qué te pareció útil de esta respuesta? (Opcional)"
                : "¿En qué puede mejorar la respuesta del asistente? (Opcional)"}
            </p>
            <Textarea
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Escribe tu comentario..."
              className="text-xs min-h-[80px]"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setFeedbackMsgId(null)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSaveFeedback}>
              Enviar feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

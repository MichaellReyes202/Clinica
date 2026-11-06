import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import {
  Calendar,
  Clock,
  ArrowUpRight,
  Loader2,
  Search,
  Stethoscope,
  ThumbsDown,
  ThumbsUp,
  User,
  UserPlus,
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

const markdownComponents: Components = {
  table: ({ children, ...props }) => (
    <div className="my-3 min-w-0 max-w-full overflow-x-auto rounded-xl border border-border/70">
      <table className="m-0 w-full min-w-[360px] border-collapse text-left text-xs md:text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-blue-50/80 text-foreground dark:bg-blue-950/40" {...props}>{children}</thead>
  ),
  th: ({ children, ...props }) => (
    <th className="whitespace-nowrap px-3 py-2.5 font-semibold" {...props}>{children}</th>
  ),
  tr: ({ children, ...props }) => (
    <tr className="border-b border-border/60 last:border-0" {...props}>{children}</tr>
  ),
  td: ({ children, ...props }) => (
    <td className="px-3 py-2.5 align-top" {...props}>{children}</td>
  ),
};

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
    sendFeedbackMutation.mutate({
      messageId: feedbackMsgId,
      isPositive: isPositiveFeedback,
      comment: feedbackComment.trim() || null,
    }, {
      onSuccess: () => setFeedbackMsgId(null),
    });
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
      title: "Agenda de hoy",
      detail: "Citas por hora, paciente y estado.",
      prompt: "¿Cuáles son las citas médicas agendadas para hoy?",
    },
    {
      icon: UserPlus,
      title: "Últimos pacientes",
      detail: "Registros recientes, del más nuevo al más antiguo.",
      prompt: "Muéstrame los últimos pacientes registrados.",
    },
    {
      icon: Search,
      title: "Buscar paciente",
      detail: "Encuentra por nombre, apellido o DNI.",
      prompt: "Busca a un paciente por nombre o DNI.",
    },
    {
      icon: Clock,
      title: "Horario de atención",
      detail: "Días abiertos y horas de apertura y cierre.",
      prompt: "¿Cuál es el horario de atención de la clínica?",
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
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-8 md:px-8 md:py-12">
        <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col justify-center">
          <div className="mb-8 max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">
              <Stethoscope className="h-4 w-4" />
              <span>Consultas de clínica</span>
            </div>
            <h3 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              ¿Qué necesitas consultar?
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Revisa la agenda, consulta pacientes o confirma los horarios de atención.
            </p>
          </div>

          <div className="w-full max-w-3xl">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Consultas frecuentes</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-10">
          {suggestedQuestions.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.title}
                onClick={() => onSelectSuggestion(s.prompt)}
                className="group flex min-h-[76px] items-center gap-3 border-b border-border/70 py-3 text-left transition-colors duration-150 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:text-blue-300"
              >
                <Icon className="h-4 w-4 shrink-0 text-blue-700 dark:text-blue-300" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground">{s.title}</div>
                  <div className="mt-0.5 text-xs leading-5 text-muted-foreground">{s.detail}</div>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
              </button>
            );
          })}
            </div>
          </div>
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
      className="flex-1 min-h-0 overflow-y-auto px-4 py-6 md:px-8 md:py-8"
    >
      <div className="mx-auto w-full max-w-4xl min-w-0 space-y-6">
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
              className={`flex w-full min-w-0 items-start gap-3 ${
                isUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <Avatar className="h-9 w-9 shrink-0 border border-blue-200/70 shadow-sm dark:border-blue-900">
                <AvatarFallback
                  className={
                    isUser
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                  }
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Stethoscope className="w-3.5 h-3.5" />}
                </AvatarFallback>
              </Avatar>

              {/* Burbuja de Mensaje */}
              <div className={`group flex w-full min-w-0 max-w-[88%] flex-col md:max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
                <div
                  className={`w-full min-w-0 max-w-full rounded-2xl px-4 py-3.5 text-sm leading-6 shadow-sm ${
                    isUser
                      ? "rounded-tr-sm bg-sidebar-primary text-sidebar-primary-foreground"
                      : "rounded-tl-sm border-l-2 border-blue-100 border-l-blue-600/60 bg-muted/30 text-foreground dark:border-border dark:bg-card/70"
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                  ) : (
                    <div className="prose prose-sm min-w-0 max-w-full break-words leading-7 dark:prose-invert">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                        components={markdownComponents}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* Acciones del mensaje del asistente (Feedback y métricas) */}
                {!isUser && (
                  <div className="mt-1.5 flex items-center gap-2 px-1 text-xs text-muted-foreground">
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
                        className="h-8 w-8 hover:text-green-700"
                        title="Respuesta útil"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenFeedback(msg.id, false)}
                        className="h-8 w-8 hover:text-destructive"
                        title="Respuesta no útil"
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
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
        <div className="flex w-full min-w-0 items-start gap-3 flex-row">
          <Avatar className="h-9 w-9 shrink-0 border border-blue-200/70 shadow-sm dark:border-blue-900">
            <AvatarFallback className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              <Stethoscope className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>

          <div className="flex w-full min-w-0 max-w-[88%] flex-col space-y-2 md:max-w-[78%]">
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
            <div className="w-full min-w-0 max-w-full rounded-2xl rounded-tl-sm border-l-2 border-blue-100 border-l-blue-600/60 bg-muted/30 px-4 py-3.5 text-sm leading-6 text-foreground dark:border-border dark:bg-card/70">
              {streamingText ? (
                <div className="prose prose-sm min-w-0 max-w-full break-words leading-7 dark:prose-invert">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                    components={markdownComponents}
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
            <DialogTitle className="text-base">
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
              className="min-h-[96px] text-sm"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={() => setFeedbackMsgId(null)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSaveFeedback} disabled={sendFeedbackMutation.isPending}>
              {sendFeedbackMutation.isPending ? "Enviando…" : "Enviar comentario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

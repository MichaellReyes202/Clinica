import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import {
  Calendar,
  Check,
  Clock,
  ArrowUpRight,
  CircleCheck,
  Clipboard,
  ChevronDown,
  Loader2,
  Search,
  Stethoscope,
  ThumbsDown,
  ThumbsUp,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";

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
    <div className="my-4 min-w-0 max-w-full overflow-x-auto rounded-lg border border-border bg-card">
      <table className="m-0 w-full min-w-[360px] border-collapse text-left text-xs md:text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-muted text-muted-foreground" {...props}>{children}</thead>
  ),
  th: ({ children, ...props }) => (
    <th className="whitespace-nowrap px-4 py-2.5 font-semibold" {...props}>{children}</th>
  ),
  tr: ({ children, ...props }) => (
    <tr className="border-b border-border transition-colors hover:bg-muted/50 last:border-0" {...props}>{children}</tr>
  ),
  td: ({ children, ...props }) => (
    <td className="px-4 py-2.5 align-top text-foreground" {...props}>{children}</td>
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
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);

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

  const handleCopyMessage = async (message: ChatMessageDto) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageId(message.id);
      window.setTimeout(() => setCopiedMessageId(null), 1600);
    } catch {
      toast.error("No se pudo copiar la respuesta.");
    }
  };

  const formatExecutionTime = (milliseconds?: number | null) => {
    if (milliseconds == null) return null;
    return `${(milliseconds / 1000).toFixed(1)} s`;
  };

  const getToolDisplayName = (name?: string | null) => {
    if (!name) return "Procesando tu consulta…";
    if (name.includes("AgendarCita")) return "Registrando la cita…";
    if (name.includes("BuscarCitas")) return "Buscando citas…";
    if (name.includes("CambiarOCancelarCita")) return "Actualizando la cita…";
    if (name.includes("BuscarPacientes")) return "Buscando pacientes…";
    if (name.includes("BuscarMedicos")) return "Revisando disponibilidad…";
    if (name.includes("ObtenerHorarios")) return "Consultando el horario…";
    if (name.includes("ApoyoClinico")) return "Registrando la solicitud clínica…";
    if (name.includes("ExcepcionesDeCitas")) return "Revisando solicitudes de citas…";
    if (name.includes("ResolverExcepcion")) return "Actualizando la solicitud de cita…";
    if (name.includes("ResolverApoyo")) return "Actualizando la solicitud clínica…";
    if (name.includes("ObtenerCitas")) return "Consultando la agenda…";
    return "Procesando tu consulta…";
  };

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
      <div className="flex flex-1 flex-col gap-4 bg-background p-6">
        <div className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-full bg-muted" />
          <Skeleton className="h-16 w-3/4 rounded-xl bg-muted" />
        </div>
        <div className="flex items-start gap-3 flex-row-reverse">
          <Skeleton className="h-8 w-8 rounded-full bg-muted" />
          <Skeleton className="h-12 w-2/3 rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex min-h-0 flex-1 overflow-y-auto bg-background px-5 py-8 md:px-10 md:py-12">
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center">
          <div className="mb-9 max-w-2xl">
            <div className="mb-5 flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-sidebar-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sidebar-primary/10">
                <Stethoscope className="h-3.5 w-3.5" />
              </span>
              <span>Asistente clínico</span>
            </div>
            <h3 className="text-[28px] font-medium tracking-[-0.03em] text-foreground md:text-[34px]">
              ¿Qué necesitas consultar?
            </h3>
            <p className="mt-3 max-w-xl text-[14px] leading-6 text-muted-foreground">
              Revisa la agenda, consulta pacientes o confirma los horarios de atención.
            </p>
          </div>

          <div className="w-full max-w-3xl">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Consultas frecuentes</p>
            <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.title}
                onClick={() => onSelectSuggestion(s.prompt)}
                className="group inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-left text-sm transition-colors hover:border-sidebar-primary/40 hover:bg-sidebar-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon className="h-4 w-4 shrink-0 text-sidebar-primary" />
                <span className="font-medium text-foreground">{s.title}</span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-sidebar-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
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
      className="min-h-0 flex-1 overflow-y-auto bg-background px-4 py-7 md:px-8 md:py-9"
    >
      <div className="mx-auto w-full max-w-3xl min-w-0 space-y-8">
      {messages.map((msg, index) => {
        const sender = (msg.senderType || "").toLowerCase();
        const isUser =
          sender === "usuario" ||
          sender === "user" ||
          sender === "1" ||
          sender.includes("user") ||
          sender.includes("usuario");

        return (
          <React.Fragment key={msg.id || index}>
            <div
              className={`flex w-full min-w-0 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div className={`group flex min-w-0 flex-col ${isUser ? "max-w-[88%] md:max-w-[74%]" : "w-full max-w-full md:max-w-[90%]"}`}>
                {!isUser && (
                  <div className="mb-2 flex items-center gap-2 px-1 text-[10px] font-medium uppercase tracking-[0.12em] text-sidebar-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
                    Asistente clínico
                  </div>
                )}
                {!isUser && msg.executionTimeMs != null && (
                  <details className="group/status mb-2 w-fit max-w-full rounded-full border border-border bg-card text-xs text-muted-foreground">
                    <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-1.5 [&::-webkit-details-marker]:hidden">
                      <CircleCheck className="h-3.5 w-3.5 shrink-0 text-sidebar-primary" />
                      <span>Consulta completada en {formatExecutionTime(msg.executionTimeMs)}</span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform group-open/status:rotate-180" />
                    </summary>
                    <div className="px-3 pb-2 pl-8 text-xs leading-5">
                      <p>Tiempo total de generación registrado para esta respuesta.</p>
                      {!!msg.toolNames?.length && (
                        <ul className="mt-1.5 space-y-1">
                          {[...new Set(msg.toolNames)].map((toolName) => (
                            <li key={toolName} className="flex items-center gap-1.5">
                              <Check className="h-3 w-3 text-sidebar-primary" />
                              {getToolDisplayName(toolName)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </details>
                )}
                <div
                  className={`w-full min-w-0 max-w-full text-[14px] leading-7 ${
                    isUser
                      ? "rounded-2xl rounded-tr-sm bg-sidebar-primary px-4 py-3 text-sidebar-primary-foreground"
                      : "px-1 py-0.5 text-foreground"
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                  ) : (
                    <div className="prose prose-sm min-w-0 max-w-full break-words leading-7 prose-headings:font-medium prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-a:text-sidebar-primary prose-li:text-foreground">
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
                  <div className="mt-2 flex items-center gap-2 px-1 text-[10px] text-muted-foreground">
                    {msg.executionTimeMs != null && (
                      <span className="text-[10px]" title={`${msg.executionTimeMs.toLocaleString()} ms de tiempo de generación`}>
                        {formatExecutionTime(msg.executionTimeMs)}
                      </span>
                    )}
                    {msg.tokensUsed && (
                      <span className="text-[10px]">• {msg.tokensUsed} tokens</span>
                    )}

                    <div className="ml-auto flex items-center gap-1 opacity-75 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => void handleCopyMessage(msg)}
                        className="h-7 w-7 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title={copiedMessageId === msg.id ? "Copiado" : "Copiar al portapapeles"}
                        aria-label={copiedMessageId === msg.id ? "Respuesta copiada" : "Copiar respuesta"}
                      >
                        {copiedMessageId === msg.id ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenFeedback(msg.id, true)}
                        className="h-7 w-7 text-muted-foreground hover:bg-muted hover:text-sidebar-primary"
                        title="Respuesta útil"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenFeedback(msg.id, false)}
                        className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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
        <div className="flex w-full min-w-0 justify-start">
          <div className="flex w-full min-w-0 max-w-full flex-col space-y-2 md:max-w-[90%]">
            <details className="group/status w-fit max-w-full rounded-full border border-border bg-card text-xs text-muted-foreground">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-1.5 [&::-webkit-details-marker]:hidden">
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-sidebar-primary" />
                <span>{getToolDisplayName(activeToolName)}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform group-open/status:rotate-180" />
              </summary>
              <p className="px-3 pb-2 pl-8 text-xs leading-5">Estoy revisando la información necesaria para responder.</p>
            </details>

            {/* Contenido progresivo en streaming */}
            <div className="w-full min-w-0 max-w-full px-1 py-0.5 text-[14px] leading-7 text-foreground">
              {streamingText ? (
                <div className="prose prose-sm min-w-0 max-w-full break-words leading-7 prose-headings:font-medium prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-a:text-sidebar-primary prose-li:text-foreground">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                    components={markdownComponents}
                  >
                    {streamingText}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-sidebar-primary" />
                  Escribiendo respuesta...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Diálogo para Comentario de Feedback */}
      <Dialog open={!!feedbackMsgId} onOpenChange={(open) => !open && setFeedbackMsgId(null)}>
        <DialogContent className="border-border bg-popover text-popover-foreground sm:max-w-[400px]">
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
              className="min-h-[96px] border-input bg-background text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={() => setFeedbackMsgId(null)} className="border-border bg-transparent text-foreground hover:bg-muted">
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSaveFeedback} disabled={sendFeedbackMutation.isPending} className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
              {sendFeedbackMutation.isPending ? "Enviando…" : "Enviar comentario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

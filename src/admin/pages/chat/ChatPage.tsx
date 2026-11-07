import React, { useEffect, useState } from "react";
import { ArrowLeft, PanelLeftClose, PanelLeftOpen, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatSidebar } from "@/clinica/components/chat/ChatSidebar";
import { ChatMessageList } from "@/clinica/components/chat/ChatMessageList";
import { ChatInput } from "@/clinica/components/chat/ChatInput";
import { useChatConversationDetail, useChatStream } from "@/clinica/hooks/useChat";
import type { ChatMessageDto } from "@/interfaces/Chat.response";

export const ChatPage: React.FC = () => {
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [localMessages, setLocalMessages] = useState<ChatMessageDto[]>([]);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(true);

  // Cargar detalle de la conversación activa desde TanStack Query
  const { data: conversationDetail, isLoading: isLoadingDetail } = useChatConversationDetail(activeConversationId);

  // Hook de streaming SSE con AbortController
  const { isStreaming, streamingText, sendMessageStream, cancelStream } = useChatStream();

  // Sincronizar mensajes cargados desde el servidor
  useEffect(() => {
    if (conversationDetail?.messages) {
      setLocalMessages(conversationDetail.messages);
    } else if (!activeConversationId) {
      setLocalMessages([]);
    }
  }, [conversationDetail, activeConversationId]);

  const handleSelectConversation = (id: number | null) => {
    // Si cambia de conversación con un stream activo, se cancela automáticamente
    if (isStreaming) {
      cancelStream();
    }
    setActiveConversationId(id);
    setLocalMessages([]);
    setIsMobileChatOpen(id !== null);
  };

  const handleNewConversation = () => {
    if (isStreaming) {
      cancelStream();
    }
    setActiveConversationId(null);
    setLocalMessages([]);
    setIsMobileChatOpen(true);
  };

  const handleSendMessage = async (messageText: string) => {
    setIsMobileChatOpen(true);
    // Actualización Optimista : Mostrar mensaje del usuario de inmediato en la UI
    const optimisticUserMsg: ChatMessageDto = {
      id: Date.now(),
      senderType: "Usuario",
      content: messageText,
      createdAt: new Date().toISOString(),
    };

    setLocalMessages((prev) => [...prev, optimisticUserMsg]);

    // Iniciar streaming SSE hacia la API
    await sendMessageStream(activeConversationId, messageText, (id) => {
      setActiveConversationId(id);
    });
  };

  return (
    <div className="flex min-h-0 h-full w-full flex-1 overflow-hidden bg-background text-foreground">
      {/* Columna 1: Barra Lateral */}
      <ChatSidebar
        className={isHistoryVisible ? (isMobileChatOpen ? "hidden xl:flex" : "flex") : "hidden"}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />

      {/* Columna 2: Área Principal de Chat */}
      <main className={`${isMobileChatOpen ? "flex" : "hidden xl:flex"} min-h-0 h-full min-w-0 flex-1 flex-col overflow-hidden bg-background text-foreground`}>
        {/* Cabecera del Chat */}
        <header className="relative shrink-0 border-b border-border bg-card px-4 py-3 md:px-8 md:py-3.5">
          <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (isStreaming) cancelStream();
                setIsMobileChatOpen(false);
                setIsHistoryVisible(true);
              }}
              className="h-9 w-9 text-muted-foreground hover:bg-muted hover:text-foreground xl:hidden"
              aria-label="Volver a conversaciones"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsHistoryVisible((visible) => !visible)}
              className="hidden h-9 w-9 text-muted-foreground hover:bg-muted hover:text-foreground xl:inline-flex"
              aria-label={isHistoryVisible ? "Ocultar historial" : "Mostrar historial"}
              title={isHistoryVisible ? "Ocultar historial" : "Mostrar historial"}
            >
              {isHistoryVisible ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </Button>
          </div>
          <div className="mx-auto flex min-h-9 w-full max-w-3xl items-center justify-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/10 text-sidebar-primary">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-primary">
                Asistente clínico
              </p>
              <h2 className="truncate text-sm font-medium text-card-foreground md:text-[15px]">
                {conversationDetail?.title || (localMessages.length ? "Nueva consulta" : "Nueva conversación")}
              </h2>
            </div>
          </div>
        </header>

        {/* Lista de Mensajes */}
        <ChatMessageList
          messages={localMessages}
          isLoading={isLoadingDetail}
          isStreaming={isStreaming}
          streamingText={streamingText}
          onSelectSuggestion={handleSendMessage}
        />

        {/* Input de Entrada */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          onCancelStream={cancelStream}
        />
      </main>
    </div>
  );
};

export default ChatPage;

import React, { useEffect, useState } from "react";
import { ArrowLeft, Stethoscope } from "lucide-react";
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
    <div className="flex flex-1 h-full w-full bg-background overflow-hidden min-h-0">
      {/* Columna 1: Barra Lateral */}
      <ChatSidebar
        className={isMobileChatOpen ? "hidden xl:flex" : "flex"}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />

      {/* Columna 2: Área Principal de Chat */}
      <main className={`${isMobileChatOpen ? "flex" : "hidden xl:flex"} flex-1 flex-col h-full min-w-0 min-h-0 overflow-hidden bg-background`}>
        {/* Cabecera del Chat */}
        <header className="shrink-0 border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur md:px-7 md:py-4">
          <div className="mx-auto flex w-full max-w-5xl items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (isStreaming) cancelStream();
                setIsMobileChatOpen(false);
              }}
              className="-ml-2 h-9 w-9 shrink-0 xl:hidden"
              aria-label="Volver a conversaciones"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300">
                Asistente clínico
              </p>
              <h2 className="truncate text-sm font-semibold text-foreground md:text-base">
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

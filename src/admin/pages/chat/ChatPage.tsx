import React, { useEffect, useState } from "react";
import { ChatSidebar } from "@/clinica/components/chat/ChatSidebar";
import { ChatMessageList } from "@/clinica/components/chat/ChatMessageList";
import { ChatInput } from "@/clinica/components/chat/ChatInput";
import {
  useChatConversationDetail,
  useChatStream,
} from "@/clinica/hooks/useChat";
import type { ChatMessageDto } from "@/interfaces/Chat.response";

export const ChatPage: React.FC = () => {
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [localMessages, setLocalMessages] = useState<ChatMessageDto[]>([]);

  // Cargar detalle de la conversación activa desde TanStack Query
  const { data: conversationDetail, isLoading: isLoadingDetail } =
    useChatConversationDetail(activeConversationId);

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
  };

  const handleNewConversation = () => {
    if (isStreaming) {
      cancelStream();
    }
    setActiveConversationId(null);
    setLocalMessages([]);
  };

  const handleSendMessage = async (messageText: string) => {
    // Actualización Optimista (Regla): Mostrar mensaje del usuario de inmediato en la UI
    const optimisticUserMsg: ChatMessageDto = {
      id: Date.now(),
      senderType: "Usuario",
      content: messageText,
      createdAt: new Date().toISOString(),
    };

    setLocalMessages((prev) => [...prev, optimisticUserMsg]);

    // Iniciar streaming SSE hacia la API
    await sendMessageStream(activeConversationId, messageText);
  };

  return (
    <div className="flex flex-1 h-full w-full bg-background overflow-hidden min-h-0">
      {/* Columna 1: Barra Lateral */}
      <ChatSidebar
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />

      {/* Columna 2: Área Principal de Chat */}
      <main className="flex-1 flex flex-col h-full bg-background min-w-0 min-h-0 overflow-hidden">
        {/* Cabecera del Chat */}
        <header className="px-6 py-3.5 border-b border-border/60 flex items-center justify-between bg-card/40 backdrop-blur-xs select-none shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-foreground truncate">
              {conversationDetail?.title || "Nueva conversación de asistencia"}
            </h2>
            {conversationDetail?.roleName && (
              <p className="text-[11px] text-muted-foreground">
                Rol: {conversationDetail.roleName}
              </p>
            )}
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

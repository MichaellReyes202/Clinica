import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  archiveConversationAction,
  deleteConversationAction,
  getConversationDetailAction,
  getConversationsAction,
  renameConversationAction,
  sendChatFeedbackAction,
  streamChatMessageAction,
  togglePinConversationAction,
} from "@/clinica/actions/Chat.action";
import type { ChatFeedbackDto } from "@/interfaces/Chat.response";
import type { Options } from "@/interfaces/Paginated.response";

// ── 1. TanStack Queries para Conversaciones y Mensajes ──────────────

export const useChatConversations = (
  options?: Options,
  includeArchived: boolean = false
) =>
  useQuery({
    queryKey: ["chat-conversations", options, includeArchived],
    queryFn: () => getConversationsAction(options, includeArchived),
    staleTime: 1000 * 60 * 2,
  });

export const useChatConversationDetail = (conversationId: number | null) =>
  useQuery({
    queryKey: ["chat-conversation-detail", conversationId],
    queryFn: () => getConversationDetailAction(conversationId!),
    enabled: !!conversationId && conversationId > 0,
    staleTime: 1000 * 30,
  });

// ── 2. TanStack Mutations para Operaciones REST ──────────────────────

export const useRenameConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) =>
      renameConversationAction(id, title),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      queryClient.invalidateQueries({ queryKey: ["chat-conversation-detail", id] });
      toast.success("Conversación renombrada correctamente.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Error al renombrar la conversación.");
    },
  });
};

export const useTogglePinConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => togglePinConversationAction(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      queryClient.invalidateQueries({ queryKey: ["chat-conversation-detail", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Error al actualizar la fijación de la conversación.");
    },
  });
};

export const useArchiveConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => archiveConversationAction(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      queryClient.invalidateQueries({ queryKey: ["chat-conversation-detail", id] });
      toast.success("Estado de archivo actualizado.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Error al archivar la conversación.");
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteConversationAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      toast.success("Conversación eliminada.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Error al eliminar la conversación.");
    },
  });
};

export const useSendChatFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ChatFeedbackDto) => sendChatFeedbackAction(dto),
    onSuccess: () => {
      toast.success("Gracias por tus comentarios.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Error al guardar el comentario.");
    },
  });
};

// ── 3. Custom Hook para Administrar Streaming SSE y AbortController ────

export interface UseChatStreamReturn {
  isStreaming: boolean;
  streamingText: string;
  sendMessageStream: (conversationId: number | null, message: string) => Promise<void>;
  cancelStream: () => void;
}

export const useChatStream = (): UseChatStreamReturn => {
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingText, setStreamingText] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  useEffect(() => {
    return () => {
      // Cancelar cualquier stream activo al desmontar el componente
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const sendMessageStream = useCallback(
    async (conversationId: number | null, message: string) => {
      // Regla 6: Si hay un stream activo, abortar la petición anterior antes de iniciar la nueva
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsStreaming(true);
      setStreamingText("");

      await streamChatMessageAction({
        conversationId,
        message,
        signal: controller.signal,
        onChunk: (chunk: string) => {
          setStreamingText((prev) => prev + chunk);
        },
        onDone: () => {
          setIsStreaming(false);
          setStreamingText("");
          abortControllerRef.current = null;

          // Regla 3: Invalidar queries de TanStack Query al terminar el stream
          queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
          if (conversationId && conversationId > 0) {
            queryClient.invalidateQueries({
              queryKey: ["chat-conversation-detail", conversationId],
            });
          }
        },
        onError: (err: Error) => {
          setIsStreaming(false);
          setStreamingText("");
          abortControllerRef.current = null;
          toast.error(err.message || "Error durante la generación de respuesta.");
        },
      });
    },
    [queryClient]
  );

  return {
    isStreaming,
    streamingText,
    sendMessageStream,
    cancelStream,
  };
};

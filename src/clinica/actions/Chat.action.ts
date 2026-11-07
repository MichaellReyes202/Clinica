import { clinicaApi } from "@/api/clinicaApi";
import type {
  ChatConversationDetailDto,
  ChatConversationDto,
  ChatFeedbackDto,
  StreamChatOptions,
} from "@/interfaces/Chat.response";
import type { Options, PaginatedResponseDto } from "@/interfaces/Paginated.response";

// REST endpoints usando clinicaApi (Axios)
export const getConversationsAction = async (options?: Options, includeArchived: boolean = false): Promise<PaginatedResponseDto<ChatConversationDto>> => {
  const { data } = await clinicaApi.get<PaginatedResponseDto<ChatConversationDto>>("/chat/conversations",
    {
      params: {
        limit: options?.limit,
        offset: options?.offset,
        query: options?.query,
        includeArchived,
      },
    }
  );
  return data;
};

export const getConversationDetailAction = async (
  id: number
): Promise<ChatConversationDetailDto> => {
  const { data } = await clinicaApi.get<ChatConversationDetailDto>(
    `/chat/conversations/${id}`
  );
  return data;
};

export const renameConversationAction = async (
  id: number,
  title: string
): Promise<void> => {
  await clinicaApi.put(`/chat/conversations/${id}/title`, { title });
};

export const togglePinConversationAction = async (id: number): Promise<void> => {
  await clinicaApi.patch(`/chat/conversations/${id}/pin`);
};

export const archiveConversationAction = async (id: number): Promise<void> => {
  await clinicaApi.patch(`/chat/conversations/${id}/archive`);
};

export const deleteConversationAction = async (id: number): Promise<void> => {
  await clinicaApi.delete(`/chat/conversations/${id}`);
};

export const sendChatFeedbackAction = async (
  dto: ChatFeedbackDto
): Promise<void> => {
  await clinicaApi.post("/chat/feedback", dto);
};

// Streaming SSE con fetch + ReadableStream + Buffer de texto parcial (NO EventSource)
export const streamChatMessageAction = async ({
  conversationId,
  message,
  onChunk,
  onDone,
  onDataChanged,
  onError,
  onAbort,
  onConversationId,
  signal,
}: StreamChatOptions): Promise<void> => {
  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const url = `${baseUrl}/chat/stream`;
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  try {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Timezone": userTimeZone,
        "X-Tunnel-Skip-AntiPhishing-Page": "true",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ conversationId, message }),
      signal,
    });

    if (!response.ok) {
      let errorMessage = `Error en la petición de chat (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData?.description) {
          errorMessage = errorData.description;
        }
      } catch {
        // Ignorar si no se pudo parsear el error JSON
      }
      throw new Error(errorMessage);
    }

    if (!response.body) {
      throw new Error("El cuerpo de la respuesta no admite streaming.");
    }

    reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let isDone = false;

    const dispatchEvent = (rawEvent: string) => {
      const data = rawEvent
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n");

      if (!data) return;
      if (data === "[DONE]") {
        isDone = true;
        return;
      }

      const event = JSON.parse(data) as {
        type?: string;
        content?: string;
        message?: string;
        conversationId?: number;
      };

      switch (event.type) {
        case "conversation":
          if (typeof event.conversationId === "number") {
            onConversationId?.(event.conversationId);
          }
          break;
        case "chunk":
          if (typeof event.content === "string") onChunk(event.content);
          break;
        case "data_changed":
          if (typeof event.message === "string") onDataChanged?.(event.message);
          break;
        case "error":
          throw new Error(event.message || "No se pudo completar la respuesta.");
        case "done":
          isDone = true;
          break;
        default:
          throw new Error("El servidor envió un evento de chat no reconocido.");
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        buffer += decoder.decode();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split(/\r?\n\r?\n/);
      buffer = parts.pop() || "";

      for (const part of parts) {
        dispatchEvent(part);
        if (isDone) break;
      }
      if (isDone) break;
    }

    if (buffer.trim()) dispatchEvent(buffer);
    if (!isDone) {
      throw new Error("La conexión se cerró antes de terminar la respuesta.");
    }

    onDone?.();
  } catch (error: unknown) {
    if (signal?.aborted) {
      onAbort?.();
      return;
    }
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
  } finally {
    reader?.releaseLock();
  }
};

import { clinicaApi } from "@/api/clinicaApi";
import type {
  ChatConversationDetailDto,
  ChatConversationDto,
  ChatFeedbackDto,
  StreamChatOptions,
} from "@/interfaces/Chat.response";
import type { Options, PaginatedResponseDto } from "@/interfaces/Paginated.response";

// REST endpoints usando clinicaApi (Axios)
export const getConversationsAction = async (
  options?: Options,
  includeArchived: boolean = false
): Promise<PaginatedResponseDto<ChatConversationDto>> => {
  const { data } = await clinicaApi.get<PaginatedResponseDto<ChatConversationDto>>(
    "/chat/conversations",
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
  onError,
  signal,
}: StreamChatOptions): Promise<void> => {
  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const url = `${baseUrl}/chat/stream`;

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

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    // CRÍTICO (Regla 5): Buffer de texto acumulado para eventos SSE cortados por la mitad por la red
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Eventos SSE delimitados por doble salto de línea (\n\n o \r\n\r\n)
      const parts = buffer.split(/\r?\n\r?\n/);

      // Conservar el último elemento como el buffer incompleto para la siguiente iteración
      buffer = parts.pop() || "";

      for (const part of parts) {
        const lines = part.split(/\r?\n/);
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataContent = line.slice(6);
            if (dataContent === "[DONE]") {
              onDone?.();
              return;
            }
            if (dataContent.startsWith('{"error":')) {
              try {
                const parsed = JSON.parse(dataContent);
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch (err) {
                if (err instanceof Error) throw err;
              }
            }
            // Reemplazar saltos de línea escapados (\\n) por saltos reales (\n)
            const unescapedChunk = dataContent.replace(/\\n/g, "\n");
            onChunk(unescapedChunk);
          }
        }
      }
    }

    // Procesar fragmento restante al terminar la lectura del stream
    if (buffer.trim()) {
      const lines = buffer.split(/\r?\n/);
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataContent = line.slice(6);
          if (dataContent === "[DONE]") {
            onDone?.();
            return;
          }
          if (dataContent.startsWith('{"error":')) {
            try {
              const parsed = JSON.parse(dataContent);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (err) {
              if (err instanceof Error) throw err;
            }
          }
          const unescapedChunk = dataContent.replace(/\\n/g, "\n");
          onChunk(unescapedChunk);
        }
      }
    }

    onDone?.();
  } catch (error: unknown) {
    if (signal?.aborted) {
      // Stream cancelado intencionalmente por AbortController
      return;
    }
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
  }
};

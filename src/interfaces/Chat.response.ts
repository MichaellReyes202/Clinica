export interface ChatMessageDto {
  id: number;
  senderType: string;
  content: string;
  tokensUsed?: number | null;
  executionTimeMs?: number | null;
  createdAt: string;
}

export interface ChatConversationDto {
  id: number;
  title: string;
  roleName?: string | null;
  modelName?: string | null;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatConversationDetailDto extends ChatConversationDto {
  messages: ChatMessageDto[];
}

export interface ChatSendMessageDto {
  conversationId?: number | null;
  message: string;
}

export interface ChatRenameDto {
  title: string;
}

export interface ChatFeedbackDto {
  messageId: number;
  isPositive: boolean;
  comment?: string | null;
}

export interface StreamChatOptions {
  conversationId?: number | null;
  message: string;
  onChunk: (chunk: string) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

import React, { useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Check,
  MessageSquarePlus,
  MoreVertical,
  Pencil,
  Pin,
  PinOff,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useArchiveConversation,
  useChatConversations,
  useDeleteConversation,
  useRenameConversation,
  useTogglePinConversation,
} from "@/clinica/hooks/useChat";
import type { ChatConversationDto } from "@/interfaces/Chat.response";

interface ChatSidebarProps {
  className?: string;
  activeConversationId: number | null;
  onSelectConversation: (id: number | null) => void;
  onNewConversation: () => void;
}

const formatConversationDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return new Intl.DateTimeFormat("es-NI", { hour: "2-digit", minute: "2-digit" }).format(date);
  }
  if (isYesterday) return "Ayer";
  return new Intl.DateTimeFormat("es-NI", { day: "numeric", month: "short" }).format(date);
};

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ className = "flex", activeConversationId, onSelectConversation, onNewConversation }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  // Estados para modales
  const [editingConv, setEditingConv] = useState<ChatConversationDto | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [deletingConvId, setDeletingConvId] = useState<number | null>(null);

  // Queries y Mutations
  const { data: conversationsData, isLoading } = useChatConversations({ limit: 50, offset: 0, query: searchTerm }, showArchived);

  const renameMutation = useRenameConversation();
  const pinMutation = useTogglePinConversation();
  const archiveMutation = useArchiveConversation();
  const deleteMutation = useDeleteConversation();

  const conversations = conversationsData?.items || [];

  const handleOpenRename = (conv: ChatConversationDto) => {
    setEditingConv(conv);
    setNewTitle(conv.title);
  };

  const handleSaveRename = async () => {
    if (!editingConv || !newTitle.trim()) return;
    await renameMutation.mutateAsync({ id: editingConv.id, title: newTitle.trim() });
    setEditingConv(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingConvId) return;
    await deleteMutation.mutateAsync(deletingConvId);
    if (activeConversationId === deletingConvId) {
      onSelectConversation(null);
    }
    setDeletingConvId(null);
  };

  return (
    <aside className={`w-full xl:w-72 border-r bg-sidebar border-border/60 ${className} flex-col h-full shrink-0 min-h-0 overflow-hidden`}>
      {/* Cabecera / Nueva Conversación */}
      <div className="p-4 border-b border-border/60 flex flex-col gap-3 shrink-0">
        <Button onClick={onNewConversation} className="w-full justify-start gap-2 bg-sidebar-primary font-medium text-sidebar-primary-foreground hover:bg-sidebar-primary/90" variant="default">
          <MessageSquarePlus className="w-4 h-4" /> Nueva conversación
        </Button>

        {/* Buscador */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-10 bg-background/70 text-sm"
          />
        </div>

        {/* Pestañas de Activas vs Archivadas */}
        <div className="flex items-center justify-between px-1 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {showArchived ? "Archivadas" : "Conversaciones"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {showArchived ? (
              <span className="flex items-center gap-1">
                <ArchiveRestore className="w-3 h-3" /> Ver activas
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Archive className="w-3 h-3" /> Ver archivadas
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Lista de Conversaciones */}
      <ScrollArea className="flex-1 min-h-0 px-2 py-2">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-muted/40 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            {showArchived
              ? "No hay conversaciones archivadas."
              : "No tienes conversaciones iniciadas."}
          </div>
        ) : (
          <div className="flex flex-col">
            {conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  className={`group relative flex min-h-[58px] items-center justify-between border-l-2 px-2 py-1 transition-colors ${isActive
                    ? "border-l-sidebar-primary bg-sidebar-primary/5 text-foreground"
                    : "border-l-transparent text-foreground/85 hover:bg-background/70"
                    }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectConversation(conv.id)}
                    aria-current={isActive ? "page" : undefined}
                    className="flex min-h-10 min-w-0 flex-1 items-center rounded-md pr-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex min-w-0 items-center gap-1.5 text-sm">
                        {conv.isPinned && (
                          <Pin className="h-3 w-3 shrink-0 rotate-45 text-sidebar-primary" />
                        )}
                        <span className="truncate">{conv.title}</span>
                      </span>
                      <span className="text-[11px] text-muted-foreground">{formatConversationDate(conv.updatedAt)}</span>
                    </span>
                  </button>

                  {/* Menú Contextual de la Conversación */}
                  <div className="shrink-0 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" aria-label={`Opciones para ${conv.title}`}>
                          <MoreVertical className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 text-xs">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenRename(conv);
                          }}
                          className="gap-2"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Renombrar
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            pinMutation.mutate(conv.id);
                          }}
                          className="gap-2"
                        >
                          {conv.isPinned ? (
                            <>
                              <PinOff className="w-3.5 h-3.5" /> Desanclar
                            </>
                          ) : (
                            <>
                              <Pin className="w-3.5 h-3.5" /> Anclar
                            </>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            archiveMutation.mutate(conv.id);
                          }}
                          className="gap-2"
                        >
                          {conv.isArchived ? (
                            <>
                              <ArchiveRestore className="w-3.5 h-3.5" /> Desarchivar
                            </>
                          ) : (
                            <>
                              <Archive className="w-3.5 h-3.5" /> Archivar
                            </>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setDeletingConvId(conv.id);
                        }}
                          className="gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Diálogo Renombrar */}
      <Dialog open={!!editingConv} onOpenChange={(open) => !open && setEditingConv(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-sm">Renombrar conversación</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Escribe el nuevo título..."
              className="text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setEditingConv(null)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSaveRename} disabled={!newTitle.trim()}>
              <Check className="w-3.5 h-3.5 mr-1" /> Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alerta Confirmar Eliminación */}
      <AlertDialog open={!!deletingConvId} onOpenChange={(open) => !open && setDeletingConvId(null)} >
        <AlertDialogContent className="sm:max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">¿Eliminar conversación?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Esta acción no se puede deshacer. Se eliminarán permanentemente el historial de
              mensajes y las ejecuciones de auditoría asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="text-xs">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
};

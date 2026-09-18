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
import { Badge } from "@/components/ui/badge";
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
  activeConversationId: number | null;
  onSelectConversation: (id: number | null) => void;
  onNewConversation: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ activeConversationId, onSelectConversation, onNewConversation }) => {
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
    <aside className="w-full md:w-80 border-r bg-sidebar border-border/60 flex flex-col h-full shrink-0 min-h-0 overflow-hidden select-none">
      {/* Cabecera / Nueva Conversación */}
      <div className="p-4 border-b border-border/60 flex flex-col gap-3 shrink-0">
        <Button onClick={onNewConversation} className="w-full justify-start gap-2 font-medium shadow-sm" variant="default">
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
            className="pl-8 text-xs h-9 bg-background/50"
          />
        </div>

        {/* Pestañas de Activas vs Archivadas */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span className="font-semibold text-foreground/80">
            {showArchived ? "Archivadas" : "Conversaciones"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
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
          <div className="text-center py-8 px-4 text-xs text-muted-foreground">
            {showArchived
              ? "No hay conversaciones archivadas."
              : "No tienes conversaciones iniciadas."}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors text-xs ${isActive
                    ? "bg-primary/10 text-primary font-medium border border-primary/20"
                    : "hover:bg-muted/60 text-foreground/90"
                    }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-6">
                    {conv.isPinned && (
                      <Pin className="w-3.5 h-3.5 text-primary shrink-0 rotate-45" />
                    )}
                    <span className="truncate">{conv.title}</span>
                  </div>

                  {/* Menú Contextual de la Conversación */}
                  <div className="absolute right-1 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
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
              className="text-xs"
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

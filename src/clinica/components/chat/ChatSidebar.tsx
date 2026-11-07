import React, { useRef, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Check,
  MessageSquarePlus,
  Pencil,
  Pin,
  PinOff,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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

const getConversationGroup = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Otras";

  const now = new Date();
  if (date.toDateString() === now.toDateString()) return "Hoy";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Ayer";

  const month = new Intl.DateTimeFormat("es-NI", { month: "long" }).format(date);
  const title = month.charAt(0).toLocaleUpperCase("es-NI") + month.slice(1);
  return date.getFullYear() === now.getFullYear() ? title : `${title} ${date.getFullYear()}`;
};

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ className = "flex", activeConversationId, onSelectConversation, onNewConversation }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [revealedConversationActionsId, setRevealedConversationActionsId] = useState<number | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

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
  const newestFirst = (left: ChatConversationDto, right: ChatConversationDto) =>
    new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  const pinnedConversations = conversations.filter((conversation) => conversation.isPinned).sort(newestFirst);
  const recentConversations = conversations.filter((conversation) => !conversation.isPinned).sort(newestFirst);
  const recentGroups = recentConversations.reduce<Array<{ label: string; items: ChatConversationDto[] }>>((groups, conversation) => {
    const label = getConversationGroup(conversation.updatedAt);
    const group = groups.find((item) => item.label === label);
    if (group) group.items.push(conversation);
    else groups.push({ label, items: [conversation] });
    return groups;
  }, []);
  const conversationGroups = [
    ...(pinnedConversations.length ? [{ label: "Fijadas", items: pinnedConversations }] : []),
    ...recentGroups,
  ];

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
    <aside className={`w-full shrink-0 flex-col overflow-hidden border-r border-border bg-card text-card-foreground ${className} h-full min-h-0 xl:w-[286px]`}>
      {/* Cabecera / Nueva Conversación */}
      <div className="flex shrink-0 flex-col gap-2.5 border-b border-border p-4">
        <Button onClick={onNewConversation} className="h-9 w-full justify-start gap-2 rounded-lg border border-blue-200 bg-blue-50/80 text-sm font-medium text-blue-600 hover:bg-blue-100/80 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20" variant="default">
          <MessageSquarePlus className="w-4 h-4" /> Nueva conversación
        </Button>

        {/* Buscador */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 z-10 h-4 w-4 pointer-events-none text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 rounded-lg border-input bg-background py-1 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-sidebar-primary/30"
          />
        </div>

        {/* Control segmentado de conversaciones */}
        <div className="flex h-10 rounded-lg bg-muted/70 p-1 dark:bg-slate-900" role="tablist" aria-label="Tipo de conversaciones">
          <Button
            type="button"
            role="tab"
            aria-selected={!showArchived}
            variant="ghost"
            size="sm"
            onClick={() => setShowArchived(false)}
            className={`h-8 flex-1 text-sm ${!showArchived ? "bg-background text-foreground shadow-sm hover:bg-background dark:bg-slate-700 dark:text-white dark:hover:bg-slate-700" : "bg-transparent text-muted-foreground hover:text-foreground dark:bg-transparent dark:text-slate-400 dark:hover:text-slate-200"}`}
          >
            Activas
          </Button>
          <Button
            type="button"
            role="tab"
            aria-selected={showArchived}
            variant="ghost"
            size="sm"
            onClick={() => setShowArchived(true)}
            className={`h-8 flex-1 text-sm ${showArchived ? "bg-background text-foreground shadow-sm hover:bg-background dark:bg-slate-700 dark:text-white dark:hover:bg-slate-700" : "bg-transparent text-muted-foreground hover:text-foreground dark:bg-transparent dark:text-slate-400 dark:hover:text-slate-200"}`}
          >
            Archivadas
          </Button>
        </div>
      </div>

      {/* Lista de Conversaciones */}
      <ScrollArea
        className="flex-1 min-h-0 overflow-x-hidden px-2 py-2"
        onPointerDownCapture={(event) => {
          const target = event.target;
          if (target instanceof Element && !target.closest("[data-chat-conversation-row]")) {
            setRevealedConversationActionsId(null);
          }
        }}
      >
        {isLoading ? (
          <div className="flex flex-col gap-2 p-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-4 py-10 text-center text-[13px] leading-6 text-muted-foreground">
            {showArchived
              ? "No hay conversaciones archivadas."
              : "No tienes conversaciones iniciadas."}
          </div>
        ) : (
          <div className="flex w-full flex-col gap-3 overflow-x-hidden">
            {conversationGroups.map(({ label, items }) => (
              <section key={label} aria-label={label} className="w-full overflow-x-hidden">
                <h3 className="mt-4 mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</h3>
                <div className="flex w-full flex-col overflow-x-hidden">
            {items.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <ContextMenu key={conv.id}>
                  <ContextMenuTrigger asChild>
                    <div
                      data-chat-conversation-row
                      onContextMenu={() => setRevealedConversationActionsId(conv.id)}
                      onPointerDown={(event) => {
                        if (event.pointerType !== "touch") return;
                        clearLongPressTimer();
                        longPressTriggeredRef.current = false;
                        longPressTimerRef.current = window.setTimeout(() => {
                          longPressTriggeredRef.current = true;
                          setRevealedConversationActionsId(conv.id);
                        }, 550);
                      }}
                      onPointerUp={clearLongPressTimer}
                      onPointerCancel={clearLongPressTimer}
                      onPointerLeave={clearLongPressTimer}
                      onClickCapture={(event) => {
                        if (!longPressTriggeredRef.current) return;
                        event.preventDefault();
                        event.stopPropagation();
                        longPressTriggeredRef.current = false;
                      }}
                      title={conv.title}
                      className={`group relative block w-full min-w-0 cursor-pointer overflow-hidden rounded-lg px-3 py-2.5 transition-all before:absolute before:bottom-2 before:left-0 before:top-2 before:w-1 before:rounded-r ${isActive
                        ? "bg-blue-50/80 font-medium text-blue-700 before:bg-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/60"
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setRevealedConversationActionsId(null);
                          onSelectConversation(conv.id);
                        }}
                        aria-current={isActive ? "page" : undefined}
                        className="flex w-full min-w-0 items-center overflow-hidden rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="flex w-full min-w-0 flex-col gap-0.5 overflow-hidden">
                          <span className="flex w-full min-w-0 items-center gap-1.5 overflow-hidden">
                            {conv.isPinned && (
                              <Pin className="inline-block h-3.5 w-3.5 shrink-0 text-blue-500 mr-1.5" />
                            )}
                            <span
                              className={`block w-0 min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap pr-2 text-sm ${isActive ? "font-medium text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-200"}`}
                              style={{ textOverflow: "ellipsis" }}
                            >
                              {conv.title}
                            </span>
                          </span>
                          <span className="text-[10px] text-muted-foreground">{formatConversationDate(conv.updatedAt)}</span>
                        </span>
                      </button>

                  {/* Acciones rápidas */}
                  <div
                    aria-hidden={revealedConversationActionsId !== conv.id}
                    className={`pointer-events-none absolute right-2 top-1/2 z-10 flex -translate-y-1/2 items-center gap-1 rounded bg-slate-100 pl-1 opacity-0 shadow-sm ring-1 ring-border/70 transition-opacity dark:bg-slate-800 ${revealedConversationActionsId === conv.id ? "pointer-events-auto opacity-100" : ""}`}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation();
                        setRevealedConversationActionsId(null);
                        pinMutation.mutate(conv.id);
                      }}
                      tabIndex={revealedConversationActionsId === conv.id ? 0 : -1}
                      className="h-7 w-7 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label={conv.isPinned ? "Desfijar conversación" : "Fijar conversación"}
                      title={conv.isPinned ? "Desfijar" : "Fijar"}
                    >
                      {conv.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation();
                        setRevealedConversationActionsId(null);
                        archiveMutation.mutate(conv.id);
                      }}
                      tabIndex={revealedConversationActionsId === conv.id ? 0 : -1}
                      className="h-7 w-7 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label={showArchived ? "Desarchivar conversación" : "Archivar conversación"}
                      title={showArchived ? "Desarchivar" : "Archivar"}
                    >
                      {showArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation();
                        setRevealedConversationActionsId(null);
                        setDeletingConvId(conv.id);
                      }}
                      tabIndex={revealedConversationActionsId === conv.id ? 0 : -1}
                      className="h-7 w-7 p-1 text-slate-400 hover:text-destructive dark:hover:text-red-400"
                      aria-label="Eliminar conversación"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-48 border-border bg-popover text-sm text-popover-foreground">
                    <ContextMenuItem onSelect={() => {
                      setRevealedConversationActionsId(null);
                      pinMutation.mutate(conv.id);
                    }}>
                      {conv.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                      {conv.isPinned ? "Desfijar conversación" : "Fijar conversación"}
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={() => {
                      setRevealedConversationActionsId(null);
                      handleOpenRename(conv);
                    }}>
                      <Pencil className="h-4 w-4" />
                      Renombrar conversación
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={() => {
                      setRevealedConversationActionsId(null);
                      archiveMutation.mutate(conv.id);
                    }}>
                      {showArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                      {showArchived ? "Desarchivar conversación" : "Archivar conversación"}
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      variant="destructive"
                      onSelect={() => {
                        setRevealedConversationActionsId(null);
                        setDeletingConvId(conv.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar conversación
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              );
            })}
                </div>
              </section>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Diálogo Renombrar */}
      <Dialog open={!!editingConv} onOpenChange={(open) => !open && setEditingConv(null)}>
        <DialogContent className="border-border bg-popover text-popover-foreground sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-sm">Renombrar conversación</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Escribe el nuevo título..."
              className="border-input bg-background text-sm text-foreground placeholder:text-muted-foreground"
              onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setEditingConv(null)} className="border-border bg-transparent text-foreground hover:bg-muted">
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSaveRename} disabled={!newTitle.trim()} className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
              <Check className="w-3.5 h-3.5 mr-1" /> Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alerta Confirmar Eliminación */}
      <AlertDialog open={!!deletingConvId} onOpenChange={(open) => !open && setDeletingConvId(null)} >
        <AlertDialogContent className="max-w-md rounded-lg border-border bg-background p-6 text-foreground shadow-lg">
          <AlertDialogCancel
            aria-label="Cerrar confirmación"
            className="absolute right-4 top-4 h-8 w-8 border-0 bg-transparent p-0 text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </AlertDialogCancel>
          <AlertDialogHeader className="pr-8 text-left">
            <AlertDialogTitle className="text-lg font-semibold leading-tight">¿Eliminar conversación?</AlertDialogTitle>
            <AlertDialogDescription className="mt-1 text-sm leading-6 text-muted-foreground">
              Esta acción no se puede deshacer. Se eliminarán permanentemente el historial de mensajes y las ejecuciones de auditoría asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel className="min-w-24 border-border bg-background text-sm text-foreground hover:bg-muted">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="min-w-24 bg-destructive text-sm text-white hover:bg-destructive/90 focus-visible:ring-destructive/30">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
};

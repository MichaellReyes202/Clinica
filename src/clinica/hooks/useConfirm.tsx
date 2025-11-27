import type { ReactNode } from 'react';
import { create } from 'zustand';


interface ConfirmState {
   isOpen: boolean;
   title: string;
   description: string | ReactNode;
   confirmText: string;
   cancelText: string;
   variant: 'default' | 'destructive' | 'warning';
   onConfirm: (() => void) | null;
   onCancel: (() => void) | null;
}

interface ConfirmStore extends ConfirmState {
   confirm: (options: ConfirmOptions) => Promise<boolean>;
   close: () => void;
   handleConfirm: () => void;
   handleCancel: () => void;
}

interface ConfirmOptions {
   title: string;
   description: string | ReactNode;
   confirmText?: string;
   cancelText?: string;
   variant?: 'default' | 'destructive' | 'warning';
}

const useConfirmStore = create<ConfirmStore>((set, get) => ({
   isOpen: false,
   title: '',
   description: '',
   confirmText: 'Confirmar',
   cancelText: 'Cancelar',
   variant: 'default',
   onConfirm: null,
   onCancel: null,

   confirm: (options: ConfirmOptions) => {
      return new Promise<boolean>((resolve) => {
         set({
            isOpen: true,
            title: options.title,
            description: options.description,
            confirmText: options.confirmText || 'Confirmar',
            cancelText: options.cancelText || 'Cancelar',
            variant: options.variant || 'default',
            onConfirm: () => {
               resolve(true);
               get().close();
            },
            onCancel: () => {
               resolve(false);
               get().close();
            },
         });
      });
   },

   close: () => {
      set({
         isOpen: false,
         title: '',
         description: '',
         confirmText: 'Confirmar',
         cancelText: 'Cancelar',
         variant: 'default',
         onConfirm: null,
         onCancel: null,
      });
   },

   handleConfirm: () => {
      const { onConfirm } = get();
      if (onConfirm) onConfirm();
   },

   handleCancel: () => {
      const { onCancel } = get();
      if (onCancel) onCancel();
   },
}));

export const useConfirm = () => {
   const confirm = useConfirmStore((state) => state.confirm);
   return { confirm };
};

export const useConfirmDialog = () => {
   return useConfirmStore();
};

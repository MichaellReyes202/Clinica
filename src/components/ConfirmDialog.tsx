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
import { useConfirmDialog } from "@/clinica/hooks/useConfirm";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";

export const ConfirmDialog = () => {
   const {
      isOpen,
      title,
      description,
      confirmText,
      cancelText,
      variant,
      handleConfirm,
      handleCancel,
   } = useConfirmDialog();

   const getIcon = () => {
      switch (variant) {
         case 'destructive':
            return <AlertCircle className="h-6 w-6 text-destructive" />;
         case 'warning':
            return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
         default:
            return <Info className="h-6 w-6 text-blue-600" />;
      }
   };

   const getConfirmButtonClass = () => {
      switch (variant) {
         case 'destructive':
            return "bg-destructive hover:bg-destructive/90";
         case 'warning':
            return "bg-yellow-600 hover:bg-yellow-700 text-white";
         default:
            return "";
      }
   };

   return (
      <AlertDialog open={isOpen} onOpenChange={handleCancel}>
         <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
               <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                     {getIcon()}
                  </div>
                  <div className="flex-1">
                     <AlertDialogTitle className="text-lg font-semibold">
                        {title}
                     </AlertDialogTitle>
                     <AlertDialogDescription className="mt-2 text-sm text-muted-foreground">
                        {description}
                     </AlertDialogDescription>
                  </div>
               </div>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
               <AlertDialogCancel onClick={handleCancel}>
                  {cancelText}
               </AlertDialogCancel>
               <AlertDialogAction
                  onClick={handleConfirm}
                  className={getConfirmButtonClass()}
               >
                  {confirmText}
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
};

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Loader2, ShieldAlert, Mail } from "lucide-react";
import { toast } from "sonner";
import { adminResetPasswordByEmailAction } from "@/auth/actions/login.action";

interface AdminResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: number;
  targetUserName: string;
}

export const AdminResetPasswordModal = ({
  isOpen,
  onClose,
  targetUserId,
  targetUserName,
}: AdminResetPasswordModalProps) => {
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setAdminPassword("");
    onClose();
  };

  const handleConfirm = async () => {
    if (!adminPassword.trim()) {
      toast.error("Debes ingresar tu contraseña para confirmar la acción");
      return;
    }

    try {
      setIsLoading(true);
      await adminResetPasswordByEmailAction(targetUserId, adminPassword);
      toast.success(
        `Se envió un correo de recuperación al empleado "${targetUserName}". El usuario recibirá instrucciones para crear su nueva contraseña.`
      );
      handleClose();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.errorMessage ||
        "Error al restablecer la contraseña";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isLoading) handleClose(); }}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
            </div>
            <DialogTitle>Restablecer contraseña</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Se enviará un <strong>correo de recuperación</strong> al correo personal del empleado{" "}
            <span className="font-semibold text-foreground">"{targetUserName}"</span>. El usuario
            deberá seguir las instrucciones para crear su nueva contraseña.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-2">
          <Mail className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700">
            El empleado recibirá un código de 6 dígitos válido por 5 minutos en su correo personal registrado.
          </p>
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="admin-password-confirm" className="flex items-center gap-1">
            <KeyRound className="h-3.5 w-3.5" />
            Tu contraseña (para confirmar la acción)
          </Label>
          <Input
            id="admin-password-confirm"
            type="password"
            placeholder="Ingresa tu contraseña de administrador"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); }}
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
            onClick={handleConfirm}
            disabled={isLoading || !adminPassword.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4 mr-2" />
                Confirmar restablecimiento
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

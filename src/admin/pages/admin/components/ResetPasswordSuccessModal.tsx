import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Eye, EyeOff } from "lucide-react";
import type { UserCreation } from "@/interfaces/Users.response";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    data: UserCreation | null;
}

export function ResetPasswordSuccessModal({ isOpen, onClose, data }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [startCountdown, setStartCountdown] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStartCountdown(false);
            setCountdown(5);
        }
    }, [isOpen]);

    useEffect(() => {
        if (startCountdown && countdown > 0) {
            const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
            return () => clearTimeout(timer);
        }
        if (startCountdown && countdown === 0) {
            onClose();
        }
    }, [startCountdown, countdown, onClose]);

    if (!data) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        <Check className="inline-block mr-2 h-5 w-5 text-green-500" />
                        Contraseña Reestablecida
                    </DialogTitle>
                    <DialogDescription>
                        La contraseña ha sido reestablecida exitosamente. Estos son los nuevos datos de acceso:
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div>
                        <Label>Email</Label>
                        <Input type="text" value={data.email} readOnly />
                    </div>
                    <div>
                        <Label>Contraseña</Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                value={data.password}
                                readOnly
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {startCountdown ? (
                        <div className="text-sm text-center text-muted-foreground mt-3">
                            Cerrando en <span className="font-semibold">{countdown}</span> segundos...
                        </div>
                    ) : (
                        <Button
                            className="w-full mt-3"
                            variant="secondary"
                            onClick={() => setStartCountdown(true)}
                        >
                            Cerrar
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

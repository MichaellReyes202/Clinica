import { useAuthStore } from "@/auth/store/auth.store";
import { useEffect, useState } from "react";


export const BlockedTimer = () => {
  const getTimeLeft = useAuthStore((state) => state.getTimeLeft);
  const clearBlocked = useAuthStore((state) => state.clearBlocked);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeLeft();
      if (remaining <= 0) {
        clearBlocked();
        clearInterval(interval);
      } else {
        setTick(t => t + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [getTimeLeft, clearBlocked]);

  const minutes = Math.floor(getTimeLeft() / 60);
  const seconds = getTimeLeft() % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <p className="text-red-500 text-center mt-4 font-medium">
      Cuenta bloqueada. Intenta en {timeFormatted} minutos.
    </p>
  );
};
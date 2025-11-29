import { useMutation } from "@tanstack/react-query";
import { resetPasswordAction } from "@/auth/actions/login.action";

export const useResetPasswordMutation = () => {
    const mutation = useMutation({
        mutationFn: resetPasswordAction,
    });

    return mutation;
};

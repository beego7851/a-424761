import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PasswordFormValues } from "./types";

interface PasswordChangeData {
  success: boolean;
  message?: string;
  error?: string;
  code?: string;
  details?: {
    timestamp: string;
    [key: string]: any;
  };
}

const MAX_RETRIES = 3;

export const usePasswordChange = (memberNumber: string, onSuccess?: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handlePasswordChange = async (values: PasswordFormValues, resetToken?: string, retryCount = 0): Promise<PasswordChangeData | null> => {
    if (retryCount >= MAX_RETRIES) {
      console.error("[PasswordChange] Maximum retry attempts reached");
      toast.error("Maximum retry attempts reached. Please try again later.");
      return null;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Changing password...");

    try {
      console.log("[PasswordChange] Starting password change for member:", memberNumber, {
        hasResetToken: !!resetToken,
        timestamp: new Date().toISOString(),
        retryCount
      });

      const { data: rpcData, error } = resetToken 
        ? await supabase.rpc('handle_password_reset_with_token', {
            token_value: resetToken,
            new_password: values.newPassword,
            ip_address: null,
            user_agent: navigator.userAgent,
            client_info: {
              timestamp: new Date().toISOString(),
              browser: navigator.userAgent,
              platform: navigator.platform
            }
          })
        : await supabase.rpc('handle_password_reset', {
            member_number: memberNumber,
            new_password: values.newPassword,
            current_password: values.currentPassword,
            ip_address: null,
            user_agent: navigator.userAgent,
            client_info: {
              timestamp: new Date().toISOString(),
              browser: navigator.userAgent,
              platform: navigator.platform
            }
          });

      console.log("[PasswordChange] RPC Response:", {
        hasData: !!rpcData,
        hasError: !!error,
        errorMessage: error?.message
      });

      if (error) {
        console.error("[PasswordChange] Error:", error);
        toast.dismiss(toastId);
        
        if (error.code === 'PGRST301' && retryCount < MAX_RETRIES) {
          return handlePasswordChange(values, resetToken, retryCount + 1);
        }
        
        return {
          success: false,
          error: error.message,
          code: error.code
        };
      }

      if (!rpcData || !rpcData.success) {
        toast.dismiss(toastId);
        return {
          success: false,
          error: rpcData?.message || "Failed to change password",
          code: rpcData?.code
        };
      }

      toast.dismiss(toastId);
      toast.success("Password changed successfully");
      
      if (onSuccess) {
        onSuccess();
      }

      if (resetToken) {
        navigate('/login');
      }

      return rpcData as PasswordChangeData;

    } catch (error: any) {
      console.error("[PasswordChange] Unexpected error:", error);
      toast.dismiss(toastId);
      toast.error("An unexpected error occurred");
      return {
        success: false,
        error: error.message,
        code: 'UNEXPECTED_ERROR'
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handlePasswordChange
  };
};
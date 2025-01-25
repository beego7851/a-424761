import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PasswordFormValues } from "@/components/auth/password/types";

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

  const handlePasswordChange = async (values: PasswordFormValues, resetToken?: string): Promise<PasswordChangeData | null> => {
    console.log("[PasswordChange] Starting password change for member:", memberNumber, {
      hasResetToken: !!resetToken,
      timestamp: new Date().toISOString()
    });

    try {
      const { data, error } = resetToken 
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

      console.log("[PasswordChange] Response received:", {
        hasData: !!data,
        hasError: !!error,
        errorMessage: error?.message,
        timestamp: new Date().toISOString()
      });

      if (error) {
        console.error("[PasswordChange] Error:", error);
        toast.error(error.message || "Failed to change password");
        return {
          success: false,
          error: error.message,
          code: error.code
        };
      }

      if (!data?.success) {
        console.error("[PasswordChange] Unsuccessful response:", data);
        toast.error(data?.message || "Failed to change password");
        return {
          success: false,
          error: data?.message || "Unknown error occurred",
          code: data?.code
        };
      }

      console.log("[PasswordChange] Success:", {
        success: data.success,
        message: data.message,
        timestamp: new Date().toISOString()
      });
      
      toast.success("Password changed successfully");
      
      if (onSuccess) {
        onSuccess();
      }

      if (resetToken) {
        console.log("[PasswordChange] Redirecting to login after token-based reset");
        navigate('/login');
      }

      return data;

    } catch (error: any) {
      console.error("[PasswordChange] Unexpected error:", error);
      toast.error("An unexpected error occurred");
      return {
        success: false,
        error: error.message,
        code: 'UNEXPECTED_ERROR'
      };
    }
  };

  return {
    isSubmitting,
    handlePasswordChange
  };
};
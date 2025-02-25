import { Json } from './json';

export type DatabaseFunctions = {
  assign_collector_role: {
    Args: {
      member_id: string;
      collector_name: string;
      collector_prefix: string;
      collector_number: string;
    };
    Returns: string;
  };
  audit_security_settings: {
    Args: Record<PropertyKey, never>;
    Returns: {
      check_type: string;
      status: string;
      details: Json;
    }[];
  };
  check_member_numbers: {
    Args: Record<PropertyKey, never>;
    Returns: {
      issue_type: string;
      description: string;
      affected_table: string;
      member_number: string;
      details: Json;
    }[];
  };
  generate_full_backup: {
    Args: Record<PropertyKey, never>;
    Returns: Json;
  };
  get_rls_policies: {
    Args: Record<PropertyKey, never>;
    Returns: {
      table_name: string;
      name: string;
      command: string;
    }[];
  };
  get_tables_info: {
    Args: Record<PropertyKey, never>;
    Returns: {
      name: string;
      columns: Json;
      rls_enabled: boolean;
    }[];
  };
  is_admin: {
    Args: { user_uid: string };
    Returns: boolean;
  };
  is_admin_user: {
    Args: { user_uid: string };
    Returns: boolean;
  };
  is_payment_overdue: {
    Args: { due_date: string };
    Returns: boolean;
  };
  perform_user_roles_sync: {
    Args: Record<PropertyKey, never>;
    Returns: undefined;
  };
  restore_from_backup: {
    Args: { backup_data: Json };
    Returns: string;
  };
  update_collector_profiles: {
    Args: Record<PropertyKey, never>;
    Returns: undefined;
  };
  handle_failed_login: {
    Args: { member_number: string };
    Returns: {
      locked: boolean;
      attempts: number;
      max_attempts: number;
      lockout_duration: string;
    };
  };
  validate_reset_token: {
    Args: { token_value: string };
    Returns: boolean;
  };
  validate_user_roles: {
    Args: Record<PropertyKey, never>;
    Returns: {
      check_type: string;
      status: string;
      details: Json;
    }[];
  };
  handle_password_reset: {
    Args: {
      member_number: string;
      new_password: string;
      current_password?: string;
      admin_user_id?: string;
      ip_address?: string | null;
      user_agent?: string | null;
      client_info?: Json | null;
    };
    Returns: Json;
  };
  handle_password_reset_with_token: {
    Args: {
      token_value: string;
      new_password: string;
      ip_address?: string | null;
      user_agent?: string | null;
      client_info?: Json | null;
    };
    Returns: Json;
  };
  generate_magic_link_token: {
    Args: {
      p_member_number: string;
      p_token_type?: 'password_reset' | 'email_verification';
    };
    Returns: string;
  };
};

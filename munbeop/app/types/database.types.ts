export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      contexts: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          scene: Json
        }
        Insert: {
          category: string
          created_at?: string
          id: string
          name: string
          scene: Json
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          scene?: Json
        }
        Relationships: []
      }
      grammars: {
        Row: {
          created_at: string
          deck_id: string
          example: string | null
          id: number
          ko: string
          meaning: Json
          trans: Json | null
        }
        Insert: {
          created_at?: string
          deck_id?: string
          example?: string | null
          id?: number
          ko: string
          meaning: Json
          trans?: Json | null
        }
        Update: {
          created_at?: string
          deck_id?: string
          example?: string | null
          id?: number
          ko?: string
          meaning?: Json
          trans?: Json | null
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          count: number
          day: string
          updated_at: string
          user_id: string
        }
        Insert: {
          count?: number
          day: string
          updated_at?: string
          user_id: string
        }
        Update: {
          count?: number
          day?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activity_events: {
        Row: {
          created_at: string
          event_id: string
          local_day: string
          occurred_at: string
          source: string
          time_zone: string
          user_id: string
          utc_offset_minutes: number
        }
        Insert: {
          created_at?: string
          event_id: string
          local_day: string
          occurred_at: string
          source: string
          time_zone: string
          user_id: string
          utc_offset_minutes: number
        }
        Update: {
          created_at?: string
          event_id?: string
          local_day?: string
          occurred_at?: string
          source?: string
          time_zone?: string
          user_id?: string
          utc_offset_minutes?: number
        }
        Relationships: []
      }
      user_custom_contexts: {
        Row: {
          created_at: string
          id: string
          name: string
          scene: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          scene: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          scene?: Json
          user_id?: string
        }
        Relationships: []
      }
      user_custom_decks: {
        Row: {
          color_id: string
          created_at: string
          grammar_kos: Json
          icon: string
          id: string
          image_url: string | null
          name: string
          position: number
          user_id: string
        }
        Insert: {
          color_id?: string
          created_at?: string
          grammar_kos?: Json
          icon?: string
          id: string
          image_url?: string | null
          name: string
          position?: number
          user_id: string
        }
        Update: {
          color_id?: string
          created_at?: string
          grammar_kos?: Json
          icon?: string
          id?: string
          image_url?: string | null
          name?: string
          position?: number
          user_id?: string
        }
        Relationships: []
      }
      user_custom_grammars: {
        Row: {
          created_at: string
          deck_id: string
          example: string | null
          id: number
          ko: string
          meaning: Json
          trans: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          deck_id?: string
          example?: string | null
          id?: number
          ko: string
          meaning: Json
          trans?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          deck_id?: string
          example?: string | null
          id?: number
          ko?: string
          meaning?: Json
          trans?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_decks: {
        Row: {
          collapsed: boolean
          color_id: string
          created_at: string
          id: string
          name: string
          position: number
          user_id: string
        }
        Insert: {
          collapsed?: boolean
          color_id?: string
          created_at?: string
          id: string
          name: string
          position?: number
          user_id: string
        }
        Update: {
          collapsed?: boolean
          color_id?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
          user_id?: string
        }
        Relationships: []
      }
      user_escape_room: {
        Row: {
          progress: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          progress?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          progress?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_inactive_contexts: {
        Row: {
          context_id: string
          user_id: string
        }
        Insert: {
          context_id: string
          user_id: string
        }
        Update: {
          context_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_log: {
        Row: {
          activity_event_id: string | null
          context_id: string
          context_name: string
          created_at: string
          error_dimension: string | null
          error_note: string | null
          feedback: string
          id: number
          ko: string
          local_day: string | null
          review_state: string
          revision: number
          sentence: string
          time_zone: string | null
          user_id: string
          utc_offset_minutes: number | null
        }
        Insert: {
          activity_event_id?: string | null
          context_id: string
          context_name: string
          created_at?: string
          error_dimension?: string | null
          error_note?: string | null
          feedback: string
          id?: number
          ko: string
          local_day?: string | null
          review_state?: string
          revision?: number
          sentence: string
          time_zone?: string | null
          user_id: string
          utc_offset_minutes?: number | null
        }
        Update: {
          activity_event_id?: string | null
          context_id?: string
          context_name?: string
          created_at?: string
          error_dimension?: string | null
          error_note?: string | null
          feedback?: string
          id?: number
          ko?: string
          local_day?: string | null
          review_state?: string
          revision?: number
          sentence?: string
          time_zone?: string | null
          user_id?: string
          utc_offset_minutes?: number | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          easy_count: number
          hard_count: number
          ko: string
          last_seen: string | null
          mastery: string
          revision: number
          updated_at: string
          user_id: string
        }
        Insert: {
          easy_count?: number
          hard_count?: number
          ko: string
          last_seen?: string | null
          mastery?: string
          revision?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          easy_count?: number
          hard_count?: number
          ko?: string
          last_seen?: string | null
          mastery?: string
          revision?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          prefs: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          prefs?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          prefs?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_log_entry_v2: {
        Args: {
          p_expected_ko: string
          p_expected_revision: number
          p_expected_user_id: string
          p_id: number
        }
        Returns: Json
      }
      increment_user_activity: {
        Args: {
          p_day: string
          p_delta: number
        }
        Returns: number
      }
      record_user_activity_events_v2: {
        Args: {
          p_events: Json
          p_expected_user_id: string
        }
        Returns: Json
      }
      mark_user_progress_seen_v2: {
        Args: {
          p_expected_user_id: string
          p_ko: string
          p_seen_at: string
        }
        Returns: Json
      }
      recalculate_user_progress_v2: {
        Args: {
          p_expected_user_id: string
          p_ko: string
        }
        Returns: Json
      }
      restore_user_backup: {
        Args: {
          p_data: Json
        }
        Returns: boolean
      }
      restore_user_backup_v2: {
        Args: {
          p_data: Json
          p_expected_user_id: string
        }
        Returns: boolean
      }
      save_user_log_entry_v2: {
        Args: {
          p_entry: Json
          p_expected_user_id: string
        }
        Returns: Json
      }
      set_user_log_review_v2: {
        Args: {
          p_error_note: string | null
          p_expected_revision: number
          p_expected_user_id: string
          p_id: number
          p_review_state: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

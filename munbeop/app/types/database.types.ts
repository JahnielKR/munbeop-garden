export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
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
          context_id: string
          context_name: string
          created_at: string
          error_dimension: string | null
          error_note: string | null
          feedback: string
          id: number
          ko: string
          review_state: string
          sentence: string
          user_id: string
        }
        Insert: {
          context_id: string
          context_name: string
          created_at?: string
          error_dimension?: string | null
          error_note?: string | null
          feedback: string
          id?: number
          ko: string
          review_state?: string
          sentence: string
          user_id: string
        }
        Update: {
          context_id?: string
          context_name?: string
          created_at?: string
          error_dimension?: string | null
          error_note?: string | null
          feedback?: string
          id?: number
          ko?: string
          review_state?: string
          sentence?: string
          user_id?: string
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
          updated_at: string
          user_id: string
        }
        Insert: {
          easy_count?: number
          hard_count?: number
          ko: string
          last_seen?: string | null
          mastery?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          easy_count?: number
          hard_count?: number
          ko?: string
          last_seen?: string | null
          mastery?: string
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

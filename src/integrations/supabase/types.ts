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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      hidden_votes: {
        Row: {
          hidden_at: string
          id: string
          user_id: string
          vote_id: number
        }
        Insert: {
          hidden_at?: string
          id?: string
          user_id: string
          vote_id: number
        }
        Update: {
          hidden_at?: string
          id?: string
          user_id?: string
          vote_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "hidden_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hidden_votes_vote_id_fkey"
            columns: ["vote_id"]
            isOneToOne: false
            referencedRelation: "votes"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_policies: {
        Row: {
          content: string
          created_at: string
          effective_date: string
          id: string
          is_active: boolean
          title: string
          version: string
        }
        Insert: {
          content: string
          created_at?: string
          effective_date: string
          id?: string
          is_active?: boolean
          title: string
          version: string
        }
        Update: {
          content?: string
          created_at?: string
          effective_date?: string
          id?: string
          is_active?: boolean
          title?: string
          version?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reporter_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["report_status"]
          vote_id: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          vote_id: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          vote_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_vote_id_fkey"
            columns: ["vote_id"]
            isOneToOne: false
            referencedRelation: "votes"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          device_id: string | null
          id: string
          ip_address: unknown | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          id?: string
          ip_address?: unknown | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string | null
          id?: string
          ip_address?: unknown | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      votes: {
        Row: {
          allow_multiple_choice: boolean
          content: string | null
          created_at: string
          creator_id: string | null
          description: string | null
          expires_at: string | null
          id: number
          is_anonymous: boolean
          options: Json
          status: Database["public"]["Enums"]["vote_status"]
          title: string | null
          vote_count: number
        }
        Insert: {
          allow_multiple_choice?: boolean
          content?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          expires_at?: string | null
          id?: number
          is_anonymous?: boolean
          options?: Json
          status?: Database["public"]["Enums"]["vote_status"]
          title?: string | null
          vote_count?: number
        }
        Update: {
          allow_multiple_choice?: boolean
          content?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          expires_at?: string | null
          id?: number
          is_anonymous?: boolean
          options?: Json
          status?: Database["public"]["Enums"]["vote_status"]
          title?: string | null
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "votes_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      report_status: "pending" | "reviewed" | "resolved" | "dismissed"
      vote_status: "active" | "closed" | "draft"
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
    Enums: {
      report_status: ["pending", "reviewed", "resolved", "dismissed"],
      vote_status: ["active", "closed", "draft"],
    },
  },
} as const

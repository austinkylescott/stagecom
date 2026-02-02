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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      email_outbox: {
        Row: {
          created_at: string
          dedupe_key: string | null
          id: string
          last_error: string | null
          payload: Json | null
          sent_at: string | null
          status: Database["public"]["Enums"]["email_outbox_status"]
          template: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          dedupe_key?: string | null
          id?: string
          last_error?: string | null
          payload?: Json | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_outbox_status"]
          template: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          dedupe_key?: string | null
          id?: string
          last_error?: string | null
          payload?: Json | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_outbox_status"]
          template?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_outbox_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          dedupe_key: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["notification_entity"]
          id: string
          payload: Json | null
          read_at: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dedupe_key: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["notification_entity"]
          id?: string
          payload?: Json | null
          read_at?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          dedupe_key?: string
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["notification_entity"]
          id?: string
          payload?: Json | null
          read_at?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          display_name: string
          id: string
          pronouns: string | null
          timezone: string | null
          updated_at: string
          visibility: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name: string
          id?: string
          pronouns?: string | null
          timezone?: string | null
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name?: string
          id?: string
          pronouns?: string | null
          timezone?: string | null
          updated_at?: string
          visibility?: string | null
        }
        Relationships: []
      }
      show_cast: {
        Row: {
          created_at: string
          note: string | null
          program_order: number | null
          show_id: string
          source: Database["public"]["Enums"]["show_cast_source"]
          status: Database["public"]["Enums"]["show_cast_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          note?: string | null
          program_order?: number | null
          show_id: string
          source: Database["public"]["Enums"]["show_cast_source"]
          status?: Database["public"]["Enums"]["show_cast_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          note?: string | null
          program_order?: number | null
          show_id?: string
          source?: Database["public"]["Enums"]["show_cast_source"]
          status?: Database["public"]["Enums"]["show_cast_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "show_cast_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "show_cast_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      show_occurrences: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          show_id: string
          starts_at: string
          status: Database["public"]["Enums"]["show_occurrence_status"]
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          show_id: string
          starts_at: string
          status?: Database["public"]["Enums"]["show_occurrence_status"]
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          show_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["show_occurrence_status"]
        }
        Relationships: [
          {
            foreignKeyName: "show_occurrences_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
      }
      show_review_events: {
        Row: {
          action: Database["public"]["Enums"]["review_action"]
          actor_user_id: string | null
          created_at: string
          id: string
          note: string | null
          show_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["review_action"]
          actor_user_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          show_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["review_action"]
          actor_user_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          show_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "show_review_events_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "show_review_events_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
      }
      show_roles: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["show_role"]
          show_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: Database["public"]["Enums"]["show_role"]
          show_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["show_role"]
          show_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "show_roles_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "show_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shows: {
        Row: {
          cast_max: number | null
          cast_min: number | null
          casting_mode: Database["public"]["Enums"]["casting_mode"]
          created_at: string
          created_by_user_id: string | null
          description: string | null
          id: string
          is_cast_finalized: boolean
          is_practice: boolean
          is_public_listed: boolean
          on_sale_at: string | null
          status: Database["public"]["Enums"]["show_status"]
          theater_id: string
          ticket_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          cast_max?: number | null
          cast_min?: number | null
          casting_mode?: Database["public"]["Enums"]["casting_mode"]
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          is_cast_finalized?: boolean
          is_practice?: boolean
          is_public_listed?: boolean
          on_sale_at?: string | null
          status?: Database["public"]["Enums"]["show_status"]
          theater_id: string
          ticket_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          cast_max?: number | null
          cast_min?: number | null
          casting_mode?: Database["public"]["Enums"]["casting_mode"]
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          is_cast_finalized?: boolean
          is_practice?: boolean
          is_public_listed?: boolean
          on_sale_at?: string | null
          status?: Database["public"]["Enums"]["show_status"]
          theater_id?: string
          ticket_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shows_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shows_theater_id_fkey"
            columns: ["theater_id"]
            isOneToOne: false
            referencedRelation: "theaters"
            referencedColumns: ["id"]
          },
        ]
      }
      theater_memberships: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["theater_role"]
          status: Database["public"]["Enums"]["membership_status"]
          theater_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role: Database["public"]["Enums"]["theater_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          theater_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["theater_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          theater_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "theater_memberships_theater_id_fkey"
            columns: ["theater_id"]
            isOneToOne: false
            referencedRelation: "theaters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "theater_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      theaters: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          timezone?: string
          updated_at?: string
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
      casting_mode: "direct_invite" | "theater_casting" | "public_casting"
      email_outbox_status: "queued" | "sent" | "failed"
      membership_status: "active" | "inactive"
      notification_entity: "show" | "occurrence" | "cast"
      review_action: "submitted" | "approved" | "rejected" | "changes_requested"
      show_cast_source: "invited" | "requested"
      show_cast_status:
        | "pending"
        | "accepted"
        | "declined"
        | "withdrawn"
        | "removed"
      show_occurrence_status: "scheduled" | "changed" | "cancelled"
      show_role: "producer"
      show_status:
        | "draft"
        | "pending_review"
        | "approved"
        | "rejected"
        | "cancelled"
      theater_role: "manager" | "staff" | "member"
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
      casting_mode: ["direct_invite", "theater_casting", "public_casting"],
      email_outbox_status: ["queued", "sent", "failed"],
      membership_status: ["active", "inactive"],
      notification_entity: ["show", "occurrence", "cast"],
      review_action: ["submitted", "approved", "rejected", "changes_requested"],
      show_cast_source: ["invited", "requested"],
      show_cast_status: [
        "pending",
        "accepted",
        "declined",
        "withdrawn",
        "removed",
      ],
      show_occurrence_status: ["scheduled", "changed", "cancelled"],
      show_role: ["producer"],
      show_status: [
        "draft",
        "pending_review",
        "approved",
        "rejected",
        "cancelled",
      ],
      theater_role: ["manager", "staff", "member"],
    },
  },
} as const

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
      churches: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          location: string | null
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          participant_id: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_id?: string | null
          title?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_id?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_wisdom_stories: {
        Row: {
          content: string
          created_at: string
          id: string
          moral_takeaway: string | null
          theme: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          moral_takeaway?: string | null
          theme: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          moral_takeaway?: string | null
          theme?: string
          title?: string
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          event_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          attendee_count: number
          created_at: string
          creator_id: string | null
          description: string | null
          event_date: string
          id: string
          image_url: string | null
          location: string | null
          title: string
          updated_at: string
        }
        Insert: {
          attendee_count?: number
          created_at?: string
          creator_id?: string | null
          description?: string | null
          event_date: string
          id?: string
          image_url?: string | null
          location?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          attendee_count?: number
          created_at?: string
          creator_id?: string | null
          description?: string | null
          event_date?: string
          id?: string
          image_url?: string | null
          location?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          creator_id: string | null
          description: string | null
          icon_url: string | null
          id: string
          member_count: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          member_count?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          member_count?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          author_name: string | null
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          author_name?: string | null
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          author_name?: string | null
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_interactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_avatar: string | null
          author_name: string | null
          comment_count: number
          content: string
          created_at: string
          encourage_count: number
          id: string
          is_anonymous: boolean
          like_count: number
          media_type: string | null
          media_url: string | null
          post_type: string
          pray_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          author_avatar?: string | null
          author_name?: string | null
          comment_count?: number
          content: string
          created_at?: string
          encourage_count?: number
          id?: string
          is_anonymous?: boolean
          like_count?: number
          media_type?: string | null
          media_url?: string | null
          post_type?: string
          pray_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          author_avatar?: string | null
          author_name?: string | null
          comment_count?: number
          content?: string
          created_at?: string
          encourage_count?: number
          id?: string
          is_anonymous?: boolean
          like_count?: number
          media_type?: string | null
          media_url?: string | null
          post_type?: string
          pray_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prayers: {
        Row: {
          author_name: string | null
          content: string
          created_at: string
          id: string
          is_anonymous: boolean
          updated_at: string
          user_id: string | null
        }
        Insert: {
          author_name?: string | null
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          author_name?: string | null
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          gender: string | null
          id: string
          name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gender?: string | null
          id?: string
          name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gender?: string | null
          id?: string
          name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          device_info: Json | null
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          id?: string
          platform: string
          token: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          id?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      reels: {
        Row: {
          author_name: string | null
          created_at: string
          description: string | null
          id: string
          like_count: number
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          video_url: string
          view_count: number
        }
        Insert: {
          author_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          like_count?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_url: string
          view_count?: number
        }
        Update: {
          author_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          like_count?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string
          view_count?: number
        }
        Relationships: []
      }
      salvation_acceptances: {
        Row: {
          accepted_at: string
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          accepted_at?: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          accepted_at?: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      saved_stories: {
        Row: {
          id: string
          saved_at: string
          story_id: string
          user_id: string
        }
        Insert: {
          id?: string
          saved_at?: string
          story_id: string
          user_id: string
        }
        Update: {
          id?: string
          saved_at?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_stories_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "daily_wisdom_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_content: {
        Row: {
          content: string
          context: string | null
          created_at: string | null
          id: string
          share_token: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          content: string
          context?: string | null
          created_at?: string | null
          id?: string
          share_token?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          content?: string
          context?: string | null
          created_at?: string | null
          id?: string
          share_token?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      teachings: {
        Row: {
          author_name: string
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string | null
          video_url: string | null
          view_count: number
        }
        Insert: {
          author_name: string
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
          video_url?: string | null
          view_count?: number
        }
        Update: {
          author_name?: string
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
          video_url?: string | null
          view_count?: number
        }
        Relationships: []
      }
      testimonies: {
        Row: {
          author_name: string | null
          content: string
          created_at: string
          id: string
          is_anonymous: boolean
          updated_at: string
          user_id: string | null
        }
        Insert: {
          author_name?: string | null
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          author_name?: string | null
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_message_usage: {
        Row: {
          created_at: string
          id: string
          last_reset_at: string
          message_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_reset_at?: string
          message_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_reset_at?: string
          message_count?: number
          user_id?: string
        }
        Relationships: []
      }
      user_story_views: {
        Row: {
          id: string
          story_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          story_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "daily_wisdom_stories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_and_increment_message_count: {
        Args: { p_user_id: string }
        Returns: {
          allowed: boolean
          remaining: number
        }[]
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

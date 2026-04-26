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
      account_deletion_requests: {
        Row: {
          cancelled_at: string | null
          completed_at: string | null
          id: string
          notes: string | null
          requested_at: string
          scheduled_deletion_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          completed_at?: string | null
          id?: string
          notes?: string | null
          requested_at?: string
          scheduled_deletion_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          completed_at?: string | null
          id?: string
          notes?: string | null
          requested_at?: string
          scheduled_deletion_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      daily_devotionals: {
        Row: {
          application_question_en: string
          application_question_es: string
          created_at: string
          day_of_year: number
          id: string
          prayer_en: string
          prayer_es: string
          reflection_en: string
          reflection_es: string
          scripture_ref_en: string
          scripture_ref_es: string
          scripture_text_en: string
          scripture_text_es: string
          title_en: string
          title_es: string
        }
        Insert: {
          application_question_en: string
          application_question_es: string
          created_at?: string
          day_of_year: number
          id?: string
          prayer_en: string
          prayer_es: string
          reflection_en: string
          reflection_es: string
          scripture_ref_en: string
          scripture_ref_es: string
          scripture_text_en: string
          scripture_text_es: string
          title_en: string
          title_es: string
        }
        Update: {
          application_question_en?: string
          application_question_es?: string
          created_at?: string
          day_of_year?: number
          id?: string
          prayer_en?: string
          prayer_es?: string
          reflection_en?: string
          reflection_es?: string
          scripture_ref_en?: string
          scripture_ref_es?: string
          scripture_text_en?: string
          scripture_text_es?: string
          title_en?: string
          title_es?: string
        }
        Relationships: []
      }
      daily_wisdom_stories: {
        Row: {
          content: string
          created_at: string
          era: string | null
          id: string
          law_interpretation: string | null
          law_observance: string | null
          law_statement: string | null
          law_transgression: string | null
          moral_takeaway: string | null
          subject: string
          theme: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          era?: string | null
          id?: string
          law_interpretation?: string | null
          law_observance?: string | null
          law_statement?: string | null
          law_transgression?: string | null
          moral_takeaway?: string | null
          subject?: string
          theme: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          era?: string | null
          id?: string
          law_interpretation?: string | null
          law_observance?: string | null
          law_statement?: string | null
          law_transgression?: string | null
          moral_takeaway?: string | null
          subject?: string
          theme?: string
          title?: string
        }
        Relationships: []
      }
      devotional_comment_reports: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          reason: string | null
          reporter_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          reason?: string | null
          reporter_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          reporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "devotional_comment_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "devotional_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      devotional_comment_votes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
          vote: number
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
          vote: number
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
          vote?: number
        }
        Relationships: [
          {
            foreignKeyName: "devotional_comment_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "devotional_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      devotional_comments: {
        Row: {
          author_avatar: string | null
          author_name: string | null
          content: string
          created_at: string
          devotional_id: string
          id: string
          is_hidden: boolean
          parent_id: string | null
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          author_avatar?: string | null
          author_name?: string | null
          content: string
          created_at?: string
          devotional_id: string
          id?: string
          is_hidden?: boolean
          parent_id?: string | null
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          author_avatar?: string | null
          author_name?: string | null
          content?: string
          created_at?: string
          devotional_id?: string
          id?: string
          is_hidden?: boolean
          parent_id?: string | null
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "devotional_comments_devotional_id_fkey"
            columns: ["devotional_id"]
            isOneToOne: false
            referencedRelation: "daily_devotionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devotional_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "devotional_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      discernment_usage: {
        Row: {
          count: number
          created_at: string
          feature: string
          id: string
          period_start: string
          updated_at: string
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          feature: string
          id?: string
          period_start?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          feature?: string
          id?: string
          period_start?: string
          updated_at?: string
          user_id?: string
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
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      google_play_purchases: {
        Row: {
          acknowledged: boolean
          auto_renewing: boolean
          created_at: string
          expiry_time: string | null
          id: string
          last_verified_at: string
          order_id: string | null
          product_id: string
          purchase_token: string
          raw_response: Json | null
          start_time: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          acknowledged?: boolean
          auto_renewing?: boolean
          created_at?: string
          expiry_time?: string | null
          id?: string
          last_verified_at?: string
          order_id?: string | null
          product_id: string
          purchase_token: string
          raw_response?: Json | null
          start_time?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          acknowledged?: boolean
          auto_renewing?: boolean
          created_at?: string
          expiry_time?: string | null
          id?: string
          last_verified_at?: string
          order_id?: string | null
          product_id?: string
          purchase_token?: string
          raw_response?: Json | null
          start_time?: string | null
          status?: string
          updated_at?: string
          user_id?: string
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
      hero_images: {
        Row: {
          approved_at: string | null
          created_at: string
          display_count: number
          first_displayed_at: string | null
          id: string
          image_url: string
          last_displayed_at: string | null
          rejection_reason: string | null
          status: string
          storage_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          display_count?: number
          first_displayed_at?: string | null
          id?: string
          image_url: string
          last_displayed_at?: string | null
          rejection_reason?: string | null
          status?: string
          storage_path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          display_count?: number
          first_displayed_at?: string | null
          id?: string
          image_url?: string
          last_displayed_at?: string | null
          rejection_reason?: string | null
          status?: string
          storage_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      live_chat_messages: {
        Row: {
          author_avatar: string | null
          author_name: string | null
          content: string
          created_at: string
          id: string
          stream_id: string
          user_id: string
        }
        Insert: {
          author_avatar?: string | null
          author_name?: string | null
          content: string
          created_at?: string
          id?: string
          stream_id: string
          user_id: string
        }
        Update: {
          author_avatar?: string | null
          author_name?: string | null
          content?: string
          created_at?: string
          id?: string
          stream_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_chat_messages_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      live_streams: {
        Row: {
          author_name: string
          created_at: string
          description: string | null
          ended_at: string | null
          id: string
          started_at: string
          status: string
          stream_url: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          viewer_count: number
        }
        Insert: {
          author_name: string
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          started_at?: string
          status?: string
          stream_url?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          viewer_count?: number
        }
        Update: {
          author_name?: string
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          started_at?: string
          status?: string
          stream_url?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          viewer_count?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          media_duration_ms: number | null
          media_type: string | null
          media_url: string | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          media_duration_ms?: number | null
          media_type?: string | null
          media_url?: string | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          media_duration_ms?: number | null
          media_type?: string | null
          media_url?: string | null
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
      notifications: {
        Row: {
          actor_avatar: string | null
          actor_id: string | null
          actor_name: string | null
          body: string | null
          created_at: string
          entity_id: string | null
          id: string
          is_read: boolean
          link: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          actor_avatar?: string | null
          actor_id?: string | null
          actor_name?: string | null
          body?: string | null
          created_at?: string
          entity_id?: string | null
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          actor_avatar?: string | null
          actor_id?: string | null
          actor_name?: string | null
          body?: string | null
          created_at?: string
          entity_id?: string | null
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
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
      post_votes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_votes_post_id_fkey"
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
          category: string
          comment_count: number
          content: string
          created_at: string
          encourage_count: number
          hot_score: number
          id: string
          is_anonymous: boolean
          like_count: number
          media_type: string | null
          media_url: string | null
          post_type: string
          pray_count: number
          updated_at: string
          user_id: string
          vote_score: number
        }
        Insert: {
          author_avatar?: string | null
          author_name?: string | null
          category?: string
          comment_count?: number
          content: string
          created_at?: string
          encourage_count?: number
          hot_score?: number
          id?: string
          is_anonymous?: boolean
          like_count?: number
          media_type?: string | null
          media_url?: string | null
          post_type?: string
          pray_count?: number
          updated_at?: string
          user_id: string
          vote_score?: number
        }
        Update: {
          author_avatar?: string | null
          author_name?: string | null
          category?: string
          comment_count?: number
          content?: string
          created_at?: string
          encourage_count?: number
          hot_score?: number
          id?: string
          is_anonymous?: boolean
          like_count?: number
          media_type?: string | null
          media_url?: string | null
          post_type?: string
          pray_count?: number
          updated_at?: string
          user_id?: string
          vote_score?: number
        }
        Relationships: []
      }
      prayer_comments: {
        Row: {
          author_avatar: string | null
          author_name: string | null
          content: string
          created_at: string
          id: string
          is_hidden: boolean
          parent_id: string | null
          prayer_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_avatar?: string | null
          author_name?: string | null
          content: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          parent_id?: string | null
          prayer_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author_avatar?: string | null
          author_name?: string | null
          content?: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          parent_id?: string | null
          prayer_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "prayer_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prayer_comments_prayer_id_fkey"
            columns: ["prayer_id"]
            isOneToOne: false
            referencedRelation: "prayers"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_reactions: {
        Row: {
          created_at: string
          id: string
          prayer_id: string
          reaction: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prayer_id: string
          reaction: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prayer_id?: string
          reaction?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_reactions_prayer_id_fkey"
            columns: ["prayer_id"]
            isOneToOne: false
            referencedRelation: "prayers"
            referencedColumns: ["id"]
          },
        ]
      }
      prayers: {
        Row: {
          amen_count: number
          answered_at: string | null
          author_avatar: string | null
          author_name: string | null
          comment_count: number
          content: string
          created_at: string
          encouraged_count: number
          id: string
          is_anonymous: boolean
          is_answered: boolean
          praying_count: number
          theme: string | null
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amen_count?: number
          answered_at?: string | null
          author_avatar?: string | null
          author_name?: string | null
          comment_count?: number
          content: string
          created_at?: string
          encouraged_count?: number
          id?: string
          is_anonymous?: boolean
          is_answered?: boolean
          praying_count?: number
          theme?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amen_count?: number
          answered_at?: string | null
          author_avatar?: string | null
          author_name?: string | null
          comment_count?: number
          content?: string
          created_at?: string
          encouraged_count?: number
          id?: string
          is_anonymous?: boolean
          is_answered?: boolean
          praying_count?: number
          theme?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          created_at: string
          follower_count: number
          following_count: number
          gender: string | null
          id: string
          name: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string
          follower_count?: number
          following_count?: number
          gender?: string | null
          id?: string
          name?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string
          follower_count?: number
          following_count?: number
          gender?: string | null
          id?: string
          name?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
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
      sermon_drafts: {
        Row: {
          ai_feedback: string | null
          ai_rewrite: string | null
          assembled_text: string | null
          created_at: string
          id: string
          scripture_ref: string | null
          step_1: string | null
          step_10: string | null
          step_2: string | null
          step_3: string | null
          step_4: string | null
          step_5: string | null
          step_6: string | null
          step_7: string | null
          step_8: string | null
          step_9: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          ai_rewrite?: string | null
          assembled_text?: string | null
          created_at?: string
          id?: string
          scripture_ref?: string | null
          step_1?: string | null
          step_10?: string | null
          step_2?: string | null
          step_3?: string | null
          step_4?: string | null
          step_5?: string | null
          step_6?: string | null
          step_7?: string | null
          step_8?: string | null
          step_9?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          ai_rewrite?: string | null
          assembled_text?: string | null
          created_at?: string
          id?: string
          scripture_ref?: string | null
          step_1?: string | null
          step_10?: string | null
          step_2?: string | null
          step_3?: string | null
          step_4?: string | null
          step_5?: string | null
          step_6?: string | null
          step_7?: string | null
          step_8?: string | null
          step_9?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
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
      transcription_usage: {
        Row: {
          created_at: string
          daily_minutes: number
          day_bucket: string
          id: string
          month_bucket: string
          monthly_minutes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_minutes?: number
          day_bucket?: string
          id?: string
          month_bucket?: string
          monthly_minutes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_minutes?: number
          day_bucket?: string
          id?: string
          month_bucket?: string
          monthly_minutes?: number
          updated_at?: string
          user_id?: string
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
      check_and_increment_discernment_usage: {
        Args: { p_feature: string; p_user_id: string }
        Returns: {
          allowed: boolean
          monthly_limit: number
          remaining: number
          tier: string
        }[]
      }
      check_and_increment_message_count: {
        Args: { p_user_id: string }
        Returns: {
          allowed: boolean
          daily_limit: number
          remaining: number
          tier: string
        }[]
      }
      check_and_increment_transcription_minutes: {
        Args: { p_minutes: number; p_user_id: string }
        Returns: {
          allowed: boolean
          daily_limit: number
          daily_remaining: number
          monthly_limit: number
          monthly_remaining: number
          tier: string
        }[]
      }
      check_sermon_draft_quota: {
        Args: { p_user_id: string }
        Returns: {
          allowed: boolean
          monthly_limit: number
          remaining: number
          tier: string
        }[]
      }
      get_user_tier: { Args: { p_user_id: string }; Returns: string }
      is_staff_email: { Args: { p_user_id: string }; Returns: boolean }
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

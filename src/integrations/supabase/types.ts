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
      delivery_ratings: {
        Row: {
          created_at: string
          id: string
          parcel_id: string
          rated_by: string
          rating: number
          review: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          parcel_id: string
          rated_by: string
          rating: number
          review?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          parcel_id?: string
          rated_by?: string
          rating?: number
          review?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_ratings_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: true
            referencedRelation: "parcels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_ratings_rated_by_fkey"
            columns: ["rated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parcels: {
        Row: {
          created_at: string
          delivery_address: string | null
          description: string | null
          dropoff_location: string | null
          id: string
          include_tracking: boolean | null
          pickup_address: string | null
          pickup_location: string | null
          price: number | null
          recipient_name: string | null
          recipient_phone: string | null
          sender_email: string | null
          sender_id: string | null
          sender_name: string | null
          sender_phone: string | null
          status: string | null
          traveler_id: string | null
          updated_at: string
          weight_band: string | null
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          delivery_address?: string | null
          description?: string | null
          dropoff_location?: string | null
          id?: string
          include_tracking?: boolean | null
          pickup_address?: string | null
          pickup_location?: string | null
          price?: number | null
          recipient_name?: string | null
          recipient_phone?: string | null
          sender_email?: string | null
          sender_id?: string | null
          sender_name?: string | null
          sender_phone?: string | null
          status?: string | null
          traveler_id?: string | null
          updated_at?: string
          weight_band?: string | null
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          delivery_address?: string | null
          description?: string | null
          dropoff_location?: string | null
          id?: string
          include_tracking?: boolean | null
          pickup_address?: string | null
          pickup_location?: string | null
          price?: number | null
          recipient_name?: string | null
          recipient_phone?: string | null
          sender_email?: string | null
          sender_id?: string | null
          sender_name?: string | null
          sender_phone?: string | null
          status?: string | null
          traveler_id?: string | null
          updated_at?: string
          weight_band?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "parcels_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcels_traveler_id_fkey"
            columns: ["traveler_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_id: string
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          id_document_url: string | null
          legal_declaration_accepted: boolean | null
          phone: string | null
          physical_address: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          auth_id: string
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          id_document_url?: string | null
          legal_declaration_accepted?: boolean | null
          phone?: string | null
          physical_address?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          auth_id?: string
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          id_document_url?: string | null
          legal_declaration_accepted?: boolean | null
          phone?: string | null
          physical_address?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      traveler_profiles: {
        Row: {
          advance_notice: string | null
          available_days: string[] | null
          cargo_types: string[] | null
          created_at: string
          departure_time: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          has_valid_insurance: boolean | null
          id: string
          id_copy_url: string | null
          license_copy_url: string | null
          license_type: string | null
          max_load_capacity: string | null
          min_load_capacity: string | null
          no_criminal_record: boolean | null
          parcels_per_trip: string | null
          profile_id: string
          referral_source: string | null
          schedule_type: string | null
          storage_type: string | null
          travel_frequency: string | null
          vehicle_colour: string | null
          vehicle_model: string | null
          vehicle_ownership: string | null
          vehicle_registration: string | null
          vehicle_type: string | null
          vehicle_year: string | null
          years_with_license: string | null
        }
        Insert: {
          advance_notice?: string | null
          available_days?: string[] | null
          cargo_types?: string[] | null
          created_at?: string
          departure_time?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          has_valid_insurance?: boolean | null
          id?: string
          id_copy_url?: string | null
          license_copy_url?: string | null
          license_type?: string | null
          max_load_capacity?: string | null
          min_load_capacity?: string | null
          no_criminal_record?: boolean | null
          parcels_per_trip?: string | null
          profile_id: string
          referral_source?: string | null
          schedule_type?: string | null
          storage_type?: string | null
          travel_frequency?: string | null
          vehicle_colour?: string | null
          vehicle_model?: string | null
          vehicle_ownership?: string | null
          vehicle_registration?: string | null
          vehicle_type?: string | null
          vehicle_year?: string | null
          years_with_license?: string | null
        }
        Update: {
          advance_notice?: string | null
          available_days?: string[] | null
          cargo_types?: string[] | null
          created_at?: string
          departure_time?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          has_valid_insurance?: boolean | null
          id?: string
          id_copy_url?: string | null
          license_copy_url?: string | null
          license_type?: string | null
          max_load_capacity?: string | null
          min_load_capacity?: string | null
          no_criminal_record?: boolean | null
          parcels_per_trip?: string | null
          profile_id?: string
          referral_source?: string | null
          schedule_type?: string | null
          storage_type?: string | null
          travel_frequency?: string | null
          vehicle_colour?: string | null
          vehicle_model?: string | null
          vehicle_ownership?: string | null
          vehicle_registration?: string | null
          vehicle_type?: string | null
          vehicle_year?: string | null
          years_with_license?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "traveler_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      traveler_routes: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          return_trip: string | null
          route_from: string | null
          route_to: string | null
          traveler_profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          return_trip?: string | null
          route_from?: string | null
          route_to?: string | null
          traveler_profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          return_trip?: string | null
          route_from?: string | null
          route_to?: string | null
          traveler_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "traveler_routes_traveler_profile_id_fkey"
            columns: ["traveler_profile_id"]
            isOneToOne: false
            referencedRelation: "traveler_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_profile_id: { Args: { _auth_uid: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      owns_profile: { Args: { _profile_id: string }; Returns: boolean }
      owns_traveler_profile: { Args: { _tp_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const

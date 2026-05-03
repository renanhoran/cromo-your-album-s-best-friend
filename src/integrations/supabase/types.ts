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
      profiles: {
        Row: {
          address: string | null
          address_complement: string | null
          address_number: string | null
          asaas_customer_id: string | null
          asaas_payment_id: string | null
          avatar: string | null
          cidade: string | null
          city: string | null
          cpf_cnpj: string | null
          created_at: string | null
          id: string
          is_premium: boolean | null
          nome: string | null
          onboarding_concluido: boolean | null
          phone: string | null
          plano: string | null
          postal_code: string | null
          province: string | null
          teste_iniciado_em: string
        }
        Insert: {
          address?: string | null
          address_complement?: string | null
          address_number?: string | null
          asaas_customer_id?: string | null
          asaas_payment_id?: string | null
          avatar?: string | null
          cidade?: string | null
          city?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          id: string
          is_premium?: boolean | null
          nome?: string | null
          onboarding_concluido?: boolean | null
          phone?: string | null
          plano?: string | null
          postal_code?: string | null
          province?: string | null
          teste_iniciado_em?: string
        }
        Update: {
          address?: string | null
          address_complement?: string | null
          address_number?: string | null
          asaas_customer_id?: string | null
          asaas_payment_id?: string | null
          avatar?: string | null
          cidade?: string | null
          city?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          nome?: string | null
          onboarding_concluido?: boolean | null
          phone?: string | null
          plano?: string | null
          postal_code?: string | null
          province?: string | null
          teste_iniciado_em?: string
        }
        Relationships: []
      }
      trade_locations: {
        Row: {
          ativo: boolean | null
          cidade: string
          created_at: string | null
          created_by: string | null
          data_evento: string | null
          descricao: string | null
          endereco: string | null
          estado: string | null
          horario: string | null
          id: string
          lat: number | null
          lng: number | null
          nome: string
          tipo: string | null
        }
        Insert: {
          ativo?: boolean | null
          cidade: string
          created_at?: string | null
          created_by?: string | null
          data_evento?: string | null
          descricao?: string | null
          endereco?: string | null
          estado?: string | null
          horario?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          nome: string
          tipo?: string | null
        }
        Update: {
          ativo?: boolean | null
          cidade?: string
          created_at?: string | null
          created_by?: string | null
          data_evento?: string | null
          descricao?: string | null
          endereco?: string | null
          estado?: string | null
          horario?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          nome?: string
          tipo?: string | null
        }
        Relationships: []
      }
      user_stickers: {
        Row: {
          count: number | null
          id: string
          sticker_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          count?: number | null
          id?: string
          sticker_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          count?: number | null
          id?: string
          sticker_id?: string
          updated_at?: string | null
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

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
      clients: {
        Row: {
          codice_fiscale: string
          codice_sdi: string
          created_at: string
          email: string
          id: string
          indirizzo: string
          nome: string
          partita_iva: string
          progetti_attivi: number
          stato: Database["public"]["Enums"]["client_status"]
          telefono: string
          updated_at: string
          user_id: string
        }
        Insert: {
          codice_fiscale?: string
          codice_sdi?: string
          created_at?: string
          email?: string
          id?: string
          indirizzo?: string
          nome?: string
          partita_iva?: string
          progetti_attivi?: number
          stato?: Database["public"]["Enums"]["client_status"]
          telefono?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          codice_fiscale?: string
          codice_sdi?: string
          created_at?: string
          email?: string
          id?: string
          indirizzo?: string
          nome?: string
          partita_iva?: string
          progetti_attivi?: number
          stato?: Database["public"]["Enums"]["client_status"]
          telefono?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_drafts: {
        Row: {
          body: string
          created_at: string
          id: string
          recipients: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          recipients?: string
          subject?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          recipients?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          codice_ateco: string
          codice_fiscale: string
          codice_sdi: string
          coefficiente_redditivita: string
          cognome: string
          created_at: string
          email: string
          id: string
          indirizzo: string
          nome: string
          notifica_push_pagamenti: boolean
          notifica_scadenze_fiscali: boolean
          partita_iva: string
          report_settimanale: boolean
          telefono: string
          tipo_attivita: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          codice_ateco?: string
          codice_fiscale?: string
          codice_sdi?: string
          coefficiente_redditivita?: string
          cognome?: string
          created_at?: string
          email?: string
          id?: string
          indirizzo?: string
          nome?: string
          notifica_push_pagamenti?: boolean
          notifica_scadenze_fiscali?: boolean
          partita_iva?: string
          report_settimanale?: boolean
          telefono?: string
          tipo_attivita?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          codice_ateco?: string
          codice_fiscale?: string
          codice_sdi?: string
          coefficiente_redditivita?: string
          cognome?: string
          created_at?: string
          email?: string
          id?: string
          indirizzo?: string
          nome?: string
          notifica_push_pagamenti?: boolean
          notifica_scadenze_fiscali?: boolean
          partita_iva?: string
          report_settimanale?: boolean
          telefono?: string
          tipo_attivita?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          codice_fiscale: string
          codice_sdi: string
          created_at: string
          email: string
          id: string
          indirizzo: string
          nome: string
          partita_iva: string
          stato: Database["public"]["Enums"]["supplier_status"]
          telefono: string
          updated_at: string
          user_id: string
        }
        Insert: {
          codice_fiscale?: string
          codice_sdi?: string
          created_at?: string
          email?: string
          id?: string
          indirizzo?: string
          nome?: string
          partita_iva?: string
          stato?: Database["public"]["Enums"]["supplier_status"]
          telefono?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          codice_fiscale?: string
          codice_sdi?: string
          created_at?: string
          email?: string
          id?: string
          indirizzo?: string
          nome?: string
          partita_iva?: string
          stato?: Database["public"]["Enums"]["supplier_status"]
          telefono?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          category: Database["public"]["Enums"]["tag_category"]
          color: string
          created_at: string
          id: string
          label: string
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["tag_category"]
          color?: string
          created_at?: string
          id?: string
          label: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["tag_category"]
          color?: string
          created_at?: string
          id?: string
          label?: string
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
      client_status:
        | "progetti_attivi"
        | "contatto_annuale"
        | "fase_conoscenza"
        | "progetto_concluso"
      supplier_status:
        | "collaborazione_fissa"
        | "collaborazione_spot"
        | "fase_conoscenza"
        | "evitare"
      tag_category: "clienti" | "fornitori" | "progetti" | "stato"
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
      client_status: [
        "progetti_attivi",
        "contatto_annuale",
        "fase_conoscenza",
        "progetto_concluso",
      ],
      supplier_status: [
        "collaborazione_fissa",
        "collaborazione_spot",
        "fase_conoscenza",
        "evitare",
      ],
      tag_category: ["clienti", "fornitori", "progetti", "stato"],
    },
  },
} as const

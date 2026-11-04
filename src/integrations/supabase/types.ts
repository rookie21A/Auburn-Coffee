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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          created_at: string
          id: string
          is_default: boolean
          label: string | null
          line1: string
          line2: string | null
          phone: string
          pincode: string
          recipient_name: string
          state: string
          user_id: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          line1: string
          line2?: string | null
          phone: string
          pincode: string
          recipient_name: string
          state: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          line1?: string
          line2?: string | null
          phone?: string
          pincode?: string
          recipient_name?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      bulk_enquiries: {
        Row: {
          business_type: string | null
          company: string | null
          created_at: string
          email: string
          expected_quantity: string | null
          frequency: string | null
          full_name: string
          id: string
          message: string | null
          phone: string
          product_interest: string | null
          status: string
        }
        Insert: {
          business_type?: string | null
          company?: string | null
          created_at?: string
          email: string
          expected_quantity?: string | null
          frequency?: string | null
          full_name: string
          id?: string
          message?: string | null
          phone: string
          product_interest?: string | null
          status?: string
        }
        Update: {
          business_type?: string | null
          company?: string | null
          created_at?: string
          email?: string
          expected_quantity?: string | null
          frequency?: string | null
          full_name?: string
          id?: string
          message?: string | null
          phone?: string
          product_interest?: string | null
          status?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          active: boolean
          alt_text: string
          category: string
          created_at: string
          id: string
          image_url: string
          sort_order: number
          title: string
        }
        Insert: {
          active?: boolean
          alt_text: string
          category: string
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
          title: string
        }
        Update: {
          active?: boolean
          alt_text?: string
          category?: string
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          grind: string | null
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price: number
          variant_label: string | null
        }
        Insert: {
          created_at?: string
          grind?: string | null
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          unit_price: number
          variant_label?: string | null
        }
        Update: {
          created_at?: string
          grind?: string | null
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
          variant_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string
          id: string
          notes: string | null
          order_number: string | null
          payment_method: string
          payment_reference: string | null
          shipping: number
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string
          id?: string
          notes?: string | null
          order_number?: string | null
          payment_method?: string
          payment_reference?: string | null
          shipping?: number
          status?: string
          subtotal: number
          total: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_address?: string
          id?: string
          notes?: string | null
          order_number?: string | null
          payment_method?: string
          payment_reference?: string | null
          shipping?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          id: string
          price: number
          product_id: string
          sort_order: number
          stock: number
          weight_grams: number | null
          weight_label: string
        }
        Insert: {
          id?: string
          price: number
          product_id: string
          sort_order?: number
          stock?: number
          weight_grams?: number | null
          weight_label: string
        }
        Update: {
          id?: string
          price?: number
          product_id?: string
          sort_order?: number
          stock?: number
          weight_grams?: number | null
          weight_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          acidity: string | null
          active: boolean
          altitude: string | null
          body: string | null
          brewing_guide: string | null
          brewing_methods: string[]
          category_slug: string
          coffee_variety: string | null
          created_at: string
          description: string | null
          discount_price: number | null
          farm_details: string | null
          featured: boolean
          grind_options: string[]
          id: string
          images: string[]
          name: string
          origin: string | null
          price: number
          processing_method: string | null
          product_kind: string
          product_story: string | null
          rating: number | null
          roast_level: string | null
          short_description: string | null
          slug: string
          stock: number
          storage_note: string | null
          subcategory: string | null
          sweetness: string | null
          tasting_notes: string[]
          updated_at: string
        }
        Insert: {
          acidity?: string | null
          active?: boolean
          altitude?: string | null
          body?: string | null
          brewing_guide?: string | null
          brewing_methods?: string[]
          category_slug: string
          coffee_variety?: string | null
          created_at?: string
          description?: string | null
          discount_price?: number | null
          farm_details?: string | null
          featured?: boolean
          grind_options?: string[]
          id?: string
          images?: string[]
          name: string
          origin?: string | null
          price: number
          processing_method?: string | null
          product_kind?: string
          product_story?: string | null
          rating?: number | null
          roast_level?: string | null
          short_description?: string | null
          slug: string
          stock?: number
          storage_note?: string | null
          subcategory?: string | null
          sweetness?: string | null
          tasting_notes?: string[]
          updated_at?: string
        }
        Update: {
          acidity?: string | null
          active?: boolean
          altitude?: string | null
          body?: string | null
          brewing_guide?: string | null
          brewing_methods?: string[]
          category_slug?: string
          coffee_variety?: string | null
          created_at?: string
          description?: string | null
          discount_price?: number | null
          farm_details?: string | null
          featured?: boolean
          grind_options?: string[]
          id?: string
          images?: string[]
          name?: string
          origin?: string | null
          price?: number
          processing_method?: string | null
          product_kind?: string
          product_story?: string | null
          rating?: number | null
          roast_level?: string | null
          short_description?: string | null
          slug?: string
          stock?: number
          storage_note?: string | null
          subcategory?: string | null
          sweetness?: string | null
          tasting_notes?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_slug_fkey"
            columns: ["category_slug"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["slug"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          mobile: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          mobile?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          mobile?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          approved: boolean
          contact: string | null
          created_at: string
          feedback: string
          id: string
          name: string
          order_reference: string | null
          rating: number
          user_id: string | null
        }
        Insert: {
          approved?: boolean
          contact?: string | null
          created_at?: string
          feedback: string
          id?: string
          name: string
          order_reference?: string | null
          rating: number
          user_id?: string | null
        }
        Update: {
          approved?: boolean
          contact?: string | null
          created_at?: string
          feedback?: string
          id?: string
          name?: string
          order_reference?: string | null
          rating?: number
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "customer"],
    },
  },
} as const

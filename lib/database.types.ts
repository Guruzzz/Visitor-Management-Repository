export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string
          role: 'admin' | 'reception' | 'security'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          phone: string
          role?: 'admin' | 'reception' | 'security'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string
          role?: 'admin' | 'reception' | 'security'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      visitors: {
        Row: {
          id: string
          visitor_number: string
          full_name: string
          phone: string
          national_id: string
          company: string
          photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          visitor_number?: string
          full_name: string
          phone: string
          national_id: string
          company: string
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          visitor_number?: string
          full_name?: string
          phone?: string
          national_id?: string
          company?: string
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      visits: {
        Row: {
          id: string
          visitor_id: string
          visit_reference: string
          person_being_visited: string
          department: string
          purpose: string
          check_in_at: string
          check_out_at: string | null
          duration: number | null
          status: 'checked_in' | 'checked_out'
          qr_code_identifier: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          visitor_id: string
          visit_reference?: string
          person_being_visited: string
          department: string
          purpose: string
          check_in_at?: string
          check_out_at?: string | null
          duration?: number | null
          status?: 'checked_in' | 'checked_out'
          qr_code_identifier?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          visitor_id?: string
          visit_reference?: string
          person_being_visited?: string
          department?: string
          purpose?: string
          check_in_at?: string
          check_out_at?: string | null
          duration?: number | null
          status?: 'checked_in' | 'checked_out'
          qr_code_identifier?: string
          created_at?: string
          updated_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'reception' | 'security'
      visit_status: 'checked_in' | 'checked_out'
    }
  }
}

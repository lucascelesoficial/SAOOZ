export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type IncomeType =
  | 'salario'
  | 'freela'
  | 'negocio'
  | 'aluguel'
  | 'investimento'
  | 'pensao'
  | 'outro'

export type ExpenseCategory =
  | 'moradia'
  | 'alimentacao'
  | 'transporte'
  | 'saude'
  | 'educacao'
  | 'lazer'
  | 'assinaturas'
  | 'vestuario'
  | 'beleza'
  | 'pets'
  | 'dividas'
  | 'investimentos'
  | 'familia'
  | 'religiao'
  | 'variaveis'
  | 'outros'

export type UserMode = 'pf' | 'pj' | 'both'

export type BusinessTaxRegime = 'mei' | 'simples' | 'presumido' | 'real'
export type BusinessActivity = 'servico' | 'comercio' | 'industria' | 'misto'

export type BusinessRevCategory =
  | 'servico'
  | 'produto'
  | 'recorrente'
  | 'comissao'
  | 'outro'

export type BusinessExpCategory =
  | 'fixo_aluguel'
  | 'fixo_salarios'
  | 'fixo_prolabore'
  | 'fixo_contador'
  | 'fixo_software'
  | 'fixo_internet'
  | 'fixo_outros'
  | 'variavel_comissao'
  | 'variavel_frete'
  | 'variavel_embalagem'
  | 'variavel_trafego'
  | 'variavel_taxas'
  | 'variavel_outros'
  | 'operacional_marketing'
  | 'operacional_admin'
  | 'operacional_juridico'
  | 'operacional_manutencao'
  | 'operacional_viagem'
  | 'operacional_outros'
  | 'investimento_equipamento'
  | 'investimento_estoque'
  | 'investimento_expansao'
  | 'investimento_contratacao'
  | 'investimento_outros'

export type SubscriptionPlanType = 'pf' | 'pj' | 'pro'
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled'
export type PaymentMethod = 'card' | 'pix'
export type SubscriptionPaymentMethod = PaymentMethod | 'none'
export type BillingGateway = 'stripe' | 'kiwify' | 'cakto'
export type AuditActorType = 'user' | 'system' | 'ai'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          avatar_url: string | null
          mode: UserMode | null
          active_business_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          avatar_url?: string | null
          mode?: UserMode | null
          active_business_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          avatar_url?: string | null
          mode?: UserMode | null
          active_business_id?: string | null
          created_at?: string
        }
        Relationships: []
      }

      income_sources: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          type: IncomeType
          active: boolean
          month: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          type: IncomeType
          active?: boolean
          month: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          type?: IncomeType
          active?: boolean
          month?: string
          created_at?: string
        }
        Relationships: []
      }

      expenses: {
        Row: {
          id: string
          user_id: string
          category: ExpenseCategory
          description: string | null
          amount: number
          month: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: ExpenseCategory
          description?: string | null
          amount: number
          month: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: ExpenseCategory
          description?: string | null
          amount?: number
          month?: string
          created_at?: string
        }
        Relationships: []
      }

      budgets: {
        Row: {
          id: string
          user_id: string
          month: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      budget_categories: {
        Row: {
          id: string
          budget_id: string
          category: ExpenseCategory
          planned_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          budget_id: string
          category: ExpenseCategory
          planned_amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          budget_id?: string
          category?: ExpenseCategory
          planned_amount?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      business_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          cnpj: string | null
          tax_regime: BusinessTaxRegime
          activity: BusinessActivity
          description: string | null
          city: string | null
          state: string | null
          founded_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          cnpj?: string | null
          tax_regime?: BusinessTaxRegime
          activity?: BusinessActivity
          description?: string | null
          city?: string | null
          state?: string | null
          founded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          cnpj?: string | null
          tax_regime?: BusinessTaxRegime
          activity?: BusinessActivity
          description?: string | null
          city?: string | null
          state?: string | null
          founded_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }

      business_revenues: {
        Row: {
          id: string
          user_id: string
          business_id: string
          description: string | null
          amount: number
          month: string
          category: BusinessRevCategory
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_id: string
          description?: string | null
          amount: number
          month: string
          category?: BusinessRevCategory
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_id?: string
          description?: string | null
          amount?: number
          month?: string
          category?: BusinessRevCategory
          created_at?: string
        }
        Relationships: []
      }

      business_expenses: {
        Row: {
          id: string
          user_id: string
          business_id: string
          description: string | null
          amount: number
          month: string
          category: BusinessExpCategory
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_id: string
          description?: string | null
          amount: number
          month: string
          category?: BusinessExpCategory
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_id?: string
          description?: string | null
          amount?: number
          month?: string
          category?: BusinessExpCategory
          created_at?: string
        }
        Relationships: []
      }

      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_type: SubscriptionPlanType
          status: SubscriptionStatus
          trial_ends_at: string | null
          current_period_end: string | null
          billing_duration_months: number
          payment_method: SubscriptionPaymentMethod
          gateway: BillingGateway | null
          gateway_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type: SubscriptionPlanType
          status: SubscriptionStatus
          trial_ends_at?: string | null
          current_period_end?: string | null
          billing_duration_months?: number
          payment_method?: SubscriptionPaymentMethod
          gateway?: BillingGateway | null
          gateway_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: SubscriptionPlanType
          status?: SubscriptionStatus
          trial_ends_at?: string | null
          current_period_end?: string | null
          billing_duration_months?: number
          payment_method?: SubscriptionPaymentMethod
          gateway?: BillingGateway | null
          gateway_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      payments: {
        Row: {
          id: string
          user_id: string
          subscription_id: string
          amount: number
          status: 'pending' | 'paid' | 'failed'
          payment_method: PaymentMethod
          gateway: BillingGateway | null
          gateway_payment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id: string
          amount: number
          status: 'pending' | 'paid' | 'failed'
          payment_method: PaymentMethod
          gateway?: BillingGateway | null
          gateway_payment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string
          amount?: number
          status?: 'pending' | 'paid' | 'failed'
          payment_method?: PaymentMethod
          gateway?: BillingGateway | null
          gateway_payment_id?: string | null
          created_at?: string
        }
        Relationships: []
      }

      usage_limits: {
        Row: {
          user_id: string
          transactions_used: number
          ai_actions_used: number
          reset_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          transactions_used?: number
          ai_actions_used?: number
          reset_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          transactions_used?: number
          ai_actions_used?: number
          reset_date?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          actor_type: AuditActorType
          action_type: string
          resource_type: string
          resource_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          actor_type: AuditActorType
          action_type: string
          resource_type: string
          resource_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          actor_type?: AuditActorType
          action_type?: string
          resource_type?: string
          resource_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }

      waitlist: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      replace_monthly_expenses: {
        Args: {
          p_month: string
          p_items: Json
        }
        Returns: undefined
      }
      upsert_monthly_budget: {
        Args: {
          p_month: string
          p_items: Json
        }
        Returns: string
      }
    }
    Enums: {
      income_type: IncomeType
      expense_category: ExpenseCategory
      business_tax_regime: BusinessTaxRegime
      business_activity: BusinessActivity
      business_rev_category: BusinessRevCategory
      business_exp_category: BusinessExpCategory
    }
    CompositeTypes: Record<string, never>
  }
}

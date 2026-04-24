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
export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'expired'
  | 'inactive'
export type PaymentMethod = 'card' | 'pix'
export type SubscriptionPaymentMethod = PaymentMethod | 'none'
export type BillingGateway = 'stripe' | 'kiwify' | 'cakto'
export type AuditActorType = 'user' | 'system' | 'ai'
export type FinancialModuleScope = 'personal' | 'business'
export type ReserveEntryType = 'aporte' | 'resgate' | 'ajuste'
export type CreditCardTransactionType =
  | 'compra'
  | 'pagamento'
  | 'tarifa'
  | 'juros'
  | 'estorno'
  | 'ajuste'
export type InvestmentAccountType = 'corretora' | 'banco' | 'previdencia' | 'cripto' | 'outra'
export type InvestmentAssetType =
  | 'acao'
  | 'fii'
  | 'etf'
  | 'renda_fixa'
  | 'cripto'
  | 'fundo'
  | 'internacional'
  | 'outro'
export type InvestmentMovementType =
  | 'compra'
  | 'venda'
  | 'dividendo'
  | 'juros'
  | 'aporte'
  | 'resgate'
  | 'taxa'
  | 'ajuste'
export type CounterpartyType = 'fornecedor' | 'cliente' | 'ambos'
export type BusinessRevenueStatus = 'pending' | 'received' | 'overdue' | 'canceled'
export type BusinessExpenseStatus = 'pending' | 'paid' | 'overdue' | 'canceled'
export type PfExpenseStatus = 'pending' | 'paid' | 'overdue'
export type EmployeeStatus = 'active' | 'on_leave' | 'terminated'

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
          cpf: string | null
          phone: string | null
          birth_date: string | null
          city: string | null
          state: string | null
          onboarding_completed_at: string | null
        }
        Insert: {
          id: string
          name: string
          email: string
          avatar_url?: string | null
          mode?: UserMode | null
          active_business_id?: string | null
          created_at?: string
          cpf?: string | null
          phone?: string | null
          birth_date?: string | null
          city?: string | null
          state?: string | null
          onboarding_completed_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          avatar_url?: string | null
          mode?: UserMode | null
          active_business_id?: string | null
          created_at?: string
          cpf?: string | null
          phone?: string | null
          birth_date?: string | null
          city?: string | null
          state?: string | null
          onboarding_completed_at?: string | null
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
          is_recurring: boolean
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
          is_recurring?: boolean
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
          is_recurring?: boolean
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
          status: PfExpenseStatus
          due_date: string | null
          paid_at: string | null
          is_recurring: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: ExpenseCategory
          description?: string | null
          amount: number
          month: string
          status?: PfExpenseStatus
          due_date?: string | null
          paid_at?: string | null
          is_recurring?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: ExpenseCategory
          description?: string | null
          amount?: number
          month?: string
          status?: PfExpenseStatus
          due_date?: string | null
          paid_at?: string | null
          is_recurring?: boolean
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

      business_budgets: {
        Row: {
          id: string
          business_id: string
          month: string
          category: string
          planned_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          month: string
          category: string
          planned_amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          month?: string
          category?: string
          planned_amount?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      business_team_members: {
        Row: {
          id: string
          business_id: string
          owner_user_id: string
          member_email: string
          member_user_id: string | null
          status: 'pending' | 'active' | 'revoked'
          permissions: {
            view: boolean
            add_transactions: boolean
            edit_transactions: boolean
            delete_transactions: boolean
            export_reports: boolean
          }
          invited_at: string
          accepted_at: string | null
        }
        Insert: {
          id?: string
          business_id: string
          owner_user_id: string
          member_email: string
          member_user_id?: string | null
          status?: 'pending' | 'active' | 'revoked'
          permissions?: Record<string, boolean>
          invited_at?: string
          accepted_at?: string | null
        }
        Update: {
          status?: 'pending' | 'active' | 'revoked'
          member_user_id?: string | null
          permissions?: Record<string, boolean>
          accepted_at?: string | null
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
          deleted_at: string | null
          deleted_by: string | null
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
          deleted_at?: string | null
          deleted_by?: string | null
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
          deleted_at?: string | null
          deleted_by?: string | null
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
          status: BusinessRevenueStatus
          due_date: string | null
          closing_date: string | null
          paid_at: string | null
          counterparty_id: string | null
          is_recurring: boolean
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
          status?: BusinessRevenueStatus
          due_date?: string | null
          closing_date?: string | null
          paid_at?: string | null
          counterparty_id?: string | null
          is_recurring?: boolean
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
          status?: BusinessRevenueStatus
          due_date?: string | null
          closing_date?: string | null
          paid_at?: string | null
          counterparty_id?: string | null
          is_recurring?: boolean
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
          status: BusinessExpenseStatus
          due_date: string | null
          paid_at: string | null
          counterparty_id: string | null
          is_recurring: boolean
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
          status?: BusinessExpenseStatus
          due_date?: string | null
          paid_at?: string | null
          counterparty_id?: string | null
          is_recurring?: boolean
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
          status?: BusinessExpenseStatus
          due_date?: string | null
          paid_at?: string | null
          counterparty_id?: string | null
          is_recurring?: boolean
          created_at?: string
        }
        Relationships: []
      }

      financial_reserves: {
        Row: {
          id: string
          user_id: string
          scope: FinancialModuleScope
          business_id: string | null
          name: string
          target_amount: number
          initial_amount: number
          monthly_target_contribution: number | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          scope: FinancialModuleScope
          business_id?: string | null
          name?: string
          target_amount?: number
          initial_amount?: number
          monthly_target_contribution?: number | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          scope?: FinancialModuleScope
          business_id?: string | null
          name?: string
          target_amount?: number
          initial_amount?: number
          monthly_target_contribution?: number | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      financial_reserve_entries: {
        Row: {
          id: string
          reserve_id: string
          user_id: string
          scope: FinancialModuleScope
          business_id: string | null
          entry_type: ReserveEntryType
          amount: number
          happened_on: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          reserve_id: string
          user_id: string
          scope: FinancialModuleScope
          business_id?: string | null
          entry_type: ReserveEntryType
          amount: number
          happened_on?: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          reserve_id?: string
          user_id?: string
          scope?: FinancialModuleScope
          business_id?: string | null
          entry_type?: ReserveEntryType
          amount?: number
          happened_on?: string
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }

      credit_cards: {
        Row: {
          id: string
          user_id: string
          scope: FinancialModuleScope
          business_id: string | null
          name: string
          issuer: string | null
          brand: string | null
          last_four: string | null
          credit_limit: number | null
          closing_day: number | null
          due_day: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          scope: FinancialModuleScope
          business_id?: string | null
          name: string
          issuer?: string | null
          brand?: string | null
          last_four?: string | null
          credit_limit?: number | null
          closing_day?: number | null
          due_day?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          scope?: FinancialModuleScope
          business_id?: string | null
          name?: string
          issuer?: string | null
          brand?: string | null
          last_four?: string | null
          credit_limit?: number | null
          closing_day?: number | null
          due_day?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      credit_card_transactions: {
        Row: {
          id: string
          card_id: string
          user_id: string
          scope: FinancialModuleScope
          business_id: string | null
          transaction_type: CreditCardTransactionType
          description: string
          amount: number
          installment_total: number
          installment_number: number
          occurred_on: string
          posted_month: string
          created_at: string
        }
        Insert: {
          id?: string
          card_id: string
          user_id: string
          scope: FinancialModuleScope
          business_id?: string | null
          transaction_type?: CreditCardTransactionType
          description: string
          amount: number
          installment_total?: number
          installment_number?: number
          occurred_on?: string
          posted_month?: string
          created_at?: string
        }
        Update: {
          id?: string
          card_id?: string
          user_id?: string
          scope?: FinancialModuleScope
          business_id?: string | null
          transaction_type?: CreditCardTransactionType
          description?: string
          amount?: number
          installment_total?: number
          installment_number?: number
          occurred_on?: string
          posted_month?: string
          created_at?: string
        }
        Relationships: []
      }

      investment_accounts: {
        Row: {
          id: string
          user_id: string
          scope: FinancialModuleScope
          business_id: string | null
          name: string
          institution: string | null
          account_type: InvestmentAccountType
          currency: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          scope: FinancialModuleScope
          business_id?: string | null
          name: string
          institution?: string | null
          account_type?: InvestmentAccountType
          currency?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          scope?: FinancialModuleScope
          business_id?: string | null
          name?: string
          institution?: string | null
          account_type?: InvestmentAccountType
          currency?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      investment_assets: {
        Row: {
          id: string
          account_id: string
          user_id: string
          scope: FinancialModuleScope
          business_id: string | null
          symbol: string
          name: string | null
          asset_type: InvestmentAssetType
          quantity: number
          average_price: number
          target_allocation_pct: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          account_id: string
          user_id: string
          scope: FinancialModuleScope
          business_id?: string | null
          symbol: string
          name?: string | null
          asset_type?: InvestmentAssetType
          quantity?: number
          average_price?: number
          target_allocation_pct?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          user_id?: string
          scope?: FinancialModuleScope
          business_id?: string | null
          symbol?: string
          name?: string | null
          asset_type?: InvestmentAssetType
          quantity?: number
          average_price?: number
          target_allocation_pct?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      investment_movements: {
        Row: {
          id: string
          account_id: string
          asset_id: string | null
          user_id: string
          scope: FinancialModuleScope
          business_id: string | null
          movement_type: InvestmentMovementType
          amount: number
          quantity: number | null
          unit_price: number | null
          occurred_on: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          account_id: string
          asset_id?: string | null
          user_id: string
          scope: FinancialModuleScope
          business_id?: string | null
          movement_type: InvestmentMovementType
          amount: number
          quantity?: number | null
          unit_price?: number | null
          occurred_on?: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          asset_id?: string | null
          user_id?: string
          scope?: FinancialModuleScope
          business_id?: string | null
          movement_type?: InvestmentMovementType
          amount?: number
          quantity?: number | null
          unit_price?: number | null
          occurred_on?: string
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }

      business_employees: {
        Row: {
          id: string
          user_id: string
          business_id: string
          name: string
          cpf: string | null
          role: string | null
          monthly_salary: number
          hire_date: string | null
          termination_date: string | null
          status: EmployeeStatus
          email: string | null
          phone: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_id: string
          name: string
          cpf?: string | null
          role?: string | null
          monthly_salary?: number
          hire_date?: string | null
          termination_date?: string | null
          status?: EmployeeStatus
          email?: string | null
          phone?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_id?: string
          name?: string
          cpf?: string | null
          role?: string | null
          monthly_salary?: number
          hire_date?: string | null
          termination_date?: string | null
          status?: EmployeeStatus
          email?: string | null
          phone?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      business_counterparties: {
        Row: {
          id: string
          user_id: string
          business_id: string
          type: CounterpartyType
          name: string
          legal_name: string | null
          document: string | null
          email: string | null
          phone: string | null
          city: string | null
          state: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_id: string
          type?: CounterpartyType
          name: string
          legal_name?: string | null
          document?: string | null
          email?: string | null
          phone?: string | null
          city?: string | null
          state?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_id?: string
          type?: CounterpartyType
          name?: string
          legal_name?: string | null
          document?: string | null
          email?: string | null
          phone?: string | null
          city?: string | null
          state?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
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
          gateway_customer_id: string | null
          gateway_event_id: string | null
          gateway_subscription_id: string | null
          started_at: string | null
          canceled_at: string | null
          cancel_at_period_end: boolean
          ended_at: string | null
          last_billing_error: string | null
          provider_reference: string | null
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
          gateway_customer_id?: string | null
          gateway_event_id?: string | null
          gateway_subscription_id?: string | null
          started_at?: string | null
          canceled_at?: string | null
          cancel_at_period_end?: boolean
          ended_at?: string | null
          last_billing_error?: string | null
          provider_reference?: string | null
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
          gateway_customer_id?: string | null
          gateway_event_id?: string | null
          gateway_subscription_id?: string | null
          started_at?: string | null
          canceled_at?: string | null
          cancel_at_period_end?: boolean
          ended_at?: string | null
          last_billing_error?: string | null
          provider_reference?: string | null
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
          currency: string
          paid_at: string | null
          failed_at: string | null
          failure_reason: string | null
          provider_event_id: string | null
          raw_reference: string | null
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
          currency?: string
          paid_at?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          provider_event_id?: string | null
          raw_reference?: string | null
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
          currency?: string
          paid_at?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          provider_event_id?: string | null
          raw_reference?: string | null
          created_at?: string
        }
        Relationships: []
      }

      billing_webhook_events: {
        Row: {
          id: string
          provider: string
          event_id: string | null
          event_type: string | null
          event_status: string
          payload: Json
          received_at: string
          processed_at: string | null
          error_message: string | null
          related_user_id: string | null
          related_subscription_id: string | null
        }
        Insert: {
          id?: string
          provider: string
          event_id?: string | null
          event_type?: string | null
          event_status?: string
          payload: Json
          received_at?: string
          processed_at?: string | null
          error_message?: string | null
          related_user_id?: string | null
          related_subscription_id?: string | null
        }
        Update: {
          id?: string
          provider?: string
          event_id?: string | null
          event_type?: string | null
          event_status?: string
          payload?: Json
          received_at?: string
          processed_at?: string | null
          error_message?: string | null
          related_user_id?: string | null
          related_subscription_id?: string | null
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

      rate_limit_buckets: {
        Row: {
          key: string
          count: number
          reset_at: string
          updated_at: string
        }
        Insert: {
          key: string
          count?: number
          reset_at: string
          updated_at?: string
        }
        Update: {
          key?: string
          count?: number
          reset_at?: string
          updated_at?: string
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
      financial_module_scope: FinancialModuleScope
      reserve_entry_type: ReserveEntryType
      credit_card_transaction_type: CreditCardTransactionType
      investment_account_type: InvestmentAccountType
      investment_asset_type: InvestmentAssetType
      investment_movement_type: InvestmentMovementType
      counterparty_type: CounterpartyType
    }
    CompositeTypes: Record<string, never>
  }
}

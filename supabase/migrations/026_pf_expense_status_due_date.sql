-- Migration: Add status and due_date to PF expenses
-- Adds payment status (pending/paid/overdue) and due date to personal expense entries

-- 1. New enum for PF expense payment status
create type pf_expense_status as enum ('pending', 'paid', 'overdue');

-- 2. Add columns to expenses table
alter table expenses
  add column status pf_expense_status not null default 'paid',
  add column due_date date null,
  add column paid_at timestamptz null;

-- 3. Index for filtering by status quickly
create index expenses_status_idx on expenses (user_id, status, month);
create index expenses_due_date_idx on expenses (due_date) where due_date is not null;

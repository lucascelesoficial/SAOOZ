# SAOOZ — Launch Closing Master Plan

Status: locked scope for launch-closing sprint  
Date: 2026-04-11  
Owner: Engineering / Product Architecture

## Objective
Finalize SAOOZ for launch readiness in a production-minded sprint, using the existing codebase and avoiding overengineering.

## Product Constraints (Locked)
- Keep existing architecture and stack.
- No full redesign.
- No speculative enterprise abstractions.
- Focus on reliability, clarity, performance, and monetization readiness.
- Prices and billing cycles already exist; do not redefine price table.

## Scope Locked by Phase

### Phase 1 — Global Naming and Product Language Cleanup
Goal: premium and consistent pt-BR language across product.

Work:
- Standardize labels:
  - `Conta e Plano` -> `Planos`
  - `Conta` -> `Configurações`
  - PF `Orçamento` -> `Despesas` (UI-facing references, if still present)
- Normalize text in sidebar, topbar, page titles, section headers, buttons, empty states, helper texts.
- Fix pt-BR orthography and accentuation issues.
- Replace weak/awkward copy with concise operational copy.

Acceptance:
- No conflicting naming across PF/PJ.
- No obvious malformed pt-BR copy in critical flows.

---

### Phase 2 — PF Despesas Flow Stabilization
Goal: end-to-end persistence and predictable feedback in PF Despesas.

Work:
- Validate form state, submit flow, persistence, and refresh behavior.
- Ensure no silent failures.
- Keep separation:
  - real financial transactions
  - planning/budget data (if internal support remains)
- If schema mismatch exists, align code with real DB state and document migration dependency.

Acceptance:
- Save works reliably.
- Data is visible after save/reload.
- Error and success feedback are clear.

---

### Phase 3 — PF and PJ Inteligência Refinement
Goal: intelligence pages must be decision-oriented and not dashboard clones.

PF required focus:
- Variação de gastos por categoria.
- Categoria com maior crescimento.
- Atual vs período anterior.
- Projeção simples até fim do mês.
- Bloco: `O que merece sua atenção agora`.

PJ required focus:
- Receita vs despesa.
- Impacto estimado de impostos.
- Resultado/lucro claro.
- Concentração de custos.
- Bloco: `O que merece sua atenção agora`.

Acceptance:
- Both pages add actionable value beyond central dashboard.
- No heavy analytics engine added.

---

### Phase 4 — Configurações Must Be Real
Goal: settings area fully operational.

Work:
- Rename `Conta` -> `Configurações`.
- Fix avatar flow:
  - upload, persistence, refresh consistency, and rendering in all relevant surfaces.
- Fix delete-account flow:
  - real backend action, safe confirmation, clear feedback.
- Remove decorative dead-end controls from settings.

Acceptance:
- Avatar persists across refresh and contexts.
- Account deletion works safely and intentionally.
- No fake controls in settings.

---

### Phase 5 — Planos Area Refinement
Goal: premium subscription UX without leaking implementation details.

Work:
- Standardize section naming to `Planos`.
- Remove provider/infrastructure wording from user-facing copy (gateway names, platform internals).
- Keep user-facing focus:
  - current plan
  - cycle
  - inclusions
  - trial/subscription status
  - upgrade path

Acceptance:
- Clean subscription UX.
- No irrelevant backend/provider wording in UI.

---

### Phase 6 — PJ Multi-Business (Pragmatic)
Goal: one user can operate multiple business accounts without enterprise overbuild.

Work:
- Establish/finalize `business_accounts` model:
  - `id`, `user_id`, `name`, `legal_name`, `cnpj`, `tax_regime`, `business_type`, timestamps.
- Scope PJ data by active business account:
  - revenue, expenses, taxes/settings, intelligence, AI context if needed.
- Add active-business selection behavior:
  - single account: direct open
  - multiple: explicit selector
- Add `Nova conta empresarial` flow.
- Preserve backwards compatibility for existing PJ users/data.

Acceptance:
- Multiple accounts per user work.
- Data isolation by active business account is consistent.

---

### Phase 7 — Plan Differentiation via Business Account Limits
Goal: PF/PJ/PRO differ by operational capability, not only copy.

Rules:
- PF: no business account access.
- PJ:
  - monthly: 1 business account
  - quarterly: 1
  - semiannual: 2
  - annual: 3
- PRO:
  - monthly: PF + 1 business account
  - quarterly: PF + 2
  - semiannual: PF + 3
  - annual: PF + 5

Work:
- Finalize capability mapping by plan + cycle.
- Enforce business account creation limits.
- Show clean upgrade guidance on limit hit.
- Communicate PF/PJ/PRO differences clearly.

Acceptance:
- Limit enforcement works in account creation flow.
- PRO appears as flagship with clear operational advantage.

---

### Phase 8 — Performance Closing Pass
Goal: improve perceived speed in launch-critical navigation.

Work:
- Reduce duplicate fetches across tabs and section switches.
- Stabilize selected month state behavior.
- Avoid blocking UI on repeated same-context reads.
- Prioritize above-the-fold data rendering.
- Apply pragmatic optimizations only (shared loaders, memoization, route/data caching where useful).

Acceptance:
- Noticeably faster tab/navigation response.
- Reduced repeated reads and loading churn.

---

### Phase 9 — Final Product Consistency Pass
Goal: cohesive premium product across PF, PJ, Assistente, Planos, Configurações.

Work:
- Polish PF Central copy.
- Normalize headings/subtitles style across PF/PJ pages.
- Standardize buttons/labels.
- Remove dead-end UI actions.

Acceptance:
- Product feels coherent end-to-end.
- No obvious ornamental/broken interactions.

---

### Phase 10 — Delivery Format (Execution Output)
For each phase in execution:
- What changed.
- Required migration/schema changes.
- Strictly necessary env/deploy note.
- Explicit post-launch deferred items.

## Migration/Schema Dependencies (Launch)
- Confirm `budgets` and related function state in real environment.
- Confirm/finalize `business_accounts` and backward-compatible links for existing PJ data.
- Confirm capability mapping persistence layer for plan/cycle entitlements.

## Non-Goals (Deferred)
- Full team/roles RBAC and enterprise tenancy.
- Heavy forecasting pipelines.
- Open Finance integrations.
- Full backoffice/admin suite.
- Advanced observability platform.
- Final payment gateway deep integration.

## Execution Order (Strict)
1. Phase 1
2. Phase 2
3. Phase 3
4. Phase 4
5. Phase 5
6. Phase 6
7. Phase 7
8. Phase 8
9. Phase 9
10. Phase 10 report packaging

## Quality Gate Before Go-Live
- Critical flows tested manually in PF and PJ.
- No launch-blocking runtime errors in core pages.
- Plan boundaries enforce correctly.
- Avatar and account deletion flows are real.
- Copy and naming consistency pass complete.


export const MODULE_SCOPES = ['personal', 'business'] as const

export type ModuleScope = (typeof MODULE_SCOPES)[number]

export const MODULE_SCOPE_LABEL: Record<ModuleScope, string> = {
  personal: 'PF',
  business: 'PJ',
}

export const MODULE_SCOPE_TITLE: Record<ModuleScope, string> = {
  personal: 'Pessoal',
  business: 'Empresarial',
}

const MODULE_SCOPE_ROOT: Record<ModuleScope, string> = {
  personal: '/central',
  business: '/empresa',
}

export function resolveModuleScopeFromPathname(pathname: string | null | undefined): ModuleScope {
  if (!pathname) {
    return 'personal'
  }

  return pathname === '/empresa' || pathname.startsWith('/empresa/') ? 'business' : 'personal'
}

export function getModuleScopeRoot(scope: ModuleScope): string {
  return MODULE_SCOPE_ROOT[scope]
}

export function isScopePath(pathname: string | null | undefined, scope: ModuleScope): boolean {
  return resolveModuleScopeFromPathname(pathname) === scope
}

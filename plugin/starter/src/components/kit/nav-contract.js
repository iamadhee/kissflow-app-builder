// Shared by preview/deploy compilation and the starter's prebuild check.
export function canonicalNavRoles(nav, schema) {
  const identities = new Map();
  const key = value => String(value ?? '').trim().toLowerCase();
  for (const role of schema.roles || []) {
    for (const alias of [role.id, role.name, ...(role.aliases || [])]) {
      if (!key(alias)) continue;
      const names = identities.get(key(alias)) || new Set();
      names.add(role.name); identities.set(key(alias), names);
    }
  }
  return nav.map(menu => ({ ...menu, items: (menu.items || []).map(item => ({ ...item,
    roles: [...new Set((item.roles || []).map(role => {
      const names = identities.get(key(role));
      return names?.size === 1 ? [...names][0] : role;
    }))],
  })) }));
}

export function navigationFindings(nav, schema) {
  const items = canonicalNavRoles(nav, schema).flatMap(menu => menu.items);
  const roles = (schema.roles || []).map(role => role.name).filter(Boolean);
  const visible = role => items.filter(item => !item.roles.length || item.roles.includes(role));
  const findings = [];
  const fail = (kind, msg, fix) => findings.push({ level: 'error', kind, code: kind, msg, message: msg, fix });
  for (const role of roles.length ? roles : [null]) {
    const seen = new Map(), shown = role ? visible(role) : items;
    if (role && !shown.length) fail('NAV_ROLE_NO_LANDING', `role "${role}" can see no nav item — it opens the app to an empty shell`,
      'Add a real landing gated to this schema role; never ungate another role’s page.');
    for (const item of shown) {
      const label = String(item.label || '').trim().toLowerCase();
      if (!label) continue;
      if (seen.has(label)) fail('NAV_DUPLICATE_LABEL', `"${role || 'Navigation'}" sees two items labelled "${item.label}" (${seen.get(label)} and ${item.to || item.page})`,
        'Use distinct task-specific labels without changing role access.');
      seen.set(label, item.to || item.page);
    }
  }
  if (roles.length > 1 && items.some(item => item.roles.length)) {
    const landings = roles.map(role => visible(role)[0]).filter(Boolean);
    if (landings.length === roles.length && new Set(landings.map(item => String(item.label || '').trim().toLowerCase())).size === 1)
      fail('NAV_INDISTINCT_LANDINGS', `every role's first nav item is labelled "${landings[0].label}" — switching role changes nothing visible in the sidebar`,
        'Preserve each role’s designed task-specific landing.');
  }
  return findings;
}

export function compileNavigation(nav, schema) {
  const normalized = canonicalNavRoles(nav, schema);
  const findings = navigationFindings(normalized, schema);
  if (findings.length) {
    const error = new Error(findings.map(f => `${f.kind}: ${f.msg}`).join('; '));
    error.findings = findings; throw error;
  }
  return normalized;
}

export function homePathForRole(role) {
  if (role === 'tenant') return '/tenant';
  if (role === 'manager') return '/manager';
  return '/';
}

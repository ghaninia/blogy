import { Role } from '../../db/index.js';

export function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

const STAFF_ROLES: Role[] = [Role.ADMIN, Role.EDITOR, Role.AUTHOR];
const EDITOR_ROLES: Role[] = [Role.ADMIN, Role.EDITOR];

export function isStaffRole(role: Role): boolean {
  return STAFF_ROLES.includes(role);
}

export function isEditorRole(role: Role): boolean {
  return EDITOR_ROLES.includes(role);
}

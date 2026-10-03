import type { Dashboard, Profile } from './types';

export const SETUP_STORAGE_KEY = 'linea:setup-completed:v1';
export function profileSetupId(profile: Profile): string {
  return `${profile.owner_id}:${profile.id}`;
}
/** Existing live profiles are already configured. Seeded demo data must still
 * pass through first-use setup; a completion marker contains no profile details.
 */
export function requiresSetup(data: Dashboard, completedId: string | null): boolean {
  return !data.profile || (data.mode === 'demo' && completedId !== profileSetupId(data.profile));
}

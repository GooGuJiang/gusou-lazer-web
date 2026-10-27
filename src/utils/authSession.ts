import type { User } from '../types';

const SESSION_ENDPOINT = '/api/auth/session';

export const syncServerAuthSession = async (accessToken: string): Promise<User | null> => {
  try {
    const response = await fetch(SESSION_ENDPOINT, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = (await response.json()) as { user?: User };
    return payload.user ?? null;
  } catch (error) {
    console.warn('Failed to synchronize the server auth session:', error);
    return null;
  }
};

export const clearServerAuthSession = async (): Promise<void> => {
  try {
    await fetch(SESSION_ENDPOINT, { method: 'DELETE', credentials: 'same-origin' });
  } catch (error) {
    console.warn('Failed to clear the server auth session:', error);
  }
};

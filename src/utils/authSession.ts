const SESSION_ENDPOINT = '/api/auth/session';

export const syncServerAuthSession = async (accessToken: string): Promise<void> => {
  try {
    const response = await fetch(SESSION_ENDPOINT, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.warn('Failed to synchronize the server auth session:', error);
  }
};

export const clearServerAuthSession = async (): Promise<void> => {
  try {
    await fetch(SESSION_ENDPOINT, { method: 'DELETE', credentials: 'same-origin' });
  } catch (error) {
    console.warn('Failed to clear the server auth session:', error);
  }
};

import { useState, useEffect, useCallback } from 'react';
import { preferencesAPI } from '../utils/api';
import type { UserPreferences } from '../types';
import toast from 'react-hot-toast';

/**
 * Hook for managing user preferences
 * Provides preferences state and methods to update individual preferences
 */
export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await preferencesAPI.getPreferences();
      setPreferences(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load preferences');
      setError(error);
      console.error('Failed to load preferences:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update a single preference field
   * @param key - The preference key to update
   * @param value - The new value for the preference
   * @param showToast - Whether to show a toast notification (default: false)
   */
  const updatePreference = useCallback(async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
    showToast: boolean = false
  ) => {
    try {
      // Optimistically update the local state
      setPreferences(prev => ({ ...prev, [key]: value }));
      
      // Send update to server
      await preferencesAPI.updatePreferences({ [key]: value });
      
      if (showToast) {
        toast.success('Preference updated successfully');
      }
    } catch (err) {
      console.error(`Failed to update ${String(key)}:`, err);
      
      // Revert the optimistic update on error
      await loadPreferences();
      
      if (showToast) {
        toast.error('Failed to update preference');
      }
      throw err;
    }
  }, []);

  /**
   * Update multiple preferences at once
   * @param updates - Object containing multiple preference updates
   * @param showToast - Whether to show a toast notification (default: false)
   */
  const updatePreferences = useCallback(async (
    updates: Partial<UserPreferences>,
    showToast: boolean = false
  ) => {
    try {
      // Optimistically update the local state
      setPreferences(prev => ({ ...prev, ...updates }));
      
      // Send update to server
      await preferencesAPI.updatePreferences(updates);
      
      if (showToast) {
        toast.success('Preferences updated successfully');
      }
    } catch (err) {
      console.error('Failed to update preferences:', err);
      
      // Revert the optimistic update on error
      await loadPreferences();
      
      if (showToast) {
        toast.error('Failed to update preferences');
      }
      throw err;
    }
  }, []);

  /**
   * Refresh preferences from the server
   */
  const refreshPreferences = useCallback(async () => {
    await loadPreferences();
  }, []);

  return {
    preferences,
    isLoading,
    error,
    updatePreference,
    updatePreferences,
    refreshPreferences,
  };
};


import { useState } from 'react';
import { showSuccess, showError } from '@/utils/toast';

export const usePreferences = () => {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    courseUpdates: true,
    marketingEmails: false,
    weeklyDigest: true,
    language: 'en',
    timezone: 'UTC'
  });

  const handlePreferenceChange = (field: string, value: string | boolean) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePreferences = async () => {
    try {
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      showSuccess('Preferences saved successfully!');
    } catch (error) {
      showError('Failed to save preferences');
    }
  };

  return {
    preferences,
    handlePreferenceChange,
    handleSavePreferences
  };
};
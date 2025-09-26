import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { showSuccess, showError } from '@/utils/toast';

export const useProfileForm = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
    location: '',
    website: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, this would update the user in the auth context
      showSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      showError('Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      bio: '',
      location: '',
      website: ''
    });
    setIsEditing(false);
  };

  return {
    formData,
    isEditing,
    setIsEditing,
    handleInputChange,
    handleSaveProfile,
    handleCancelEdit
  };
};
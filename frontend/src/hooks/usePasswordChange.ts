import { useState } from 'react';
import { showSuccess, showError } from '@/utils/toast';

export const usePasswordChange = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError('Password must be at least 6 characters long');
      return;
    }

    try {
      // Mock password change
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      showError('Failed to change password');
    }
  };

  return {
    passwordData,
    showPassword,
    setShowPassword,
    handlePasswordChange,
    handleChangePassword
  };
};
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfileForm } from '@/hooks/useProfileForm';
import { usePasswordChange } from '@/hooks/usePasswordChange';
import { usePreferences } from '@/hooks/usePreferences';
import ProfileTab from '@/components/profile/ProfileTab';
import SecurityTab from '@/components/profile/SecurityTab';
import PreferencesTab from '@/components/profile/PreferencesTab';
import AccountTab from '@/components/profile/AccountTab';

const Profile: React.FC = () => {
  const { user } = useAuth();
  
  const {
    formData,
    isEditing,
    setIsEditing,
    handleInputChange,
    handleSaveProfile,
    handleCancelEdit
  } = useProfileForm();

  const {
    passwordData,
    showPassword,
    setShowPassword,
    handlePasswordChange,
    handleChangePassword
  } = usePasswordChange();

  const {
    preferences,
    handlePreferenceChange,
    handleSavePreferences
  } = usePreferences();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab
            user={user}
            formData={formData}
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing(!isEditing)}
            onInputChange={handleInputChange}
            onSave={handleSaveProfile}
            onCancel={handleCancelEdit}
          />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab
            passwordData={passwordData}
            showPassword={showPassword}
            onPasswordChange={handlePasswordChange}
            onTogglePasswordVisibility={() => setShowPassword(!showPassword)}
            onChangePassword={handleChangePassword}
          />
        </TabsContent>

        <TabsContent value="preferences">
          <PreferencesTab
            preferences={preferences}
            onPreferenceChange={handlePreferenceChange}
            onSavePreferences={handleSavePreferences}
          />
        </TabsContent>

        <TabsContent value="account">
          <AccountTab user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
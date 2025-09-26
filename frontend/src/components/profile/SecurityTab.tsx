import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import PasswordChangeForm from './PasswordChangeForm';

interface SecurityTabProps {
  passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  showPassword: boolean;
  onPasswordChange: (field: string, value: string) => void;
  onTogglePasswordVisibility: () => void;
  onChangePassword: () => void;
}

const SecurityTab: React.FC<SecurityTabProps> = ({
  passwordData,
  showPassword,
  onPasswordChange,
  onTogglePasswordVisibility,
  onChangePassword
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Manage your password and security preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <PasswordChangeForm
          passwordData={passwordData}
          showPassword={showPassword}
          onPasswordChange={onPasswordChange}
          onTogglePasswordVisibility={onTogglePasswordVisibility}
          onChangePassword={onChangePassword}
        />

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="outline">
              Enable 2FA
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityTab;
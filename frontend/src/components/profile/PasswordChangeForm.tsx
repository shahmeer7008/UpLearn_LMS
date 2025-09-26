import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordChangeFormProps {
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

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  passwordData,
  showPassword,
  onPasswordChange,
  onTogglePasswordVisibility,
  onChangePassword
}) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Change Password</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="currentPassword">Current Password</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showPassword ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) => onPasswordChange('currentPassword', e.target.value)}
              placeholder="Enter current password"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={onTogglePasswordVisibility}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div>
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => onPasswordChange('newPassword', e.target.value)}
            placeholder="Enter new password"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => onPasswordChange('confirmPassword', e.target.value)}
            placeholder="Confirm new password"
          />
        </div>
        <Button onClick={onChangePassword}>
          <Lock className="h-4 w-4 mr-2" />
          Change Password
        </Button>
      </div>
    </div>
  );
};

export default PasswordChangeForm;
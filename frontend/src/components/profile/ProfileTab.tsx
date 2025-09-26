import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ProfileHeader from './ProfileHeader';
import ProfileForm from './ProfileForm';
import { User } from '@/types';

interface ProfileTabProps {
  user: User;
  formData: {
    name: string;
    email: string;
    bio: string;
    location: string;
    website: string;
  };
  isEditing: boolean;
  onToggleEdit: () => void;
  onInputChange: (field: string, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  formData,
  isEditing,
  onToggleEdit,
  onInputChange,
  onSave,
  onCancel
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information and profile details
            </CardDescription>
          </div>
          <Button
            variant={isEditing ? "outline" : "default"}
            onClick={onToggleEdit}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProfileHeader user={user} isEditing={isEditing} />
        <Separator />
        <ProfileForm
          formData={formData}
          isEditing={isEditing}
          onInputChange={onInputChange}
          onSave={onSave}
          onCancel={onCancel}
        />
      </CardContent>
    </Card>
  );
};

export default ProfileTab;
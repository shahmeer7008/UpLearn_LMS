import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface ProfileFormProps {
  formData: {
    name: string;
    email: string;
    bio: string;
    location: string;
    website: string;
  };
  isEditing: boolean;
  onInputChange: (field: string, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  formData,
  isEditing,
  onInputChange,
  onSave,
  onCancel
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            disabled={!isEditing}
          />
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            disabled={!isEditing}
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => onInputChange('location', e.target.value)}
            disabled={!isEditing}
            placeholder="City, Country"
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => onInputChange('website', e.target.value)}
            disabled={!isEditing}
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => onInputChange('bio', e.target.value)}
          disabled={!isEditing}
          placeholder="Tell us about yourself..."
          rows={4}
        />
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileForm;
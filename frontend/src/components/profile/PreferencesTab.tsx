import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Save } from 'lucide-react';
import PreferenceToggle from './PreferenceToggle';

interface PreferencesTabProps {
  preferences: {
    emailNotifications: boolean;
    courseUpdates: boolean;
    marketingEmails: boolean;
    weeklyDigest: boolean;
    language: string;
    timezone: string;
  };
  onPreferenceChange: (field: string, value: string | boolean) => void;
  onSavePreferences: () => void;
}

const PreferencesTab: React.FC<PreferencesTabProps> = ({
  preferences,
  onPreferenceChange,
  onSavePreferences
}) => {
  const notificationPreferences = [
    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
    { key: 'courseUpdates', label: 'Course Updates', description: 'Get notified about course updates and announcements' },
    { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive promotional emails and offers' },
    { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Get a weekly summary of your activity' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Customize your experience and notification settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Notifications</h3>
          <div className="space-y-4">
            {notificationPreferences.map((pref) => (
              <PreferenceToggle
                key={pref.key}
                label={pref.label}
                description={pref.description}
                enabled={preferences[pref.key as keyof typeof preferences] as boolean}
                onToggle={() => onPreferenceChange(pref.key, !preferences[pref.key as keyof typeof preferences])}
              />
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4">Language & Region</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                value={preferences.language}
                onChange={(e) => onPreferenceChange('language', e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                value={preferences.timezone}
                onChange={(e) => onPreferenceChange('timezone', e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Time</option>
                <option value="PST">Pacific Time</option>
                <option value="GMT">Greenwich Mean Time</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onSavePreferences}>
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreferencesTab;
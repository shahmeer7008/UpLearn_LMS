import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Globe, Trash2 } from 'lucide-react';
import AccountInfoGrid from './AccountInfoGrid';
import { User } from '@/types';

interface AccountTabProps {
  user: User;
}

const AccountTab: React.FC<AccountTabProps> = ({ user }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Management</CardTitle>
        <CardDescription>
          Manage your account settings and data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Account Information</h3>
          <AccountInfoGrid user={user} />
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4">Data Management</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Export Data</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Download a copy of your account data
                </p>
              </div>
              <Button variant="outline">
                <Globe className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4 text-red-600">Danger Zone</h3>
          <div className="border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-red-600">Delete Account</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountTab;
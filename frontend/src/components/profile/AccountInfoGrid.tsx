import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';

interface AccountInfoGridProps {
  user: User;
}

const AccountInfoGrid: React.FC<AccountInfoGridProps> = ({ user }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div>
        <p className="font-medium">Account Status</p>
        <Badge className="mt-1 bg-green-100 text-green-800">Active</Badge>
      </div>
      <div>
        <p className="font-medium">Member Since</p>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {formatDate(user.createdDate)}
        </p>
      </div>
      <div>
        <p className="font-medium">Last Updated</p>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {formatDate(user.lastModifiedDate)}
        </p>
      </div>
      <div>
        <p className="font-medium">Account Type</p>
        <p className="text-gray-600 dark:text-gray-400 mt-1 capitalize">
          {user.role}
        </p>
      </div>
    </div>
  );
};

export default AccountInfoGrid;
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, Mail, Calendar, Shield } from 'lucide-react';
import { User } from '@/types';

interface ProfileHeaderProps {
  user: User;
  isEditing: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, isEditing }) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'instructor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'student': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex items-center space-x-6">
      <div className="relative">
        <Avatar className="w-24 h-24">
          <AvatarImage src={user.profileImage} alt={user.name} />
          <AvatarFallback className="text-2xl">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {isEditing && (
          <Button
            size="sm"
            className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
          >
            <Camera className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{user.name}</h2>
        <div className="flex items-center space-x-2">
          <Badge className={`${getRoleColor(user.role)}`}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>Verified</span>
          </Badge>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Mail className="h-4 w-4" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>Joined {formatDate(user.createdDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
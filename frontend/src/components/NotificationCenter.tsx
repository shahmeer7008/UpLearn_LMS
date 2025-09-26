import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  BookOpen, 
  Award, 
  DollarSign, 
  Users, 
  CheckCircle,
  X,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  type: 'course' | 'achievement' | 'payment' | 'system' | 'enrollment';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    courseId?: string;
    amount?: number;
    certificateId?: string;
  };
}

const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [user]);

  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const loadNotifications = () => {
    // Mock notifications based on user role
    const mockNotifications: Notification[] = [];

    if (user?.role === 'student') {
      mockNotifications.push(
        {
          id: '1',
          type: 'course',
          title: 'New Module Available',
          message: 'A new module has been added to "React Development Course"',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionUrl: '/courses/1/learn',
          metadata: { courseId: '1' }
        },
        {
          id: '2',
          type: 'achievement',
          title: 'Certificate Earned!',
          message: 'Congratulations! You earned a certificate for completing "Python for Data Science"',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionUrl: '/student/certificates',
          metadata: { certificateId: 'cert_1' }
        },
        {
          id: '3',
          type: 'course',
          title: 'Course Reminder',
          message: 'You haven\'t visited "Digital Marketing Masterclass" in 3 days',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          actionUrl: '/courses/3/learn'
        }
      );
    } else if (user?.role === 'instructor') {
      mockNotifications.push(
        {
          id: '4',
          type: 'enrollment',
          title: 'New Student Enrolled',
          message: '5 new students enrolled in your "React Development Course"',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionUrl: '/instructor/students'
        },
        {
          id: '5',
          type: 'payment',
          title: 'Payment Received',
          message: 'You received $99.99 from course sales',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionUrl: '/instructor/earnings',
          metadata: { amount: 99.99 }
        },
        {
          id: '6',
          type: 'system',
          title: 'Course Approved',
          message: 'Your course "Advanced JavaScript Concepts" has been approved and is now live',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          actionUrl: '/instructor/courses'
        }
      );
    } else if (user?.role === 'admin') {
      mockNotifications.push(
        {
          id: '7',
          type: 'system',
          title: 'Course Pending Review',
          message: '3 new courses are waiting for approval',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          read: false,
          actionUrl: '/admin'
        },
        {
          id: '8',
          type: 'system',
          title: 'Platform Update',
          message: 'Monthly platform analytics report is ready',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionUrl: '/admin/analytics'
        }
      );
    }

    setNotifications(mockNotifications);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'achievement':
        return <Award className="h-4 w-4 text-yellow-500" />;
      case 'payment':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'enrollment':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'system':
        return <Settings className="h-4 w-4 text-gray-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="p-4 text-center">
                  <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div 
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => {
                          markAsRead(notification.id);
                          if (notification.actionUrl) {
                            window.location.href = notification.actionUrl;
                          }
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className={`text-sm font-medium ${
                                  !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {notification.title}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {formatTimestamp(notification.timestamp)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {index < notifications.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter;
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  CreditCard,
  Download,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PieChart,
  BarChart3,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Course, Payment } from '@/types';
import axios from 'axios';

interface EarningsData {
  totalEarnings: number;
  monthlyEarnings: number;
  pendingPayouts: number;
  availableBalance: number;
  courseEarnings: { course: Course; revenue: number; students: number }[];
  recentTransactions: Payment[];
  monthlyData: { month: string; earnings: number }[];
  payoutHistory: PayoutRecord[];
}

interface PayoutRecord {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  requestDate: string;
  completedDate?: string;
  method: string;
}

const EarningsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('12');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEarningsData();
  }, [user]);

  const loadEarningsData = async () => {
    if (!user) return;

    try {
      const [coursesRes, paymentsRes] = await Promise.all([
        axios.get(`/api/instructor/courses/${user._id}`),
        axios.get(`/api/instructor/payments/${user._id}`)
      ]);

      const instructorCourses = coursesRes.data;
      const instructorPayments = paymentsRes.data;

      const courseEarnings = instructorCourses.map((course: Course) => {
        const coursePayments = instructorPayments.filter((p: Payment) => p.course_id === course._id);
        const revenue = coursePayments.reduce((sum: number, p: Payment) => sum + p.amount, 0);
        const students = coursePayments.length;
        return { course, revenue, students };
      }).sort((a: any, b: any) => b.revenue - a.revenue);

      const monthlyData = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        const earnings = instructorPayments
          .filter((p: Payment) => new Date(p.paymentDate).getMonth() === date.getMonth())
          .reduce((sum: number, p: Payment) => sum + p.amount, 0);
        monthlyData.push({ month: monthName, earnings });
      }

      const payoutHistory: PayoutRecord[] = [];

      const totalEarnings = instructorPayments.reduce((sum: number, p: Payment) => sum + p.amount, 0);
      const currentMonth = new Date().getMonth();
      const monthlyEarnings = instructorPayments
        .filter((p: Payment) => new Date(p.paymentDate).getMonth() === currentMonth)
        .reduce((sum: number, p: Payment) => sum + p.amount, 0);

      const data: EarningsData = {
        totalEarnings,
        monthlyEarnings,
        pendingPayouts: 0,
        availableBalance: totalEarnings,
        courseEarnings,
        recentTransactions: instructorPayments.slice(0, 10),
        monthlyData,
        payoutHistory
      };

      setEarningsData(data);
    } catch (error) {
      console.error('Error loading earnings data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getGrowthPercentage = () => {
    if (!earningsData || earningsData.monthlyData.length < 2) return 0;
    const currentMonth = earningsData.monthlyData[earningsData.monthlyData.length - 1].earnings;
    const previousMonth = earningsData.monthlyData[earningsData.monthlyData.length - 2].earnings;
    return previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0;
  };

  if (isLoading || !earningsData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const growthPercentage = getGrowthPercentage();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Earnings Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your revenue, payments, and financial performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(earningsData.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              All-time revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(earningsData.monthlyEarnings)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {growthPercentage >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(growthPercentage).toFixed(1)}%
              </span>
              {' '}from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(earningsData.availableBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Ready for payout
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(earningsData.pendingPayouts)}</div>
            <p className="text-xs text-muted-foreground">
              Processing
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">By Course</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Earnings Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Earnings</CardTitle>
                <CardDescription>
                  Your earnings over the last 12 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {earningsData.monthlyData.map((data, index) => (
                    <div key={data.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{data.month}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(data.earnings / Math.max(...earningsData.monthlyData.map(d => d.earnings))) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-20 text-right">
                          {formatCurrency(data.earnings)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Request Payout
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download Tax Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    View Statements
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    Payment Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top Performing Course</CardTitle>
                </CardHeader>
                <CardContent>
                  {earningsData.courseEarnings.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium">{earningsData.courseEarnings[0].course.title}</h3>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(earningsData.courseEarnings[0].revenue)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {earningsData.courseEarnings[0].students} students enrolled
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Earnings by Course</CardTitle>
              <CardDescription>
                Revenue breakdown for each of your courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {earningsData.courseEarnings.map((courseData, index) => (
                  <div key={courseData.course._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">{courseData.course.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {courseData.course.category} • {courseData.students} students
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(courseData.revenue)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {courseData.students > 0 ? formatCurrency(courseData.revenue / courseData.students) : '$0'} avg/student
                      </p>
                    </div>
                  </div>
                ))}
                
                {earningsData.courseEarnings.length === 0 && (
                  <div className="text-center py-8">
                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No earnings data available yet
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    Your latest payment transactions
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {earningsData.recentTransactions.map((transaction) => (
                  <div key={transaction.transaction_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">{transaction.courseName}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Transaction ID: {transaction.transaction_id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">
                        +{formatCurrency(transaction.amount)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatDate(transaction.paymentDate)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {earningsData.recentTransactions.length === 0 && (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No transactions found
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>
                  Your payout requests and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {earningsData.payoutHistory.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          {payout.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : payout.status === 'pending' ? (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{formatCurrency(payout.amount)}</h3>
                            <Badge className={`text-xs ${getStatusColor(payout.status)}`}>
                              {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {payout.method} • Requested {formatDate(payout.requestDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {payout.completedDate && (
                          <p className="text-sm text-gray-500">
                            Completed {formatDate(payout.completedDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Request Payout</CardTitle>
                <CardDescription>
                  Withdraw your available earnings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(earningsData.availableBalance)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Available for payout
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payout Method</label>
                  <Select defaultValue="bank">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full" disabled={earningsData.availableBalance < 50}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Request Payout
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Minimum payout amount: $50.00
                  <br />
                  Processing time: 3-5 business days
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EarningsDashboard;
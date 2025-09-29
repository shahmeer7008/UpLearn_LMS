import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Course {
  _id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

interface Enrollment {
  _id: string;
  user_id: { name: string; email: string };
  course_id: { title: string };
  enrollmentDate: string;
  progress: number;
  completionStatus: string;
}

interface Payment {
  _id: string;
  user_id: { name: string; email: string };
  course_id: { title: string; price: number };
  amount: number;
  paymentDate: string;
}

interface DashboardData {
  courses: Course[];
  enrollments: Enrollment[];
  payments: Payment[];
}

const InstructorDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    courses: [],
    enrollments: [],
    payments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<string>('Checking...');

  // Get user data from localStorage or context
  const getUserId = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      // Decode JWT token to get user ID
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user?.id || payload.id;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  };

  // Set up axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const loadInstructorData = async () => {
    const userId = getUserId();
    
    if (!userId) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Loading data for instructor:', userId);

      // Load courses
      try {
        const coursesResponse = await axios.get(`http://localhost:5000/api/instructor/${userId}/courses`);
        console.log('Courses loaded:', coursesResponse.data);
        setData(prev => ({ ...prev, courses: coursesResponse.data }));
      } catch (err) {
        console.error('Failed to load courses:', err);
        // Don't throw error, just log it
      }

      // Load enrollments
      try {
        const enrollmentsResponse = await axios.get(`http://localhost:5000/api/instructor/${userId}/enrollments`);
        console.log('Enrollments loaded:', enrollmentsResponse.data);
        setData(prev => ({ ...prev, enrollments: enrollmentsResponse.data }));
      } catch (err) {
        console.error('Failed to load enrollments:', err);
        // Don't throw error, just log it
      }

      // Load payments
      try {
        const paymentsResponse = await axios.get(`http://localhost:5000/api/instructor/${userId}/payments`);
        console.log('Payments loaded:', paymentsResponse.data);
        setData(prev => ({ ...prev, payments: paymentsResponse.data }));
      } catch (err) {
        console.error('Failed to load payments:', err);
        // Don't throw error, just log it
      }

    } catch (error) {
      console.error('Error loading instructor data:', error);
      setError('Failed to load instructor data');
    } finally {
      setLoading(false);
    }
  };

  const checkAPIConnection = async () => {
    const testEndpoints = [
      '/profile',
      '/api/instructor/test'
    ];

    for (const endpoint of testEndpoints) {
      try {
        const response = await axios.get(`http://localhost:5000${endpoint}`);
        console.log(`Endpoint ${endpoint} is available:`, response.data);
        setApiStatus(prev => `${prev}\n✓ ${endpoint} - OK`);
      } catch (error) {
        console.error(`Endpoint ${endpoint} not available:`, error.response?.status);
        setApiStatus(prev => `${prev}\n✗ ${endpoint} - ${error.response?.status || 'ERROR'}`);
      }
    }
  };

  useEffect(() => {
    
    
    // Then load instructor data
    loadInstructorData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading instructor dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 text-lg font-semibold mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadInstructorData();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Instructor Dashboard</h1>
        
        {/* API Status Debug Info */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="font-semibold mb-2">API Status</h3>
          <pre className="text-sm text-gray-600 whitespace-pre-wrap">{apiStatus}</pre>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Courses</h3>
            <p className="text-3xl font-bold text-blue-600">{data.courses.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Enrollments</h3>
            <p className="text-3xl font-bold text-green-600">{data.enrollments.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Payments</h3>
            <p className="text-3xl font-bold text-purple-600">{data.payments.length}</p>
          </div>
        </div>

        {/* Courses Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">My Courses</h2>
          </div>
          <div className="p-6">
            {data.courses.length === 0 ? (
              <p className="text-gray-500">No courses found. Create your first course to get started!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.courses.map((course) => (
                  <div key={course._id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{course.description}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      course.status === 'published' ? 'bg-green-100 text-green-800' :
                      course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Recent Enrollments</h2>
          </div>
          <div className="p-6">
            {data.enrollments.length === 0 ? (
              <p className="text-gray-500">No enrollments yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Student</th>
                      <th className="px-4 py-2 text-left">Course</th>
                      <th className="px-4 py-2 text-left">Progress</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.enrollments.slice(0, 10).map((enrollment) => (
                      <tr key={enrollment._id} className="border-t">
                        <td className="px-4 py-2">{enrollment.user_id.name}</td>
                        <td className="px-4 py-2">{enrollment.course_id.title}</td>
                        <td className="px-4 py-2">{enrollment.progress}%</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            enrollment.completionStatus === 'completed' ? 'bg-green-100 text-green-800' :
                            enrollment.completionStatus === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {enrollment.completionStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Recent Payments</h2>
          </div>
          <div className="p-6">
            {data.payments.length === 0 ? (
              <p className="text-gray-500">No payments received yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Student</th>
                      <th className="px-4 py-2 text-left">Course</th>
                      <th className="px-4 py-2 text-left">Amount</th>
                      <th className="px-4 py-2 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.payments.slice(0, 10).map((payment) => (
                      <tr key={payment._id} className="border-t">
                        <td className="px-4 py-2">{payment.user_id.name}</td>
                        <td className="px-4 py-2">{payment.course_id.title}</td>
                        <td className="px-4 py-2">${payment.amount}</td>
                        <td className="px-4 py-2">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
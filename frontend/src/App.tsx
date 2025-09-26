import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Course pages
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import CourseLearning from "./pages/CourseLearning";
import Wishlist from "./pages/Wishlist";

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import MyCourses from "./pages/student/MyCourses";
import Certificates from "./pages/student/Certificates";

// Instructor pages
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import CreateCourse from "./pages/instructor/CreateCourse";
import EditCourse from "./pages/instructor/EditCourse";
import ManageCourses from "./pages/instructor/ManageCourses";
import StudentManagement from "./pages/instructor/StudentManagement";
import Analytics from "./pages/instructor/Analytics";
import EarningsDashboard from "./pages/instructor/EarningsDashboard";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import CourseManagement from "./pages/admin/CourseManagement";
import PlatformAnalytics from "./pages/admin/PlatformAnalytics";

// Common pages
import Profile from "./pages/Profile";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to redirect users to their role-specific dashboard
const DashboardRedirect = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'instructor':
      return <Navigate to="/instructor" replace />;
    case 'student':
      return <Navigate to="/student" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navbar />
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Index />} />
              
              {/* Course browsing and learning */}
              <Route path="/courses" element={
                <ProtectedRoute>
                  <Courses />
                </ProtectedRoute>
              } />
              <Route path="/courses/:id" element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              } />
              <Route path="/courses/:id/learn" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <CourseLearning />
                </ProtectedRoute>
              } />
              <Route path="/wishlist" element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              } />
              
              {/* Dashboard redirect */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              } />

              {/* Common protected routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              {/* Student routes */}
              <Route path="/student" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/student/my-courses" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MyCourses />
                </ProtectedRoute>
              } />
              <Route path="/student/certificates" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Certificates />
                </ProtectedRoute>
              } />

              {/* Instructor routes */}
              <Route path="/instructor" element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <InstructorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/instructor/courses" element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <ManageCourses />
                </ProtectedRoute>
              } />
              <Route path="/instructor/courses/create" element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <CreateCourse />
                </ProtectedRoute>
              } />
              <Route path="/instructor/courses/:id/edit" element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <EditCourse />
                </ProtectedRoute>
              } />
              <Route path="/instructor/students" element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <StudentManagement />
                </ProtectedRoute>
              } />
              <Route path="/instructor/analytics" element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/instructor/earnings" element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <EarningsDashboard />
                </ProtectedRoute>
              } />

              {/* Admin routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/courses" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CourseManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PlatformAnalytics />
                </ProtectedRoute>
              } />

              {/* Unauthorized page */}
              <Route path="/unauthorized" element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">403</h1>
                    <p className="text-xl text-gray-600 mb-4">Access Denied</p>
                    <p className="text-gray-500">You don't have permission to access this page.</p>
                  </div>
                </div>
              } />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
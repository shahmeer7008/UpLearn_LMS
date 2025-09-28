export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  status: 'active' | 'blocked';
  profileImage?: string;
  createdDate: string;
  lastModifiedDate: string;
  enrolledCourses?: string[];
  wishlist?: string[];
}

export interface Course {
  _id: string; // MongoDB _id
  title: string;
  description: string;
  category: string;
  instructorId: string;
  pricing: number; // 0 for free courses
  status: 'pending' | 'approved' | 'archived';
  createdDate: string;
  lastModifiedDate: string;
  coverImage?: string;
  rating: number;
  duration: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  published: boolean;
  modules: Module[]; // Added for compatibility
  enrollmentCount: number; // Added for compatibility
  ratingAverage?: number; // Optional, for compatibility
  instructorName?: string; // Optional, for compatibility
  completedModules?: string[]; // Array of completed module IDs
}

export interface Module {
  _id: string; // MongoDB _id
  id?: string; // Optional for compatibility
  course_id: string;
  title: string;
  type: 'video' | 'pdf' | 'quiz';
  contentUrl: string; // camelCase for frontend
  content_url?: string; // snake_case for backend
  orderSequence: number;
  duration?: number; // in minutes
}

export interface Enrollment {
  _id: string;
  user_id: string;
  course_id: string;
  progress: number; // percentage 0-100
  completionStatus: 'in-progress' | 'completed';
  enrollmentDate: string;
  completedModules?: string[];
  lastAccessedDate: string;
  courseName?: string;
}

export interface Payment {
  _id: string;
  user_id: string;
  course_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentDate: string;
  transaction_id?: string;
  courseName?: string;
  studentName?: string;
}

export interface Certificate {
  _id: string;
  user_id: string;
  course_id: string;
  courseName: string;
  completionDate: string;
  certificateUrl: string;
  verificationId: string;
}

export interface Review {
  _id: string;
  user_id: string;
  userName: string;
  userAvatar?: string;
  course_id: string;
  rating: number; // 1-5 stars
  comment: string;
  createdDate: string;
  helpful: number; // number of helpful votes
  reported: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
}
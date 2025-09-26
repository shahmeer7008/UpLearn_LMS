export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  status: 'active' | 'blocked';
  profileImage?: string;
  createdDate: string;
  lastModifiedDate: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructorId: string;
  instructorName: string;
  pricing: number; // 0 for free courses
  status: 'pending' | 'approved' | 'archived';
  createdDate: string;
  lastModifiedDate: string;
  previewVideoUrl?: string;
  ratingAverage: number;
  enrollmentCount: number;
  modules: Module[];
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  type: 'video' | 'pdf' | 'quiz';
  contentUrl: string;
  orderSequence: number;
  duration?: number; // in minutes
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number; // percentage 0-100
  completionStatus: 'in-progress' | 'completed';
  enrollmentDate: string;
  lastAccessedDate: string;
  completedModules: string[]; // array of module IDs
}

export interface Payment {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  transactionId: string;
  paymentDate: string;
  courseName: string;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  completionDate: string;
  certificateUrl: string;
  verificationId: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  courseId: string;
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
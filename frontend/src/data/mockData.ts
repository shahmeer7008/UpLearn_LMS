import { Course, Enrollment, Payment, Certificate, Module, User } from '@/types';

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Complete React Development Course',
    description: 'Learn React from basics to advanced concepts including hooks, context, and modern patterns.',
    category: 'Programming',
    instructorId: '2',
    instructorName: 'Mike Instructor',
    pricing: 99.99,
    status: 'approved',
    createdDate: '2024-01-15T10:00:00Z',
    lastModifiedDate: '2024-01-20T15:30:00Z',
    previewVideoUrl: 'https://www.youtube.com/embed/dGcsHMXbSOA',
    ratingAverage: 4.8,
    enrollmentCount: 1250,
    modules: [
      {
        id: '1-1',
        courseId: '1',
        title: 'Introduction to React',
        type: 'video',
        contentUrl: 'https://www.youtube.com/embed/dGcsHMXbSOA',
        orderSequence: 1,
        duration: 45
      },
      {
        id: '1-2',
        courseId: '1',
        title: 'React Components Guide',
        type: 'pdf',
        contentUrl: '/pdfs/react-components.pdf',
        orderSequence: 2
      },
      {
        id: '1-3',
        courseId: '1',
        title: 'React Hooks Quiz',
        type: 'quiz',
        contentUrl: 'quiz-1',
        orderSequence: 3
      }
    ]
  },
  {
    id: '2',
    title: 'Python for Data Science',
    description: 'Master Python programming for data analysis, visualization, and machine learning.',
    category: 'Data Science',
    instructorId: '2',
    instructorName: 'Mike Instructor',
    pricing: 0, // Free course
    status: 'approved',
    createdDate: '2024-02-01T09:00:00Z',
    lastModifiedDate: '2024-02-05T14:20:00Z',
    previewVideoUrl: 'https://www.youtube.com/embed/rfscVS0vtbw',
    ratingAverage: 4.6,
    enrollmentCount: 2100,
    modules: [
      {
        id: '2-1',
        courseId: '2',
        title: 'Python Basics',
        type: 'video',
        contentUrl: 'https://www.youtube.com/embed/rfscVS0vtbw',
        orderSequence: 1,
        duration: 60
      },
      {
        id: '2-2',
        courseId: '2',
        title: 'Data Analysis with Pandas',
        type: 'video',
        contentUrl: 'https://www.youtube.com/embed/vmEHCJofslg',
        orderSequence: 2,
        duration: 75
      }
    ]
  },
  {
    id: '3',
    title: 'Digital Marketing Masterclass',
    description: 'Complete guide to digital marketing including SEO, social media, and paid advertising.',
    category: 'Marketing',
    instructorId: '2',
    instructorName: 'Mike Instructor',
    pricing: 149.99,
    status: 'approved',
    createdDate: '2024-01-20T11:30:00Z',
    lastModifiedDate: '2024-01-25T16:45:00Z',
    previewVideoUrl: 'https://www.youtube.com/embed/nU-IIXBWlS4',
    ratingAverage: 4.7,
    enrollmentCount: 890,
    modules: [
      {
        id: '3-1',
        courseId: '3',
        title: 'Digital Marketing Fundamentals',
        type: 'video',
        contentUrl: 'https://www.youtube.com/embed/nU-IIXBWlS4',
        orderSequence: 1,
        duration: 50
      },
      {
        id: '3-2',
        courseId: '3',
        title: 'SEO Strategy Guide',
        type: 'pdf',
        contentUrl: '/pdfs/seo-guide.pdf',
        orderSequence: 2
      }
    ]
  }
];

export const mockEnrollments: Enrollment[] = [
  {
    id: 'e1',
    userId: '1',
    courseId: '1',
    progress: 66,
    completionStatus: 'in-progress',
    enrollmentDate: '2024-01-16T10:00:00Z',
    lastAccessedDate: '2024-01-22T14:30:00Z',
    completedModules: ['1-1', '1-2']
  },
  {
    id: 'e2',
    userId: '1',
    courseId: '2',
    progress: 100,
    completionStatus: 'completed',
    enrollmentDate: '2024-02-02T09:15:00Z',
    lastAccessedDate: '2024-02-10T16:20:00Z',
    completedModules: ['2-1', '2-2']
  }
];

export const mockPayments: Payment[] = [
  {
    id: 'p1',
    userId: '1',
    courseId: '1',
    amount: 99.99,
    status: 'completed',
    transactionId: 'txn_1234567890',
    paymentDate: '2024-01-16T10:00:00Z',
    courseName: 'Complete React Development Course'
  }
];

export const mockCertificates: Certificate[] = [
  {
    id: 'c1',
    userId: '1',
    courseId: '2',
    courseName: 'Python for Data Science',
    completionDate: '2024-02-10T16:20:00Z',
    certificateUrl: '/certificates/cert-python-data-science.pdf',
    verificationId: 'CERT-2024-001'
  }
];

// Mock reviews data
export const mockReviews = [
  {
    id: 'r1',
    userId: '1',
    userName: 'Sarah Student',
    courseId: '1',
    rating: 5,
    comment: 'Excellent course! The instructor explains everything clearly and the hands-on projects really helped me understand the concepts.',
    createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    helpful: 12,
    reported: false
  },
  {
    id: 'r2',
    userId: '4',
    userName: 'John Learner',
    courseId: '1',
    rating: 4,
    comment: 'Great content and well-structured. Could use more advanced examples, but overall very satisfied.',
    createdDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    helpful: 8,
    reported: false
  },
  {
    id: 'r3',
    userId: '5',
    userName: 'Emily Chen',
    courseId: '2',
    rating: 5,
    comment: 'This course exceeded my expectations. The practical exercises and real-world examples made learning enjoyable.',
    createdDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    helpful: 15,
    reported: false
  }
];

// Helper functions to simulate API calls
export const getCourses = (): Promise<Course[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockCourses), 500);
  });
};

export const getCourseById = (id: string): Promise<Course | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const course = mockCourses.find(c => c.id === id);
      resolve(course || null);
    }, 300);
  });
};

export const getEnrollmentsByUserId = (userId: string): Promise<Enrollment[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const enrollments = mockEnrollments.filter(e => e.userId === userId);
      resolve(enrollments);
    }, 300);
  });
};

export const getPaymentsByUserId = (userId: string): Promise<Payment[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const payments = mockPayments.filter(p => p.userId === userId);
      resolve(payments);
    }, 300);
  });
};

export const getCertificatesByUserId = (userId: string): Promise<Certificate[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const certificates = mockCertificates.filter(c => c.userId === userId);
      resolve(certificates);
    }, 300);
  });
};

export const getReviewsByCourseId = (courseId: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const reviews = mockReviews.filter(r => r.courseId === courseId);
      resolve(reviews);
    }, 300);
  });
};

// Storage helpers for localStorage persistence
export const saveToStorage = (key: string, data: any) => {
  localStorage.setItem(`lms_${key}`, JSON.stringify(data));
};

export const getFromStorage = (key: string) => {
  const data = localStorage.getItem(`lms_${key}`);
  return data ? JSON.parse(data) : null;
};

// Initialize mock data in localStorage if not exists
export const initializeMockData = () => {
  if (!getFromStorage('courses')) {
    saveToStorage('courses', mockCourses);
  }
  if (!getFromStorage('enrollments')) {
    saveToStorage('enrollments', mockEnrollments);
  }
  if (!getFromStorage('payments')) {
    saveToStorage('payments', mockPayments);
  }
  if (!getFromStorage('certificates')) {
    saveToStorage('certificates', mockCertificates);
  }
  if (!getFromStorage('reviews')) {
    saveToStorage('reviews', mockReviews);
  }
};
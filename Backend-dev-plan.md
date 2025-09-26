# 1) Executive Summary
This document outlines the development plan for the UpLearn LMS backend. The backend will be built using **Node.js with the Express framework** and will use **MongoDB Atlas** as its database. This plan honors the constraints specified in the prompt, including a `main`-only Git workflow and frontend-driven manual testing.

The sprint count is dynamic and has been designed to cover all features currently visible in the frontend application, ensuring a complete and functional backend that integrates seamlessly with the existing UI.

# 2) In-scope & Success Criteria
- **In-scope Features**:
  - User authentication (signup, login, logout) with JWT.
  - Role-based access control for students, instructors, and admins.
  - Full course management (create, read, update, delete) for instructors.
  - Course enrollment and progress tracking for students.
  - User and course administration for admins.
  - Certificate generation upon course completion.
  - Payment integration (conceptual, with Stripe as the example).
  - Analytics for instructors and platform-wide analytics for admins.

- **Success Criteria**:
  - All frontend features are fully supported by the backend APIs.
  - Each development sprint concludes with successful manual testing conducted through the frontend UI.
  - The application is stable, secure, and ready for deployment.
  - Code is successfully pushed to the `main` branch on GitHub after each sprint's validation.

# 3) API Design
- **Conventions**:
  - API Base Path: `/api`
  - Authentication: JWT Bearer token in the `Authorization` header for protected endpoints.
  - Error Model: A consistent JSON object for errors, e.g., `{ "error": "A short, descriptive error message." }`.

- **Endpoints**:

  - **Auth**
    - `POST /api/auth/register`: Register a new user (student, instructor).
    - `POST /api/auth/login`: Authenticate a user and return a JWT.
    - `POST /api/auth/logout`: Invalidate the user's session (can be implemented on the client-side by clearing the token).
    - `GET /api/auth/me`: Get the currently authenticated user's profile.

  - **Courses (Public/Student)**
    - `GET /api/courses`: Get a list of all approved courses (supports search/filtering).
    - `GET /api/courses/:id`: Get details for a single course.

  - **Enrollments (Student)**
    - `POST /api/courses/:id/enroll`: Enroll the authenticated user in a course (handles payment flow).
    - `GET /api/student/my-courses`: Get a list of courses the user is enrolled in.
    - `GET /api/courses/:id/progress`: Get the user's progress for a specific course.
    - `POST /api/courses/:id/progress`: Update the user's progress.

  - **Certificates (Student)**
    - `GET /api/student/certificates`: Get a list of certificates earned by the user.
    - `GET /api/student/certificates/:id`: Download a specific certificate.

  - **Instructor**
    - `POST /api/instructor/courses`: Create a new course (status defaults to 'pending').
    - `GET /api/instructor/courses`: Get a list of courses created by the instructor.
    - `PUT /api/instructor/courses/:id`: Update an existing course.
    - `DELETE /api/instructor/courses/:id`: Delete a course.
    - `POST /api/instructor/courses/:id/modules`: Add a module to a course.
    - `GET /api/instructor/courses/:id/students`: Get a list of students enrolled in a course.
    - `GET /api/instructor/revenue`: Get revenue analytics for the instructor.

  - **Admin**
    - `GET /api/admin/users`: Get a list of all users (supports filtering by role/status).
    - `PUT /api/admin/users/:id/status`: Approve or block a user.
    - `GET /api/admin/courses/pending`: Get a list of courses awaiting approval.
    - `PUT /api/admin/courses/:id/status`: Approve or reject a course.
    - `GET /api/admin/reports`: Get platform-wide reports (users, courses, revenue).
    - `GET /api/admin/analytics`: Get platform analytics (active users, sales trends).

# 4) Data Model (MongoDB Atlas)
- **Users Collection**
  - `_id`: ObjectId (Primary Key)
  - `name`: String, required
  - `email`: String, required, unique
  - `password`: String, required (hashed)
  - `role`: String, required, enum: ['student', 'instructor', 'admin']
  - `status`: String, required, enum: ['approved', 'blocked'], default: 'approved'
  - *Example Document*:
    ```json
    {
      "_id": "60c72b2f9b1d8c001f8e4c6a",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "password": "$2b$10$...",
      "role": "student",
      "status": "approved"
    }
    ```

- **Courses Collection**
  - `_id`: ObjectId (Primary Key)
  - `title`: String, required
  - `description`: String, required
  - `category`: String, required
  - `instructor_id`: ObjectId, ref: 'Users', required
  - `pricing`: Number, required
  - `status`: String, required, enum: ['pending', 'approved'], default: 'pending'
  - `modules`: Array of embedded documents (see below)
  - *Example Document*:
    ```json
    {
      "_id": "60c72b2f9b1d8c001f8e4c6b",
      "title": "Introduction to Node.js",
      "description": "A beginner-friendly course on Node.js.",
      "category": "Programming",
      "instructor_id": "60c72b2f9b1d8c001f8e4c69",
      "pricing": 49.99,
      "status": "approved",
      "modules": [
        { "_id": "60c72b2f9b1d8c001f8e4c6c", "title": "Module 1: Getting Started", "type": "video", "content_url": "https://.../video1.mp4" }
      ]
    }
    ```

- **Enrollments Collection**
  - `_id`: ObjectId (Primary Key)
  - `user_id`: ObjectId, ref: 'Users', required
  - `course_id`: ObjectId, ref: 'Courses', required
  - `progress`: Number, default: 0
  - `completion_status`: Boolean, default: false
  - *Example Document*:
    ```json
    {
      "_id": "60c72b2f9b1d8c001f8e4c6d",
      "user_id": "60c72b2f9b1d8c001f8e4c6a",
      "course_id": "60c72b2f9b1d8c001f8e4c6b",
      "progress": 50,
      "completion_status": false
    }
    ```

- **Payments Collection**
  - `_id`: ObjectId (Primary Key)
  - `user_id`: ObjectId, ref: 'Users', required
  - `course_id`: ObjectId, ref: 'Courses', required
  - `amount`: Number, required
  - `status`: String, required, enum: ['succeeded', 'failed']
  - `transaction_id`: String, required (from payment provider)
  - *Example Document*:
    ```json
    {
      "_id": "60c72b2f9b1d8c001f8e4c6e",
      "user_id": "60c72b2f9b1d8c001f8e4c6a",
      "course_id": "60c72b2f9b1d8c001f8e4c6b",
      "amount": 49.99,
      "status": "succeeded",
      "transaction_id": "pi_123..."
    }
    ```

# 5) Frontend Audit & Feature Map
- **`pages/Login.tsx` & `pages/Register.tsx`**
  - Purpose: User authentication.
  - Backend: `POST /api/auth/login`, `POST /api/auth/register`. Models: `Users`.
- **`pages/Courses.tsx` & `pages/CourseDetail.tsx`**
  - Purpose: Browse and view course details.
  - Backend: `GET /api/courses`, `GET /api/courses/:id`. Models: `Courses`.
- **`pages/student/MyCourses.tsx` & `pages/CourseLearning.tsx`**
  - Purpose: View enrolled courses and track progress.
  - Backend: `GET /api/student/my-courses`, `GET /api/courses/:id/progress`, `POST /api/courses/:id/progress`. Models: `Enrollments`, `Courses`.
- **`pages/instructor/CreateCourse.tsx` & `pages/instructor/EditCourse.tsx`**
  - Purpose: Instructors to manage their courses.
  - Backend: `POST /api/instructor/courses`, `PUT /api/instructor/courses/:id`. Models: `Courses`.
- **`pages/admin/UserManagement.tsx` & `pages/admin/CourseManagement.tsx`**
  - Purpose: Admins to manage users and courses.
  - Backend: `GET /api/admin/users`, `PUT /api/admin/users/:id/status`, `GET /api/admin/courses/pending`, `PUT /api/admin/courses/:id/status`. Models: `Users`, `Courses`.

# 6) Configuration & ENV Vars (core only)
- `NODE_ENV`: Environment name (e.g., `development`, `production`).
- `PORT`: HTTP port (e.g., `8000`).
- `MONGODB_URI`: Atlas connection string.
- `JWT_SECRET`: Secret for signing JWTs.
- `JWT_EXPIRES_IN`: Access token lifetime (e.g., `1h`).
- `CORS_ORIGIN`: Allowed frontend origin URL.
- `STRIPE_SECRET_KEY`: Stripe secret key for payments.

# 7) Integrations
- **Stripe**: For processing payments for course enrollments.
  - Flow: Frontend initiates payment -> Backend creates a Stripe Payment Intent -> Frontend confirms payment -> Backend verifies via webhook.
  - Env Vars: `STRIPE_SECRET_KEY`.

# 8) Testing Strategy (Manual via Frontend)
- **Policy**: All backend features will be validated by interacting with the connected frontend application. The browser's Network tab in DevTools will be used to inspect API requests and responses.
- **Process**: After each sprint, the developer will perform the tests outlined in the sprint's "Manual Test Checklist". If all tests pass, the code will be committed and pushed to the `main` branch.

# 9) Dynamic Sprint Plan & Backlog (S0…S4)

### S0 - Environment Setup & Frontend Connection
- **Objectives**:
  - Create a basic Node.js/Express server skeleton.
  - Set up MongoDB connection using Mongoose.
  - Implement a `/api/healthz` endpoint that checks DB connectivity.
  - Configure CORS to allow requests from the frontend.
  - Initialize Git, create a `.gitignore` file, and push the initial setup to a new GitHub repository on the `main` branch.
- **Definition of Done**:
  - The Express server runs locally.
  - The `/api/healthz` endpoint returns a success status and confirms DB connection.
  - The frontend can successfully make a request to the backend.
  - The initial project structure is on GitHub.
- **Manual Test Checklist (Frontend)**:
  - 1. Start the backend server.
  - 2. Start the frontend development server.
  - 3. In the frontend code, make a test call to `/api/healthz` (e.g., in `App.tsx`'s `useEffect`).
  - 4. Open the browser console and Network tab to confirm a successful `200 OK` response.
- **User Test Prompt**: "Verify the application loads and the browser console shows a 'Backend connection successful' message."
- **Post-sprint**: Commit changes and push to `main`.

### S1 - Basic Auth (Signup, Login, Logout)
- **Objectives**:
  - Implement the `Users` model.
  - Create `POST /api/auth/register` and `POST /api/auth/login` endpoints.
  - Use bcrypt to hash passwords.
  - Issue JWTs upon successful login.
  - Create middleware to protect routes and identify users based on their token.
- **Definition of Done**:
  - A user can register via the frontend's registration form.
  - A registered user can log in and receive a JWT.
  - Protected frontend routes are inaccessible without a valid token.
- **Manual Test Checklist (Frontend)**:
  - 1. Navigate to the `/register` page and create a new user.
  - 2. Verify the user is redirected to the login page or dashboard.
  - 3. Log out (if applicable) and log back in using the `/login` page.
  - 4. Attempt to access a protected route (e.g., `/profile`) and verify it works.
  - 5. Log out, then try to access the protected route again and verify you are redirected to login.
- **User Test Prompt**: "Can you sign up for a new account, log out, and log back in successfully? Check if you can access your profile page only when logged in."
- **Post-sprint**: Commit changes and push to `main`.

### S2 - Course & Enrollment Management (Student & Public)
- **Objectives**:
  - Implement `Courses` and `Enrollments` models.
  - Create public endpoints to list and view courses (`GET /api/courses`, `GET /api/courses/:id`).
  - Implement student-specific endpoints for enrolling (`POST /api/courses/:id/enroll`), viewing enrolled courses (`GET /api/student/my-courses`), and tracking progress.
- **Definition of Done**:
  - The frontend can display a list of courses fetched from the backend.
  - A logged-in student can enroll in a course.
  - The "My Courses" page correctly displays the courses the student is enrolled in.
- **Manual Test Checklist (Frontend)**:
  - 1. (As admin/instructor, manually add a few courses to the DB for testing).
  - 2. As a logged-out user, view the courses page.
  - 3. Log in as a student and enroll in a course.
  - 4. Navigate to the "My Courses" page and verify the new course appears.
  - 5. Click on the course to start learning and verify the progress tracking is functional.
- **User Test Prompt**: "As a student, can you browse the course list, enroll in a course, and see it on your 'My Courses' dashboard?"
- **Post-sprint**: Commit changes and push to `main`.

### S3 - Instructor Features (Course Creation & Management)
- **Objectives**:
  - Implement instructor-only endpoints for creating, updating, and managing their courses.
  - Secure these endpoints using the role-based auth middleware.
  - Implement the endpoint for an instructor to view students enrolled in their courses.
- **Definition of Done**:
  - A logged-in instructor can create a new course, which is initially set to 'pending'.
  - The instructor can view and edit the courses they have created.
  - The instructor can see a list of students for each of their courses.
- **Manual Test Checklist (Frontend)**:
  - 1. Log in as an instructor.
  - 2. Navigate to the "Create Course" page and fill out the form.
  - 3. Verify the new course appears in the "Manage Courses" dashboard with 'pending' status.
  - 4. Edit the course details and save the changes.
  - 5. Check the "Student Management" view for an enrolled course.
- **User Test Prompt**: "As an instructor, can you create a new course and then edit its details? Can you see which students are enrolled?"
- **Post-sprint**: Commit changes and push to `main`.

### S4 - Admin Features (User & Course Approval)
- **Objectives**:
  - Implement admin-only endpoints for managing users and courses.
  - Admins should be able to approve/block users.
  - Admins should be able to approve/reject pending courses.
- **Definition of Done**:
  - A logged-in admin can view all users and change their status.
  - An admin can view all pending courses and approve them, making them visible to students.
- **Manual Test Checklist (Frontend)**:
  - 1. Log in as an admin.
  - 2. Navigate to the "User Management" dashboard and block a test user.
  - 3. Try to log in as the blocked user and verify access is denied.
  - 4. Navigate to the "Course Management" dashboard.
  - 5. Approve a 'pending' course created by an instructor.
  - 6. Log in as a student and verify the newly approved course is now visible in the main course list.
- **User Test Prompt**: "As an admin, can you approve a pending course and see it become available for students? Can you block a user and prevent them from logging in?"
- **Post-sprint**: Commit changes and push to `main`.
## API Endpoints

### Courses
Base path: `/api/courses`

#### GET /api/courses
- Purpose: Retrieve all courses
- Response: 
  - 200: Array of course objects
  ```typescript
  {
    courses: Array<{
      id: string;
      title: string;
      slug: string;
      description: string;
      category: string;
    }>
  }
  ```
  - 500: Server error

#### POST /api/courses
- Purpose: Create new course
- Request body:
  ```typescript
  {
    title: string;
    description: string;
    category: string;
  }
  ```
- Response:
  - 201: Created course object
  ```typescript
    {
      id: string;
      title: string;
      slug: string;
      description: string;
      category: string;
    }
  ```
  - 400: Invalid input
  - 500: Server error

#### DELETE /api/courses/{id}
- Purpose: Delete course and related lessons/comments
- Response:
  - 200: Success
  - 404: Course not found
  - 500: Server error

#### PATCH /api/courses/{id}
- Purpose: Update course category
- Request body:
  ```typescript
  {
    category: string;
  }
  ```
- Response:
  - 200: Updated course
  - 404: Course not found
  - 500: Server error

### Lessons
Base path: `/api/lessons`

#### GET /api/lessons
- Purpose: Get lessons for a course
- Query params: `courseId`
- Response:
  - 200: Array of lesson objects
  - 404: Course not found
  - 500: Server error

#### POST /api/lessons
- Purpose: Create new lesson
- Request body:
  ```typescript
  {
    courseId: string;
    title: string;
    description: string;
    content: string;
  }
  ```
- Response:
  - 201: Created lesson
  - 400: Invalid input
  - 500: Server error

### Comments
Base path: `/api/comments`

#### GET /api/comments
- Purpose: Get comments for a lesson
- Query params: `lessonId`
- Response:
  - 200: Array of comment objects
  - 404: Lesson not found
  - 500: Server error

#### POST /api/comments
- Purpose: Create new comment
- Request body:
  ```typescript
  {
    lessonId: string;
    comment: string;
    createdBy: string;
  }
  ```
- Response:
  - 201: Created comment
  - 400: Invalid input
  - 500: Server error

## Pages and Routes

### 1. Login Page (/)
- Main landing/login page
- Handles user authentication
- Redirects to course listing upon success
- API Endpoints Used: None (authentication handled separately)

### 2. Course Listing (/courses)
- Displays all available courses
- Allows filtering by category
- Links to individual course pages
- Has button to create new course (if authorized)
- API Endpoints Used:
    - GET /api/courses (retrieves all courses for listing)
    - Frontend handles category filtering locally

### 3. Course Detail (/courses/[slug])
- Shows course information
- Lists all lessons in the course
- Option to delete course (if authorized)
- Option to update course category (if authorized)
- API Endpoints Used:
    - GET /api/courses (to get course details)
    - GET /api/lessons?courseId={id} (to get course lessons)
    - DELETE /api/courses/{id} (for course deletion)
    - PATCH /api/courses/{id} (for updating category)

### 4. Lesson View (/courses/[slug]/lessons/[lesson-slug])
- Displays lesson content
- Shows comments section
- Uses text editor for content (basic textarea or TipTap)
- Allows adding new comments
- API Endpoints Used:
    - GET /api/lessons (to get lesson content)
    - GET /api/comments?lessonId={id} (to get lesson comments)
    - POST /api/comments (to add new comments)

### 5. New Course (/courses/new)
- Form to create new course
- Input validation
- Redirects to course detail on success
- API Endpoints Used:
    - POST /api/courses (to create new course)

### 6. New Lesson (/courses/[slug]/lessons/new)
- Form to create new lesson
- Rich text editor integration
- Input validation
- Redirects to lesson view on success
- API Endpoints Used:
    - POST /api/lessons (to create new lesson)
    - GET /api/courses (to validate course exists)
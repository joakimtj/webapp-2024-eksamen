## API Endpoints

### Courses
Base path: `/api/courses`

#### GET /api/courses
- Purpose: Retrieve all courses
- Response: 
  - 200: Array of course objects
  ```typescript
  {
    id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    created_at: string;
  }[];
  ```
  - 500: Server error

#### GET /api/courses/:id
- Purpose: Retrieve specific course
- Response:
  - 200: Course with lesson
  ```typescript
  interface CourseWithLessonResponse {
    id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    created_at: string;
    lessons: {
      id: string;
      title: string;
      slug: string;
      preamble: string;
      content_blocks: {
        id: string;
        content: string;
        block_order: number;
      }[],
      comments: {
        id: string;
        comment: string;
        user: {
          id: string;
          name: string;
        };
        created_at: string;
      }[];
    }[];
  }
  ```
  - 404: Not found
  - 500: Server error

#### POST /api/courses
- Purpose: Create new course
- Request body:
  ```typescript
  interface CreateCourseRequest {
    id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    lessons: {
      title: string;
      slug: string;
      preamble: string;
      text: string[];
      order: number;
    }[];
  }
  ```
- Response:
  - 201: Success
  - 400: Invalid input
  - 500: Server error

#### DELETE /api/courses/:id/
- Purpose: Delete course and related lessons and comments
- Response:
  - 200: Success
  - 500: Server error

#### PATCH /api/courses/:id/category
- Purpose: Update course category
- Response:
  - 200: Updated course
  ```typescript
  {
    id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    created_at: string;
  }
  ```
  - 404: Course not found
  - 500: Server error


### Lessons

#### GET /api/courses/:id/lessons/:lesson
- Purpose: Retrieve a single lesson from a course
- Response:
  - 200: Single lesson from course
  ```typescript
  {
    id: string;
    course_id: string;
    title: string;
    slug: string;
    preamble: string;
    lesson_order: number;
    created_at: string;
    content_blocks: {
      id: string;
      content: string;
      block_order: number;
    }[],
    comments: {
      id: string;
      comment: string;
      user: {
        id: string;
        name: string;
      };
      created_at: string;
    }[];
  }
  ```
  - 400: Invalid course or lesson ID
  - 500: Server error


#### POST /api/courses/:id/lessons/
- Purpose: Create a single lesson for a course
- Request:
```typescript
interface CreateLessonRequest {
  courseId: string;
  title: string;
  preamble: string;
  slug: string;
  lesson_order: number;
  content_blocks: {
    content: string;
    block_order: number;
  }[];
}
```
- Response:
  - 201: Success
    - ID of the new lesson
  - 500: Server error

#### POST /api/lessons/:id/comments
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

### Users
#### GET /api/users
- Purpose: Retrieve all users
- Response: 
  - 200: array of names
  ```typescript
  string[]
  ```
  - 500: Server error

#### POST /api/users
- Purpose: Create a new user
- Response:
  - 201: Created user
  - 500: Server error
  
## Pages and Routes

### 1. Login Page (/)
- Main landing/login page
- Handles user authentication
- Redirects to course listing upon success
- API Endpoints Used: None

### 2. Course Listing (/courses)
- Displays all available courses
- Allows filtering by category
- Links to individual course pages
- Has button to create new course
- Has button to delete a course
- API Endpoints Used:
    - GET /api/courses
      - Retrieves all courses for listing
    - POST /api/courses/:id
      - Deletes a specific course
    - Frontend handles category filtering locally

### 3. Course Detail (/courses/[slug])
- Shows course information
- Lists all lessons in the course
- API Endpoints Used:
    - GET /api/courses/:id 
      - Retrieve course information
    - GET /api/users
      - Retrieve all users. This is to display the list of users, similar to the project we forked from.
- Not implemented:
  - Option to update course category (if authorized)

### 4. Lesson View (/courses/[slug]/lessons/[lesson-slug])
- Displays lesson content
- Shows comments section
- API Endpoints Used:
    - GET /api/courses/:id/lessons/:lesson
      - Get lesson information
    - GET /api/courses/:id
      - Get course information
- Not implemented:
  - Allows adding new comments 

### 5. New Course (/courses/new)
- Form to create new course with lessons
- Input validation
- Redirects to courses on success
- API Endpoints Used:
  - GET /api/categories
    - Retrieves a list of available categories to choose from
  - POST /api/courses
    - Create a new course
- Not implemented:
  - TipTap

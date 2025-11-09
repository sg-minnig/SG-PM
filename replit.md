# Club Executive Task Manager

## Overview

An AI-powered project management application designed for club executives to manage team workflows, tasks, and transition documents. The system enables executives to upload transition documents, automatically generate tasks using AI (Anthropic Claude), and coordinate team activities through kanban boards, timelines, and task management interfaces.

**Core Purpose**: Streamline the executive transition process by converting handover documents into actionable tasks, tracking team member progress through role-specific timelines, and providing collaborative project management tools.

**Key Features**:
- AI-powered task generation from uploaded transition documents
- Role-based timeline tracking for team members
- Kanban board for visual task management showing complete timelines for all team members
- Document upload and analysis
- Task review and approval workflow
- Team member management with contact information (email, phone, Instagram, advisor details)
- Profile image uploads using Replit Object Storage
- Individual profile editing for team members
- Collaborative event calendar for scheduling team events and important dates

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript running on Vite for development and production builds.

**UI Component System**: 
- Uses shadcn/ui component library (New York style variant) built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Component path aliases configured for clean imports (`@/components`, `@/lib`, etc.)
- Design system inspired by Linear, Notion, and Asana for modern productivity aesthetics

**State Management**:
- TanStack Query (React Query) for server state management and API caching
- React Hook Form with Zod validation for form handling
- Local component state using React hooks

**Routing**: 
- Wouter for client-side routing (lightweight alternative to React Router)
- Routes: Dashboard, Tasks, Kanban, Role Timelines, Calendar, Documents, Team, My Profile, Team Setup (presidents only), Task Review

**Theming**:
- Custom theme provider supporting light/dark modes
- CSS custom properties for color tokens with HSL values
- Theme state persisted to localStorage

### Backend Architecture

**Server Framework**: Express.js with TypeScript running in ESM mode.

**API Design**: RESTful API endpoints with JSON request/response format.

**Key API Routes**:
- `/api/timeline-tasks/:memberId` - GET custom timeline tasks for a team member
- `/api/timeline-tasks` - POST create new custom timeline task
- `/api/timeline-tasks/:id` - PATCH update task, DELETE remove task
- `/api/events` - GET all events, POST create event (authenticated)
- `/api/events/:id` - PATCH update event (owner or president), DELETE remove event (owner or president)
- `/api/profile-image/upload-url` - POST get presigned URL for profile image upload (authenticated, bound to user)
- `/api/documents/upload-url` - POST get presigned URL for document upload (presidents only)
- `/api/documents` - GET all documents, POST create document (presidents only)
- `/api/documents/:id` - DELETE remove document (presidents only)
- `/api/documents/:id/analyze` - POST trigger AI analysis to generate tasks (presidents only)
- `/api/tasks` - GET all tasks, POST create task (presidents only)
- `/api/tasks/:id` - PATCH update task, DELETE remove task (presidents only)
- `/objects/:objectPath` - GET serve uploaded files with server-side validation
- `/api/team-members` - GET all members, POST create member (presidents only)
- `/api/team-members/:id` - PATCH update member (own profile or president), DELETE remove member (presidents only)

**Data Validation**: Zod schemas (shared between client/server via `@shared/schema`) for runtime type safety and validation.

**Storage Layer**: 
- Interface-based storage abstraction (`IStorage`) with methods for users, team members, tasks, documents, and timeline tasks
- Current implementation: Database-backed storage (`DatabaseStorage`) using Drizzle ORM
- PostgreSQL database via Neon serverless driver

**Session Management**: Placeholder for connect-pg-simple session storage (configured but not actively used in current implementation).

### Database Schema (Drizzle ORM)

**Database Dialect**: PostgreSQL (configured via Neon serverless driver)

**Schema Design**:
- `users` - User authentication (id, username, password, role, firstName, lastName, email)
- `team_members` - Team member profiles (id, name, position, email, phone, instagram, advisorName, advisorEmail, avatarColor, profileImageUrl, userId)
- `custom_timeline_tasks` - User-created timeline tasks (id, memberId, title, status, order, isCustom, createdAt)
- `tasks` - AI-generated and manual tasks (id, title, description, status, position, assigneeId, deadline, priority, documentId, aiGenerated, approved, order, createdAt)
- `documents` - Uploaded transition documents (id, name, position, fileUrl, content, size, uploadedAt, uploadedBy, analyzed)

**UUID Strategy**: PostgreSQL `gen_random_uuid()` for primary keys.

**Migration Strategy**: Drizzle Kit for schema migrations with `drizzle-kit push` command.

**Current Status**: Schema defined but application currently uses in-memory storage. Database connection configured but not actively used - the storage layer is designed to be swapped from `MemStorage` to a Drizzle-based implementation.

### External Dependencies

**AI Service**: 
- Anthropic Claude SDK (`@anthropic-ai/sdk`) for document analysis and task generation
- Purpose: Parse transition documents and automatically generate actionable tasks
- Integration point: Task Review page where AI-generated tasks are reviewed/approved

**Database Service**: 
- Neon Serverless PostgreSQL (`@neondatabase/serverless`)
- Connection configured via `DATABASE_URL` environment variable
- Drizzle ORM for query building and schema management

**Third-Party UI Libraries**:
- Radix UI primitives for accessible component foundations
- Lucide React for icon system
- date-fns for date manipulation
- cmdk for command palette functionality
- class-variance-authority (CVA) for component variant management

**Build Tools**:
- Vite for frontend bundling and dev server
- esbuild for backend bundling in production
- tsx for TypeScript execution in development
- Replit-specific plugins for development environment integration

**Styling Dependencies**:
- Tailwind CSS with PostCSS
- tailwind-merge and clsx for conditional class composition
- Google Fonts (Inter, JetBrains Mono) loaded via CDN

**Development Environment**: 
- Configured for Replit with cartographer and dev banner plugins
- Hot module replacement (HMR) via Vite
- Runtime error overlay for development feedback

**Object Storage**:
- Replit Object Storage (Google Cloud Storage backend) for profile images and documents
- Presigned URL upload flow for secure direct-to-storage uploads
- User-bound upload paths:
  - Profile images: `/objects/profile-images/{userId}/{uuid}`
  - Documents: `/objects/documents/{userId}/{uuid}-{filename}`
- Server-side validation: 5MB max size for images, image content-types only
- Public read access for profile images, documents restricted to authenticated users
- Document upload supports .txt files with automatic text extraction OR manual content paste
- ACL policy framework for future access control needs

## Recent Changes (November 2025)

### AI-Powered Document Analysis and Task Generation

**Feature Overview**: Presidents can upload transition documents, select which role/position the document pertains to, and trigger AI analysis to automatically generate role-specific tasks.

**Document Upload Flow**:
1. Presidents navigate to the Documents page (presidents only)
2. Choose between:
   - **File Upload**: Upload .txt files with automatic text extraction
   - **Paste Content**: Manually paste document text and provide a name
3. Select the target role/position (e.g., "President", "Treasurer", "VP Events")
4. Document is uploaded to object storage and metadata stored in database

**AI Analysis**:
- Triggered manually by presidents via "Analyze with AI" button
- Uses Anthropic Claude 3.5 Sonnet to analyze document content
- Generates 5-15 actionable, role-specific tasks with:
  - Title and description
  - Priority level (high, medium, low)
  - Automatic ordering
- Tasks marked as `aiGenerated: true` and `approved: false`

**Task Review Workflow**:
1. Presidents navigate to Task Review page to see AI-generated tasks
2. For each task, presidents can:
   - **Edit**: Modify title, description, and priority
   - **Approve**: Add task to role-specific timelines
   - **Reject**: Delete task permanently
3. Approved tasks appear in:
   - Kanban board for the assigned position
   - Role Timelines for team members in that position
   - Task lists filtered by position

**Technical Implementation**:
- Frontend: Documents page with dual-mode upload (file/paste)
- Frontend: Task Review page for approval workflow
- Backend: Document storage with position assignment
- Backend: AI integration using Anthropic SDK
- Backend: Task CRUD operations with approval state management
- Security: Presidents-only access, user-bound document uploads, server-side validation

**Navigation**:
- Documents page visible only to presidents
- Task Review page visible only to presidents (accessible via sidebar)

### Collaborative Event Calendar

**Feature Overview**: Team members can create, view, edit, and delete events through a shared calendar interface. All authenticated users have full access to create events, while edit/delete permissions are restricted to event owners or presidents.

**Calendar Features**:
- Month view calendar grid showing all events
- Visual color coding for different event types (6 color options)
- Upcoming events list with detailed information
- Event details include: title, description, start/end dates, location, color
- Click-to-create events on calendar day cells
- Full CRUD operations with proper authorization

**User Permissions**:
- Any authenticated user can create events
- Users can edit/delete their own events
- Presidents can edit/delete any event
- Automatic event ownership tracking via `createdBy` field

**Technical Implementation**:
- Frontend: Calendar page using React Hook Form with zodResolver for validation
- Frontend: Month navigation with previous/next/today controls
- Frontend: Form schema with z.coerce.date() for proper date serialization
- Backend: Event API with proper authentication and authorization checks
- Backend: Date conversion from ISO strings to Date objects for validation
- Backend: Explicit null handling for optional endDate field
- Database: events table with title, description, dates, location, color, and creator tracking

**Data Validation**:
- Required fields: title, startDate, color
- Optional fields: description, endDate, location
- Date serialization handled via coercion in both frontend and backend
- Form validation prevents submission of invalid data

**Navigation**:
- Calendar page accessible to all authenticated users via sidebar

### Visual Design: Lovable-Inspired Gradient

**Design Update**: Updated the application's background gradient to match the Lovable aesthetic with soft, luminous blue-purple-pink-orange transitions.

**Color Palette**:
- **Light Mode**: Flows through blue (230°) → purple (280°) → pink (330°) → coral (15°) → blue (220°) with 84-90% lightness for a soft, dreamy appearance
- **Dark Mode**: Same hue progression with 15-20% lightness for deep, sophisticated tones that maintain readability

**Implementation**:
- Updated `body` gradient in `client/src/index.css` for global background
- Updated `.pastel-rainbow` class for landing page consistency
- Full saturation (100%) in light mode creates luminous, glowing aesthetics
- 60% saturation in dark mode for refined elegance
- Smooth 135° diagonal gradient with evenly spaced color stops
- Maintains strong text contrast in both light and dark themes

**Technical Details**:
- Uses HSL color model for precise control over hue, saturation, and lightness
- `background-attachment: fixed` keeps gradient stationary during scrolling
- Consistent gradient applied across both landing page and authenticated views
- Inspired by Lovable's signature gradient design
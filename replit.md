# Club Executive Task Manager

## Overview

An AI-powered project management application designed for club executives to manage team workflows, tasks, and transition documents. The system enables executives to upload transition documents, automatically generate tasks using AI (Anthropic Claude), and coordinate team activities through kanban boards, timelines, and task management interfaces.

**Core Purpose**: Streamline the executive transition process by converting handover documents into actionable tasks, tracking team member progress through role-specific timelines, and providing collaborative project management tools.

**Key Features**:
- AI-powered task generation from uploaded transition documents
- Role-based timeline tracking for team members
- Kanban board for visual task management
- Document upload and analysis
- Task review and approval workflow
- Team member management and progress tracking

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
- Routes: Dashboard, Tasks, Kanban, Role Timelines, Documents, Team, Task Review

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

**Data Validation**: Zod schemas (shared between client/server via `@shared/schema`) for runtime type safety and validation.

**Storage Layer**: 
- Interface-based storage abstraction (`IStorage`) allowing multiple implementations
- Current implementation: In-memory storage (`MemStorage`) using ES6 Maps
- Designed to be swapped with database-backed storage (Drizzle ORM schemas defined for PostgreSQL migration)

**Session Management**: Placeholder for connect-pg-simple session storage (configured but not actively used in current implementation).

### Database Schema (Drizzle ORM)

**Database Dialect**: PostgreSQL (configured via Neon serverless driver)

**Schema Design**:
- `users` - User authentication (id, username, password)
- `team_members` - Team member profiles (id, name, role, email, avatarColor)
- `custom_timeline_tasks` - User-created timeline tasks (id, memberId, title, status, order, isCustom, createdAt)
- `tasks` - Project tasks (id, title, description, status, assigneeId, deadline, priority, documentId, aiGenerated, approved, createdAt)
- `documents` - Uploaded documents (id, name, size, uploadedAt, analyzed)

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
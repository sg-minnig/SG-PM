# Design Guidelines: AI-Powered Club Executive Project Management App

## Design Approach

**Selected Framework:** Design System Approach with Modern Productivity Inspiration

Drawing from Linear, Notion, and Asana for contemporary project management aesthetics, grounded in Fluent Design principles for productivity-focused applications. This ensures consistency across complex data views while maintaining a clean, efficient interface.

**Core Principles:**
1. Information clarity over decoration
2. Efficient workflows with minimal friction
3. Consistent patterns across all views
4. Professional aesthetic suitable for executive use

## Typography System

**Font Stack:**
- Primary: Inter (Google Fonts) - Interface text, buttons, labels
- Secondary: JetBrains Mono - Code/document snippets, file names

**Hierarchy:**
- Page Titles: text-3xl font-semibold
- Section Headers: text-xl font-semibold
- Card Titles: text-lg font-medium
- Body Text: text-base font-normal
- Labels/Metadata: text-sm font-medium
- Captions: text-xs font-normal

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, and 12 consistently
- Component padding: p-4 or p-6
- Section gaps: gap-6 or gap-8
- Page margins: m-8 or m-12
- Card spacing: space-y-4

**Grid System:**
- Dashboard: 3-column grid (lg:grid-cols-3) with responsive collapse
- Kanban: Flexible column layout with min-w-80 per column
- Task lists: Single column with dividers

## Core Components

### Navigation
**Sidebar Navigation (Fixed Left):**
- Width: w-64, collapsible to w-16 on mobile
- Stack navigation items vertically with icons (Heroicons) and labels
- Include: Dashboard, Tasks, Kanban, Documents, Team, Settings
- Active state: Subtle background treatment, semibold text

### Dashboard Layout
**Multi-Panel Design:**
- Header: Quick stats (4-column grid showing total tasks, in progress, completed, team members)
- Main Content: 2-column layout
  - Left: Recent tasks list with status badges
  - Right: Upcoming deadlines timeline
- Bottom: Activity feed showing AI-generated tasks and recent changes

### Document Upload Interface
**Dropzone Area:**
- Large central dropzone (min-h-64) with dashed border
- Icon (upload cloud from Heroicons) centered above text
- Below dropzone: Grid of uploaded documents (grid-cols-2 lg:grid-cols-3)
- Each document card: File icon, name (truncated), size, upload date, analyze button

### AI Task Review Interface
**Split-Panel Layout:**
- Left Panel (w-2/5): Document preview/text extract
- Right Panel (w-3/5): Generated tasks list
- Each task card includes:
  - Task title (editable input)
  - Description textarea
  - Assignee dropdown with avatar
  - Deadline date picker
  - Approve/Reject/Edit action buttons (horizontal layout)

### Kanban Board
**Column-Based Layout:**
- 3 columns: "Not Started", "In Progress", "Completed"
- Each column: Header with count badge, scrollable card container
- Task cards (p-4, rounded-lg, shadow-sm):
  - Priority indicator (vertical bar, 2px wide, left edge)
  - Title (text-base font-medium)
  - Assignee avatar (bottom left, size-8)
  - Deadline badge (bottom right, text-xs)
  - Drag handle icon (top right)

### Team Profiles
**Card Grid Layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3):**
- Profile card structure:
  - Avatar (size-16, centered top)
  - Name (text-lg font-semibold, centered)
  - Role (text-sm, centered below name)
  - Contact info (email icon + text, stacked)
  - Task count badge

### Task Components
**Task List Item:**
- Checkbox (left, size-5)
- Task details (flex-1):
  - Title with status badge inline
  - Metadata row: assignee avatar + deadline + category tag
- Actions menu (right, 3-dot icon)

**Status Badges:**
- Pill shape (rounded-full, px-3, py-1)
- Text: text-xs font-medium uppercase tracking-wide

## Icon System

Use Heroicons (outline style) via CDN for all interface icons:
- Navigation: home, clipboard-document-list, view-columns, document-arrow-up, users, cog
- Actions: plus, pencil, trash, check, x-mark
- Status: clock, arrow-path, check-circle
- File types: document-text, folder

## Component Patterns

**Cards:**
- Border: border, rounded-lg
- Padding: p-6
- Shadow: shadow-sm with hover:shadow-md transition

**Buttons:**
- Primary: px-4 py-2 rounded-md font-medium
- Secondary: px-4 py-2 rounded-md border font-medium
- Icon buttons: p-2 rounded-md

**Form Inputs:**
- Text fields: px-3 py-2 rounded-md border w-full
- Dropdowns: Same styling as text fields
- Textareas: px-3 py-2 rounded-md border min-h-24

**Modal Overlays:**
- Backdrop: Fixed overlay with backdrop-blur
- Content container: max-w-2xl, centered, p-6, rounded-lg

## Animations

Minimal, functional animations only:
- Transitions: transition-all duration-200 for hover states
- Drag-and-drop: Subtle lift effect (shadow increase) during drag
- Page transitions: None (instant navigation)

## Images

No hero images required for this application interface. All visual elements should be functional (avatars, document thumbnails, icons).

**Avatar placeholders:** Use initials in circular containers
**Document thumbnails:** File type icons with preview capability on hover
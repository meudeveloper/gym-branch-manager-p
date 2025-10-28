# Planning Guide

A comprehensive multi-branch gym attendance management system that enables gym operators to manage branches, rooms, members, track real-time attendance with check-in/out functionality, and generate detailed reports across their entire operation.

**Experience Qualities**:
1. **Efficient** - Streamlined workflows for rapid check-ins, member registration, and instant access to critical information
2. **Professional** - Clean, organized interface that conveys competence and reliability to gym staff and administrators
3. **Responsive** - Seamlessly adapts from desktop management stations to mobile tablets for floor staff performing check-ins

**Complexity Level**: Complex Application (advanced functionality, accounts)
- This is a multi-entity business management system with hierarchical data (branches → rooms → members), real-time state tracking (who's currently in the gym), time-based operations (auto-checkout, membership expiry), photo capture/storage, and comprehensive reporting with multiple pivot views.

## Essential Features

### Branch Management
- **Functionality**: Create, read, update, and deactivate gym branches with details (name, code, address, hours, status)
- **Purpose**: Support multi-location gym operations with centralized management
- **Trigger**: Admin clicks "Add Branch" button in branches section
- **Progression**: Click Add Branch → Fill form (name, code, address, hours) → Save → Branch appears in list → Can edit/deactivate later
- **Success criteria**: Branches persist across sessions, can be filtered by active status, room count displays correctly

### Room Management
- **Functionality**: CRUD operations for rooms within each branch (name, capacity, status) with branch association
- **Purpose**: Organize gym floor space and track capacity per area for safety and operational efficiency
- **Trigger**: User selects a branch and clicks "Add Room" or "Manage Rooms"
- **Progression**: Select branch → Add Room → Enter name + capacity → Save → Room appears under branch → Members can be assigned to room
- **Success criteria**: Rooms correctly associate with parent branch, capacity tracking works, inactive rooms hidden from check-in

### Member Registration
- **Functionality**: Comprehensive member onboarding with personal details, photo capture/upload, branch/room assignment, and membership plan configuration
- **Purpose**: Maintain complete member records with visual identification for check-in verification
- **Trigger**: Staff clicks "Add Member" button from members page
- **Progression**: Click Add Member → Fill form (name, phone, gender, birthday, address) → Select branch & room → Choose membership plan (1/3/6/12 months) → Set start date (auto-calculate end date) → Capture/upload photo → Save → Member card appears in list with avatar
- **Success criteria**: Photo stored as base64, membership dates calculated correctly, member searchable by name/phone, avatar displays in 48px circle

### Attendance Check-in/Check-out
- **Functionality**: Quick check-in via phone lookup, automatic status tracking, manual check-out or auto-checkout after 2 hours
- **Purpose**: Track gym occupancy in real-time, ensure only active members access facilities, generate attendance records
- **Trigger**: Staff enters member phone number or scans QR (simulated with phone input)
- **Progression**: Enter phone → System finds member → Validates active membership → Records check-in time + branch + room → Member appears in "Currently Inside" list with photo + name + duration → Staff/system marks checkout → Session closed with total duration
- **Success criteria**: Only active members can check in, duplicate check-ins prevented, auto-checkout runs every minute checking 2hr threshold, duration calculated correctly

### Live Attendance View
- **Functionality**: Real-time dashboard showing all members currently checked in, filterable by branch/room with photo, name, and time elapsed
- **Purpose**: Monitor facility occupancy, quickly identify who's present, ensure capacity limits respected
- **Trigger**: Staff navigates to Attendance page or switches to "Currently Inside" tab
- **Progression**: Open attendance → See live list → Filter by branch/room → View member photos + check-in times → Manual checkout option per member
- **Success criteria**: Updates when check-ins/outs occur, time elapsed updates live, filtered counts accurate

### Attendance History & Reports
- **Functionality**: Three report views - Daily (all sessions for date), Monthly (aggregate stats), Member (individual history with total duration and frequency)
- **Purpose**: Operational insights, member engagement tracking, billing verification, trend analysis
- **Trigger**: User navigates to Reports tab and selects Daily/Monthly/Member view
- **Progression**: Select report type → Choose date/month/member → View table with sessions → See metrics (total visits, avg duration, peak hours) → Export to CSV
- **Success criteria**: Date filtering accurate, calculations correct (total time, visit count), CSV export includes all visible data, member frequency score computed

### Member Search & Filter
- **Functionality**: Real-time search by name/phone, filter by branch, room, membership status (active/expired/expiring soon)
- **Purpose**: Rapidly locate members for check-in assistance, membership renewal, or account updates
- **Trigger**: User types in search box or selects filter dropdown
- **Progression**: Type search term → List filters in real-time → Select filters → Combined search+filter applied → Click member to view/edit details
- **Success criteria**: Search debounced (300ms), case-insensitive, filters combine with AND logic, "expiring soon" shows <7 days to expiry

## Edge Case Handling

- **Expired Membership Check-in** - Prevent check-in, show toast "Membership expired on [date]. Please renew.", highlight member card in red
- **Already Checked In** - If member attempts check-in while already inside, show "Already checked in at [time]" with option to check out instead
- **Invalid Phone Search** - Display "No member found with phone: [number]" with suggestion "Try different number or register new member"
- **Photo Capture Failure** - If camera unavailable/denied, gracefully fallback to file upload only with message "Camera unavailable - please select photo file"
- **Room Capacity Exceeded** - Warning (not blocking) when check-in would exceed room capacity: "Room at [X/Y capacity]"
- **Concurrent Modifications** - Last write wins with useKV, show toast "Data updated" when refetching
- **Empty States** - Show helpful CTAs: "No members yet → Add first member", "No branches → Create your first gym location"
- **Auto-checkout Edge** - If app closed during active session, auto-checkout runs on next app load checking timestamps

## Design Direction

The design should feel professional, efficient, and trustworthy - like enterprise gym management software with a modern SaaS aesthetic. Clean and organized with clear information hierarchy, emphasizing speed and clarity for staff performing repetitive check-in operations. Minimal interface that reduces cognitive load while presenting dense information (member lists, stats) in scannable formats.

## Color Selection

**Triadic color scheme** - Using fitness-industry aligned colors (energetic orange, trustworthy blue, neutral grays) to balance professionalism with the dynamic nature of gym operations.

- **Primary Color**: Deep Charcoal Blue `oklch(0.25 0.02 250)` - Conveys professionalism, trust, stability for business management software
- **Secondary Colors**: 
  - Light Blue Gray `oklch(0.92 0.01 250)` - Subtle backgrounds for cards and sections without overwhelming
  - Soft Slate `oklch(0.65 0.02 250)` - Muted text and secondary information
- **Accent Color**: Energetic Orange `oklch(0.68 0.15 45)` - Action buttons, active status indicators, check-in confirmations to inject energy
- **Foreground/Background Pairings**:
  - Background (White `oklch(1 0 0)`): Charcoal text `oklch(0.25 0.02 250)` - Ratio 8.7:1 ✓
  - Card (Light Gray `oklch(0.98 0 0)`): Charcoal text `oklch(0.25 0.02 250)` - Ratio 8.4:1 ✓
  - Primary (Charcoal Blue `oklch(0.25 0.02 250)`): White text `oklch(1 0 0)` - Ratio 8.7:1 ✓
  - Secondary (Light Blue Gray `oklch(0.92 0.01 250)`): Charcoal text `oklch(0.25 0.02 250)` - Ratio 6.2:1 ✓
  - Accent (Energetic Orange `oklch(0.68 0.15 45)`): White text `oklch(1 0 0)` - Ratio 4.9:1 ✓
  - Muted (Soft Slate `oklch(0.88 0.01 250)`): Dark Slate text `oklch(0.45 0.02 250)` - Ratio 5.1:1 ✓

## Font Selection

Professional sans-serif that balances readability for dense data tables with modern aesthetics. **Inter** for its excellent legibility at small sizes (member lists, stats) and geometric precision that feels organized and systematic.

- **Typographic Hierarchy**:
  - H1 (Page Titles): Inter Bold / 32px / -0.02em letter spacing / 1.2 line height
  - H2 (Section Headers): Inter Semibold / 24px / -0.01em / 1.3 line height
  - H3 (Card Titles): Inter Semibold / 18px / normal / 1.4 line height
  - Body (Default Text): Inter Regular / 15px / normal / 1.5 line height
  - Small (Meta Info): Inter Regular / 13px / normal / 1.4 line height
  - Label (Form Labels): Inter Medium / 14px / normal / 1.4 line height
  - Button Text: Inter Semibold / 14px / normal / 1 line height

## Animations

Animations should feel snappy and utilitarian - prioritizing speed over delight since staff use this repeatedly throughout the day. Motion serves functional purposes: confirming actions (check-in success), directing attention (new member in list), and smooth transitions between data views.

- **Purposeful Meaning**: Success confirmations use brief scale + fade (check-in button → green checkmark flash). Modal entries slide up with slight bounce to feel responsive. Loading states use subtle pulse rather than spinning to feel less "waiting".
- **Hierarchy of Movement**: Check-in/out actions get prominent feedback (200ms scale + color change). Navigation between tabs uses quick fade (150ms). Member list updates fade in new items (100ms). Toasts slide in from top-right.

## Component Selection

- **Components**:
  - **Card** - Primary container for member cards, branch cards, stat cards with subtle shadow for depth
  - **Button** - Primary (orange accent), Secondary (outlined), Destructive (red) for all actions, use `size="sm"` for dense layouts
  - **Input** - Standard text inputs with labels, includes phone/date types, error states shown inline
  - **Select** - Branch/room dropdowns, membership plan selection, filter controls
  - **Dialog** - Full-screen mobile, centered desktop for Add/Edit Member (complex form), confirmation dialogs for delete
  - **Table** - Reports and attendance history with sortable columns, alternating row colors
  - **Tabs** - Main navigation (Members / Attendance / Reports / Branches), report sub-navigation (Daily/Monthly/Member)
  - **Avatar** - Circular 48px for member photos throughout app with fallback initials
  - **Badge** - Status indicators (Active/Expired/Expiring), room capacity (12/20), attendance count
  - **Form** - React Hook Form integration for all forms with inline validation
  - **ScrollArea** - Member lists, attendance lists when >10 items
  - **Separator** - Dividing sections within cards
  - **Sonner Toasts** - All feedback messages (success, error, warning)
  
- **Customizations**:
  - **MemberCard** - Custom component combining Card + Avatar + Badge + metadata grid
  - **AttendanceStatusPill** - Shows "Inside" with green dot + duration, custom styling
  - **QuickCheckIn** - Compact input + button combo for rapid phone entry
  - **PhotoCapture** - Custom component wrapping file input with camera capture, preview, and crop
  - **StatCard** - Card variant with large number + label + trend indicator for dashboard
  
- **States**:
  - Buttons: Default (solid color) → Hover (darken 10%) → Active (scale 0.98) → Disabled (opacity 50%, no interaction)
  - Inputs: Default (border-input) → Focus (ring-2 ring-ring, border-primary) → Error (border-destructive, text-destructive below) → Disabled (bg-muted)
  - Cards: Default (subtle shadow) → Hover (shadow-md, lift 2px) for clickable cards → Selected (ring-2 ring-primary)
  
- **Icon Selection**:
  - **Users** - Members section navigation
  - **Buildings** - Branches section
  - **ClipboardText** - Reports section
  - **DoorOpen** - Check-in action
  - **SignOut** - Check-out action  
  - **Plus** - Add new (member, branch, room)
  - **MagnifyingGlass** - Search input
  - **Funnel** - Filter controls
  - **Camera** - Photo capture
  - **Calendar** - Date pickers
  - **Clock** - Duration, time displays
  - **CheckCircle** - Active status
  - **XCircle** - Expired status
  - **Warning** - Expiring soon
  - **Download** - Export to CSV
  
- **Spacing**:
  - Page padding: `p-6` (desktop), `p-4` (mobile)
  - Card padding: `p-6` (desktop), `p-4` (mobile)
  - Gap between cards: `gap-4`
  - Gap within card sections: `gap-3`
  - Form field spacing: `space-y-4`
  - Button group gaps: `gap-2`
  
- **Mobile**:
  - Navigation tabs become bottom fixed bar on mobile with icons only
  - Member cards stack vertically with full width
  - Add buttons become fixed bottom-right FAB (floating action button) on mobile
  - Dialogs become full-screen sheets on mobile (using Sheet component)
  - Tables become scrollable cards showing key fields only, full view on tap
  - Search bar fixed at top, filters collapse into bottom sheet
  - Grid layouts: 3 columns desktop → 1 column mobile
  - Font sizes reduce 1-2px on mobile for better density

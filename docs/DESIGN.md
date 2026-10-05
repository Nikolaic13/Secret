# FoodShare App UI/UX Design Patterns & Improvement Plan

This document outlines the UI/UX design patterns and the plan to revamp the "FoodShare" application's dashboards (Admin, Barangay, Donor, Municipal) and authentication flows. It serves as a reference for all future UI/UX development.

## 1. High-Level Improvement Plan

The objective is to move from a standard "out-of-the-box" component look to a **premium, clean, and modern** web application.

### Phase 1: Foundation & Theming
- [ ] **Refine Color Palette:** Enhance the current green primary color with richer hues and ensure dark mode contrast is perfectly balanced.
- [ ] **Typography Audit:** Ensure the `geist` font is utilized correctly across all headings and body text, with appropriate font weights (e.g., medium for buttons, semibold for card titles).
- [ ] **Global Styling:** Add subtle utility classes to `globals.css` for consistent focus rings, selection colors, and scrollbars.

### Phase 2: Layout & Navigation
- [ ] **Unified Dashboard Shell:** Create a high-quality layout wrapper for all role dashboards (Donor, Admin, Barangay, Municipal) featuring a collapsible sidebar with sleek icons, and a top app bar (breadcrumbs, search, user profile).
- [ ] **Page Transitions:** Implement subtle fade-in animations for page loads.

### Phase 3: Component Polish
- [ ] **Data Display (Cards & Tables):** Upgrade dashboard widgets to use "glassmorphism" effects or very soft shadows (`shadow-sm` on rest, `shadow-md` on hover) with slightly more rounded corners (`rounded-xl` for cards).
- [ ] **Interactive Elements:** Add micro-interactions (e.g., scale up `1.02` on button hover, smooth transition durations).
- [ ] **Empty States & Loading:** Replace generic "No data" text with visually pleasing empty state components (icon + description + action button). Use skeleton loaders instead of generic spinners.

### Phase 4: Feedback & Forms
- [ ] **Form Validation:** Use React Hook Form + Zod for real-time, inline validation with clear, non-intrusive error messages (using the `--destructive` red color).
- [ ] **Toast Notifications:** Standardize the use of `sonner` for all success/error/info notifications.

---

## 2. UI/UX Design Patterns (Reference)

### 2.1 Colors & Theming
- **Primary Action:** Use `bg-primary text-primary-foreground`. Hover state should slightly darken or lower opacity (`hover:opacity-90`).
- **Secondary Action:** Use outline or subtle background `bg-secondary text-secondary-foreground`.
- **Destructive:** Used strictly for deletions or critical errors (`bg-destructive text-destructive-foreground`).
- **Borders:** Keep borders subtle (`border-border`) and use them to separate distinct sections, rather than boxing everything in.

### 2.2 Typography
- **Headings (Page level):** `text-3xl font-bold tracking-tight`
- **Section Titles (Card level):** `text-lg font-semibold`
- **Body Text:** `text-sm text-muted-foreground` for descriptions, `text-sm text-foreground` for standard data.
- **Labels:** `text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70`

### 2.3 Cards & Containers
Cards should feel light and elevate content.
```tsx
<Card className="rounded-xl border border-border/50 shadow-sm transition-all hover:shadow-md">
  <CardHeader>
    <CardTitle className="text-lg font-semibold">Title</CardTitle>
    <CardDescription className="text-sm text-muted-foreground">Description</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### 2.4 Buttons & Interactive Elements
- Always include `transition-all duration-200`.
- Add active states `active:scale-[0.98]`.
- For icon buttons, use a rounded shape `rounded-full` or `rounded-lg` with `size="icon"`.

### 2.5 Empty States
When a list, table, or dashboard widget has no data, present a friendly empty state:
```tsx
<div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
  <div className="rounded-full bg-muted p-4 mb-4">
    <InboxIcon className="h-8 w-8 text-muted-foreground" />
  </div>
  <h3 className="text-lg font-semibold">No requests found</h3>
  <p className="text-sm text-muted-foreground mt-1 mb-4">You haven't received any food requests yet.</p>
  <Button>Create Request</Button>
</div>
```

### 2.6 Loading Skeletons
Avoid layout shift by rendering skeleton shapes that match the loaded content.
```tsx
import { Skeleton } from "@/components/ui/skeleton"

<div className="space-y-3">
  <Skeleton className="h-4 w-[250px] rounded-lg" />
  <Skeleton className="h-4 w-[200px] rounded-lg" />
</div>
```

### 2.7 Data Tables & Lists
- Use alternating row colors or hover highlights (`hover:bg-muted/50`).
- Align numbers to the right.
- Use badging for statuses (e.g., `Pending`, `Approved`, `Distributed`) with distinct background hues.

### 2.8 Forms
- Stack inputs with their labels cleanly.
- Use `shadcn/ui` Form components hooked into `zod` schemas.
- Provide helper text under complex inputs.

## 3. Implementation Guidelines
- **Consistency:** Never use arbitrary colors or spacing. Always stick to Tailwind tokens (e.g., `p-4`, `gap-6`, `text-primary`).
- **Responsiveness:** Always test layouts on mobile (`sm:` breakpoints) to ensure the sidebar collapses into a hamburger menu and grids switch to 1 column.
- **Accessibility:** Ensure all inputs have labels (or `aria-label`), contrast is sufficient, and interactive elements are reachable via keyboard.

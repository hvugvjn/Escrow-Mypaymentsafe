## Packages
framer-motion | Page transitions and scroll-triggered animations
date-fns | Human-readable date formatting
react-day-picker | Calendar date selection for milestones
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility to merge tailwind classes without style conflicts

## Notes
- Relying on Replit Auth for authentication flows (`/api/login`, `/api/logout`, `/api/auth/user`).
- Using standard `api.X.path` from `@shared/routes` for backend calls.
- Role-based flow: Users are redirected to `/profile/complete` if their role is missing.
- Milestone amounts are entered in dollars but converted to cents for the API.

# Project Naming & Style Rules

## File Naming Conventions

1. **Eliminate Redundant Category Names in Specialized Folders:**
   - In folders where the directory name specifies the entity type (e.g. `store/`, `services/`), do **not** include the category suffix in the file name (e.g. use `use-auth.ts` instead of `useAuthStore.ts` inside `store/`, and `auth.ts` instead of `authService.ts` inside `services/`).
   - Exception: Pages inside `pages/` keep their `[Name]Page.tsx` convention.

2. **Hook and Store File Naming Format:**
   - Always name custom hook and store files using the `use-[name]` format in kebab-case (e.g., `use-auth.ts`, `use-flight.ts`, `use-flight-search.ts`).

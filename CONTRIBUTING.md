# Contributing to OpenTaloyhtiö OS

We welcome contributions to build the future of Finnish housing management! Please follow the guidelines below to ensure a smooth collaboration process.

## Branching Strategy

We use a **Feature Branch Workflow**.

1.  **Main Branch (`main`)**: This is the production-ready code. Direct commits to `main` are restricted.
2.  **Feature Branches (`feature/name-of-feature`)**: Create a new branch for every new feature or bug fix.
    -   Naming convention: `feature/mml-integration`, `fix/invoice-calculation`, `chore/update-dependencies`.

### Workflow Steps

1.  **Checkout main and pull latest changes:**
    ```bash
    git checkout main
    git pull origin main
    ```
2.  **Create your branch:**
    ```bash
    git checkout -b feature/my-cool-feature
    ```
3.  **Commit your changes:**
    -   Write clear, descriptive commit messages in English.
    -   Example: `feat: Add automated validation for renovation permits`
4.  **Push to remote:**
    ```bash
    git push origin feature/my-cool-feature
    ```
5.  **Open a Pull Request (PR):**
    -   Target `main`.
    -   Describe what the change does and link any relevant tasks.

## Coding Standards

-   **Language**:
    -   **Code & Comments**: English.
    -   **User Interface (UI)**: Finnish (Professional terminology).
-   **Framework**: Next.js 16 (App Router). Use Server Components by default; add `'use client'` only when necessary.
-   **Styling**: Tailwind CSS. Avoid custom CSS files; use utility classes.
-   **State**: Use Zustand for client-side global state.
-   **Type Safety**: TypeScript is strict. Avoid `any`.

## Legal & Compliance

When contributing to core logic, ensure adherence to:
-   **Asunto-osakeyhtiölaki** (Limited Liability Housing Companies Act).
-   **YSE 1998** (General Conditions for Building Contracts).
-   **GDPR**: Ensure tenant data privacy.

## Testing

-   Currently, we rely on manual verification of the "Mock Store" logic.
-   Ensure your changes update the `src/lib/store.ts` mock data correctly if backend logic is simulated.

# Jedligram Frontend - First Release

## Description

Jedligram Frontend is a React and TypeScript single-page app for community-driven discussions: threads, posts, comments, voting, profile editing, and authentication.

The routing shell is defined in [src/App.tsx](src/App.tsx), API integration lives in [src/api](src/api), localization is configured in [src/i18n.ts](src/i18n.ts), and theme state is handled in [src/theme.ts](src/theme.ts).

This release focuses on:

- A modular page/component structure under [src/Pages](src/Pages) and [src/Components](src/Components)
- Typed API wrappers under [src/api](src/api)
- Browser-first UX with mobile bridge support via Capacitor in [src/Components/Utils/NavigationManager.tsx](src/Components/Utils/NavigationManager.tsx)

## Requirements

- [Node.js](https://nodejs.org/) 20.x LTS or newer
- [npm](https://www.npmjs.com/) 10 or newer
- A modern browser for local development
- Optional, for Android builds: [Android Studio](https://developer.android.com/studio), Android SDK, and a Java runtime compatible with the Gradle setup in [android](android)

## Installation

1. Clone the repository and move into the project root.
2. Install dependencies:

```bash
npm install
```

3. Create your environment file from [\.env.example](.env.example):

```bash
cp .env.example .env
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env
```

4. Update values in [\.env](.env) based on the environment variable reference below.
5. Run the development server:

```bash
npm run dev
```

6. Build for production:

```bash
npm run build
```

7. Optional, rebuild and run Android app via Capacitor:

```bash
npm run android:rebuild
```

## Environment Variables

Vite only exposes variables prefixed with VITE\_ to client code. See [\.env.example](.env.example).

| Variable                       | Required | Default fallback      | What it does                                                                                             | Used in                                                                                                                                                                                                                              |
| ------------------------------ | -------- | --------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| VITE_BACKEND_URL               | Yes      | http://localhost:8000 | Sets the Axios base URL for all API calls.                                                               | [src/api/httpClient.ts](src/api/httpClient.ts)                                                                                                                                                                                       |
| VITE_AUTH_TOKEN_NAME           | No       | jedligram_token       | Sets the localStorage key used to read and write the auth token.                                         | [src/api/httpClient.ts](src/api/httpClient.ts), [src/api/auth.ts](src/api/auth.ts), [src/Pages/Profile/UserProfile.tsx](src/Pages/Profile/UserProfile.tsx), [src/Pages/Community/CreatePost.tsx](src/Pages/Community/CreatePost.tsx) |
| VITE_LOCAL_STORAGE_PROFILE_KEY | No       | jedligram_profile     | Sets the localStorage key for persisted profile data in auth helpers.                                    | [src/api/auth.ts](src/api/auth.ts)                                                                                                                                                                                                   |
| VITE_PROFILE_STORAGE_KEY       | No       | jedligram_profile     | Sets the localStorage key used by profile page logic. Keep this equal to VITE_LOCAL_STORAGE_PROFILE_KEY. | [src/Pages/Profile/UserProfile.tsx](src/Pages/Profile/UserProfile.tsx)                                                                                                                                                               |

Recommended [\.env](.env) values:

```dotenv
VITE_BACKEND_URL=https://your-backend.example.com
VITE_AUTH_TOKEN_NAME=jedligram_token
VITE_LOCAL_STORAGE_PROFILE_KEY=jedligram_profile
VITE_PROFILE_STORAGE_KEY=jedligram_profile
```

## Interesting Techniques Used

- Hash-aware deep linking and smooth in-page targeting in [src/App.tsx](src/App.tsx) using [Location.hash](https://developer.mozilla.org/en-US/docs/Web/API/Location/hash), [decodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent), [Element.scrollIntoView](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView), and [Window.scrollTo](https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo).
- Safe object URL lifecycle for file previews in [src/Components/DragnDrop/DragnDrop.tsx](src/Components/DragnDrop/DragnDrop.tsx) with [URL.createObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static) and cleanup via [URL.revokeObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL_static).
- Drag-and-drop upload handling in [src/Components/DragnDrop/DragnDrop.tsx](src/Components/DragnDrop/DragnDrop.tsx), combining [DragEvent](https://developer.mozilla.org/en-US/docs/Web/API/DragEvent) behavior and input fallback.
- Event-driven UI synchronization across components using browser events in [src/theme.ts](src/theme.ts), [src/Pages/Auth/Verification.tsx](src/Pages/Auth/Verification.tsx), and [src/Pages/Community/hooks/useCommunity.ts](src/Pages/Community/hooks/useCommunity.ts), based on [Event](https://developer.mozilla.org/en-US/docs/Web/API/Event) and [dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent).
- Theme orchestration using [Window.matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia), [prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme), [HTMLElement.dataset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset), and CSS [color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme) in [src/theme.ts](src/theme.ts) and [src/index.css](src/index.css).
- Multipart uploads for posts, thread images, and profile images using [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) in [src/api/posts.ts](src/api/posts.ts), [src/api/threads.ts](src/api/threads.ts), and [src/api/users.ts](src/api/users.ts).
- Native share flow for post/community links in [src/Pages/Community/components/PostItem/SharePost.tsx](src/Pages/Community/components/PostItem/SharePost.tsx) and [src/Pages/Community/hooks/useCommunity.ts](src/Pages/Community/hooks/useCommunity.ts) using the [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share).
- Capacitor app lifecycle integration in [src/Components/Utils/NavigationManager.tsx](src/Components/Utils/NavigationManager.tsx) for deep links and Android hardware back button behavior.

## Non-Obvious Technologies and Libraries

- [Capacitor](https://capacitorjs.com/) with [@capacitor/app](https://www.npmjs.com/package/@capacitor/app) and [@capacitor/network](https://www.npmjs.com/package/@capacitor/network) for mobile bridge behavior and network awareness.
- [tailwind-merge](https://github.com/dcastil/tailwind-merge) for conflict-safe class composition in reusable UI elements like [src/Components/DragnDrop/DragnDrop.tsx](src/Components/DragnDrop/DragnDrop.tsx).
- [Axios](https://axios-http.com/) centralized in [src/api/httpClient.ts](src/api/httpClient.ts) with shared request interception and auth header injection.
- [i18next](https://www.i18next.com/) and [react-i18next](https://react.i18next.com/) configured in [src/i18n.ts](src/i18n.ts) with JSON locale bundles in [src/locales](src/locales).
- [Font Awesome React](https://github.com/FortAwesome/react-fontawesome) with dynamic icon loading in [src/Components/Utils/DynamicFaIcon.tsx](src/Components/Utils/DynamicFaIcon.tsx).
- [Vitest](https://vitest.dev/) plus [Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for component tests, and [Cypress](https://www.cypress.io/) for end-to-end coverage.

## External Libraries and Font Links

- React: https://react.dev/
- React Router: https://reactrouter.com/
- TypeScript: https://www.typescriptlang.org/
- Vite: https://vite.dev/
- Tailwind CSS: https://tailwindcss.com/
- Axios: https://axios-http.com/
- i18next: https://www.i18next.com/
- react-i18next: https://react.i18next.com/
- Font Awesome: https://fontawesome.com/
- Capacitor: https://capacitorjs.com/
- Cypress: https://www.cypress.io/
- Vitest: https://vitest.dev/
- Poppins font (used in [src/App.css](src/App.css)): https://fonts.google.com/specimen/Poppins

## Project Structure

```text
.
├─ .env
├─ .env.example
├─ android/
│  ├─ app/
│  │  └─ src/
│  │     ├─ androidTest/
│  │     ├─ main/
│  │     └─ test/
│  └─ gradle/
│     └─ wrapper/
├─ cypress/
│  ├─ e2e/
│  ├─ fixtures/
│  └─ support/
├─ public/
│  └─ Images/
├─ src/
│  ├─ api/
│  ├─ Components/
│  │  ├─ Android/
│  │  │  └─ NetworkModule/
│  │  ├─ Buttons/
│  │  ├─ CommunityCard/
│  │  ├─ CustomIcons/
│  │  ├─ DragnDrop/
│  │  ├─ InputFields/
│  │  ├─ Modal/
│  │  ├─ Searchbar/
│  │  └─ Utils/
│  ├─ hooks/
│  ├─ Interfaces/
│  ├─ Layouts/
│  ├─ locales/
│  └─ Pages/
│     ├─ Auth/
│     ├─ Communities/
│     ├─ Community/
│     │  ├─ components/
│     │  └─ hooks/
│     ├─ Home/
│     ├─ Profile/
│     └─ Search/
├─ capacitor.config.ts
├─ cypress.config.ts
├─ eslint.config.js
├─ index.html
├─ package.json
├─ tailwind.config.js
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vercel.json
├─ vite.config.ts
└─ vitest.config.ts
```

Interesting directories:

- [src/api](src/api): Typed request layer for backend resources.
- [src/Components](src/Components): Reusable UI primitives and feature-oriented widgets.
- [src/Pages](src/Pages): Route-level page composition.
- [src/Components/Android/NetworkModule](src/Components/Android/NetworkModule): Capacitor network status integration.
- [public/Images](public/Images): Static brand and community image assets.
- [cypress](cypress): End-to-end tests with fixture support.
- [android](android): Native Android host project for Capacitor builds.

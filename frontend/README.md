# Frontend — React + TypeScript + TailwindCSS

## Estructura

```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── vite-env.d.ts
│   ├── api/
│   │   ├── client.ts          # Axios instance
│   │   └── tasks.ts            # Task API calls
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   └── Badge.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskItem.tsx
│   │   ├── TaskForm.tsx
│   │   ├── FilterBar.tsx
│   │   ├── SearchBar.tsx
│   │   └── AuthForm.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useTasks.ts
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── DashboardPage.tsx
│   ├── store/
│   │   └── authStore.ts         # Zustand store
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── cn.ts               # clsx + tailwind-merge
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

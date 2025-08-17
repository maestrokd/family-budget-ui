# family-budget-ui

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

## Running the app locally

Follow the steps below to run the family-budget UI on your machine.

Prerequisites:
- Node.js (LTS) and npm installed
- The backend application family-budget is running locally and accessible (start it before the UI)
- Create an .env file in the root of this project containing:
  ```
  VITE_BE_REST_BASE_URL=http://localhost:8080
  ```

Steps:
1. Install dependencies:
   - npm install
2. Start the backend first:
   - Launch the family-budget backend service and ensure it is reachable at the URL configured in your .env (for example, http://localhost:8080)
3. Start the frontend development server:
   - npm run dev
4. Open the application in your browser using the URL printed by Vite (commonly http://localhost:5173).

Notes:
- If API requests fail, verify that the backend is running and that the frontend .env is pointing to the correct backend URL variable (VITE_BE_REST_BASE_URL).
- Stop the dev server anytime with Ctrl+C in the terminal.
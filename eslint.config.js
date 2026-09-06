import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// These exports are intentional public APIs of existing component modules.
// Keep the allow-list file-scoped: a new helper elsewhere must still fail lint.
const intentionalExports = {
  'src/components/category/ProductTable.tsx': ['pickKeyCoverage'],
  'src/components/product/AnchorNav.tsx': ['PRODUCT_SECTIONS'],
  'src/components/product/ProductHeader.tsx': ['deriveSeriesInfo'],
  'src/components/ui/badge.tsx': ['badgeVariants'],
  'src/components/ui/button-group.tsx': ['buttonGroupVariants'],
  'src/components/ui/button.tsx': ['buttonVariants'],
  'src/components/ui/form.tsx': ['useFormField'],
  'src/components/ui/navigation-menu.tsx': ['navigationMenuTriggerStyle'],
  'src/components/ui/sidebar.tsx': ['useSidebar'],
  'src/components/ui/toggle.tsx': ['toggleVariants'],
  'src/providers/CompareProvider.tsx': ['useCompare'],
  'src/providers/InsuranceDataProvider.tsx': ['useInsuranceData', 'useProducts', 'useProduct', 'useInsurers', 'useCategories'],
  'src/providers/SearchProvider.tsx': ['useSearch'],
};

export default defineConfig([
  globalIgnores(['dist', 'audit-evidence', 'browser-evidence']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  ...Object.entries(intentionalExports).map(([file, names]) => ({
    files: [file],
    rules: {
      'react-refresh/only-export-components': ['error', { allowConstantExport: true, allowExportNames: names }],
    },
  })),
])

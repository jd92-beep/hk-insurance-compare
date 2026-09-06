import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ESLint } from 'eslint';

test('existing intentional public helpers have an explicit lint policy', async () => {
  const eslint = new ESLint();
  const result = await eslint.lintFiles(['src/components/category/ProductTable.tsx', 'src/providers/InsuranceDataProvider.tsx']);
  assert.equal(result.reduce((sum, item) => sum + item.errorCount, 0), 0);
});

test('an unapproved new helper is still rejected by Fast Refresh lint', async () => {
  const eslint = new ESLint();
  const [result] = await eslint.lintText('export function Component() { return <div />; }\nexport function unknownHelper() { return 1; }', { filePath: 'src/components/category/ProductTable.tsx' });
  assert.ok(result.messages.some(item => item.ruleId === 'react-refresh/only-export-components'));
});

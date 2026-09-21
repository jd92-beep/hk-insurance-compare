import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  handleCardClickNavigation,
  isCardInteractiveTarget,
  CARD_INTERACTIVE_SELECTOR,
} from '../src/lib/card-navigation.ts';

function createMockElement(tag, { parent = null, attributes = {} } = {}) {
  const elem = {
    tagName: tag.toUpperCase(),
    parentElement: parent,
    attributes,
    closest(selector) {
      const selectors = selector.split(',').map(s => s.trim().toLowerCase());
      let curr = this;
      while (curr) {
        const currTag = curr.tagName.toLowerCase();
        for (const sel of selectors) {
          if (sel === currTag) return curr;
          if (sel.startsWith('[') && sel.endsWith(']')) {
            const attrMatch = sel.slice(1, -1);
            if (attrMatch.includes('=')) {
              const [attr, val] = attrMatch.split('=').map(s => s.replace(/['"]/g, ''));
              if (curr.attributes[attr] === val) return curr;
            } else {
              if (curr.attributes[attrMatch] !== undefined) return curr;
            }
          }
        }
        curr = curr.parentElement;
      }
      return null;
    },
  };
  return elem;
}

test('interactive selector contains all required tags and roles', () => {
  assert.ok(CARD_INTERACTIVE_SELECTOR.includes('a'));
  assert.ok(CARD_INTERACTIVE_SELECTOR.includes('button'));
  assert.ok(CARD_INTERACTIVE_SELECTOR.includes('input'));
  assert.ok(CARD_INTERACTIVE_SELECTOR.includes('select'));
  assert.ok(CARD_INTERACTIVE_SELECTOR.includes('textarea'));
  assert.ok(CARD_INTERACTIVE_SELECTOR.includes('details'));
  assert.ok(CARD_INTERACTIVE_SELECTOR.includes('summary'));
  assert.ok(CARD_INTERACTIVE_SELECTOR.includes('[role="button"]'));
  assert.ok(CARD_INTERACTIVE_SELECTOR.includes('[role="link"]'));
  assert.ok(CARD_INTERACTIVE_SELECTOR.includes('[data-prevent-card-click]'));
});

test('isCardInteractiveTarget identifies interactive elements correctly', () => {
  const card = createMockElement('article');
  const div = createMockElement('div', { parent: card });
  const button = createMockElement('button', { parent: div });
  const buttonSpan = createMockElement('span', { parent: button });
  const link = createMockElement('a', { parent: div });
  const preventDiv = createMockElement('div', { parent: card, attributes: { 'data-prevent-card-click': '' } });
  const roleBtn = createMockElement('div', { parent: card, attributes: { role: 'button' } });

  assert.equal(isCardInteractiveTarget(buttonSpan), true);
  assert.equal(isCardInteractiveTarget(button), true);
  assert.equal(isCardInteractiveTarget(link), true);
  assert.equal(isCardInteractiveTarget(preventDiv), true);
  assert.equal(isCardInteractiveTarget(roleBtn), true);

  assert.equal(isCardInteractiveTarget(div), false);
  assert.equal(isCardInteractiveTarget(card), false);
  assert.equal(isCardInteractiveTarget(null), false);
  assert.equal(isCardInteractiveTarget(undefined), false);
});

test('clicking interactive element (button or link) bypasses card navigation', () => {
  const button = createMockElement('button');
  const spanInButton = createMockElement('span', { parent: button });
  const link = createMockElement('a');

  let navigatedTo = null;
  const navigate = (path) => { navigatedTo = path; };

  const buttonResult = handleCardClickNavigation(
    { target: spanInButton },
    '/product/medical-bowtie',
    navigate
  );
  assert.equal(buttonResult, false);
  assert.equal(navigatedTo, null);

  const linkResult = handleCardClickNavigation(
    { target: link },
    '/product/medical-bowtie',
    navigate
  );
  assert.equal(linkResult, false);
  assert.equal(navigatedTo, null);
});

test('clicking blank element or non-interactive container triggers navigation', () => {
  const card = createMockElement('article');
  const paddingDiv = createMockElement('div', { parent: card });
  const textP = createMockElement('p', { parent: paddingDiv });

  let navigatedTo = null;
  const navigate = (path) => { navigatedTo = path; };

  const result = handleCardClickNavigation(
    { target: textP },
    '/product/medical-bowtie',
    navigate
  );

  assert.equal(result, true);
  assert.equal(navigatedTo, '/product/medical-bowtie');
});

test('text selection guard prevents card navigation when user selects text', () => {
  const card = createMockElement('article');
  let navigatedTo = null;
  const navigate = (path) => { navigatedTo = path; };

  const resultWithSelection = handleCardClickNavigation(
    { target: card },
    '/product/medical-bowtie',
    navigate,
    { getSelection: () => ({ toString: () => '   Bowtie Pink 自願醫保   ' }) }
  );

  assert.equal(resultWithSelection, false);
  assert.equal(navigatedTo, null);

  const resultWithEmptySelection = handleCardClickNavigation(
    { target: card },
    '/product/medical-bowtie',
    navigate,
    { getSelection: () => ({ toString: () => '   ' }) }
  );

  assert.equal(resultWithEmptySelection, true);
  assert.equal(navigatedTo, '/product/medical-bowtie');
});

test('modifier keys (metaKey or ctrlKey) open in new tab via window.open without SPA navigation', () => {
  const card = createMockElement('article');
  let navigatedTo = null;
  const navigate = (path) => { navigatedTo = path; };

  const openedWindows = [];
  const openWindow = (url, target, features) => {
    openedWindows.push({ url, target, features });
  };

  // 1. metaKey (Mac Cmd + click)
  const metaResult = handleCardClickNavigation(
    { target: card, metaKey: true },
    '/insurer/bowtie',
    navigate,
    { openWindow }
  );
  assert.equal(metaResult, true);
  assert.equal(navigatedTo, null);
  assert.deepEqual(openedWindows, [
    { url: '/insurer/bowtie', target: '_blank', features: 'noopener,noreferrer' },
  ]);

  // 2. ctrlKey (Windows/Linux Ctrl + click)
  const ctrlResult = handleCardClickNavigation(
    { target: card, ctrlKey: true },
    '/category/medical',
    navigate,
    { openWindow }
  );
  assert.equal(ctrlResult, true);
  assert.equal(navigatedTo, null);
  assert.deepEqual(openedWindows, [
    { url: '/insurer/bowtie', target: '_blank', features: 'noopener,noreferrer' },
    { url: '/category/medical', target: '_blank', features: 'noopener,noreferrer' },
  ]);
});

test('defaultPrevented click events do not trigger navigation', () => {
  const card = createMockElement('article');
  let navigatedTo = null;
  const navigate = (path) => { navigatedTo = path; };

  const result = handleCardClickNavigation(
    { target: card, defaultPrevented: true },
    '/product/test',
    navigate
  );

  assert.equal(result, false);
  assert.equal(navigatedTo, null);
});

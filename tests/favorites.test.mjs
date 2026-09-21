import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FAVORITES_STORAGE_KEY,
  createFavoritesStore,
  normalizeFavorites,
  decodeFavorites,
} from "../src/lib/favorites-store.ts";

function createHarness(initialRaw = null) {
  let raw = initialRaw;
  let listener;
  const writes = [];
  let unsubscribed = 0;

  const store = createFavoritesStore(
    {
      read: () => raw,
      write: (next) => {
        raw = next;
        writes.push(next);
      },
      listen: (cb) => {
        listener = cb;
        return () => {
          unsubscribed++;
          listener = undefined;
        };
      },
    },
    10
  );

  return {
    store,
    writes,
    triggerExternal: (val) => {
      raw = val;
      listener?.(val);
    },
    unsubscribed: () => unsubscribed,
  };
}

test("FAVORITES_STORAGE_KEY constant is exactly 'hk_insure_favorites'", () => {
  assert.equal(FAVORITES_STORAGE_KEY, "hk_insure_favorites");
});

test("normalizeFavorites cleans whitespace, drops corrupt/invalid values, and deduplicates", () => {
  const dirty = [
    "  bowtie-vhis-flexi  ",
    "bowtie-vhis-flexi",
    null,
    undefined,
    123,
    "",
    "   ",
    "fwd-vhis-standard",
    "bad id with spaces",
    "aia-ceo-medical",
  ];
  const cleaned = normalizeFavorites(dirty, 5);
  assert.deepEqual(cleaned, [
    "bowtie-vhis-flexi",
    "fwd-vhis-standard",
    "aia-ceo-medical",
  ]);

  // Non-array input
  assert.deepEqual(normalizeFavorites(null), []);
  assert.deepEqual(normalizeFavorites({ id: "test" }), []);
  assert.deepEqual(normalizeFavorites("just-a-string"), []);
});

test("decodeFavorites safely handles corrupt, oversized or empty payloads", () => {
  assert.deepEqual(decodeFavorites(null), []);
  assert.deepEqual(decodeFavorites(""), []);
  assert.deepEqual(decodeFavorites("{invalid json"), []);
  assert.deepEqual(decodeFavorites("a".repeat(150000)), []);
  assert.deepEqual(decodeFavorites('["plan-1","plan-2"]'), ["plan-1", "plan-2"]);
});

test("favorites store: add, remove, toggle, clear, and isFavorite", () => {
  const { store, writes } = createHarness();

  assert.equal(store.getSnapshot().length, 0);
  assert.equal(store.isFavorite("plan-a"), false);

  // Add
  store.add("plan-a");
  assert.deepEqual(store.getSnapshot(), ["plan-a"]);
  assert.equal(store.isFavorite("plan-a"), true);
  assert.equal(writes.length, 1);
  assert.equal(writes[0], '["plan-a"]');

  // Add duplicate does not trigger redundant write or duplicate entries
  store.add("plan-a");
  assert.deepEqual(store.getSnapshot(), ["plan-a"]);
  assert.equal(writes.length, 1);

  // Add second item
  store.add("plan-b");
  assert.deepEqual(store.getSnapshot(), ["plan-a", "plan-b"]);
  assert.equal(store.isFavorite("plan-b"), true);

  // Toggle existing item -> removes it
  store.toggle("plan-a");
  assert.deepEqual(store.getSnapshot(), ["plan-b"]);
  assert.equal(store.isFavorite("plan-a"), false);

  // Toggle non-existing item -> adds it
  store.toggle("plan-c");
  assert.deepEqual(store.getSnapshot(), ["plan-b", "plan-c"]);
  assert.equal(store.isFavorite("plan-c"), true);

  // Remove
  store.remove("plan-b");
  assert.deepEqual(store.getSnapshot(), ["plan-c"]);
  assert.equal(store.isFavorite("plan-b"), false);

  // Clear
  store.clear();
  assert.deepEqual(store.getSnapshot(), []);
  assert.equal(store.isFavorite("plan-c"), false);
});

test("cross-tab storage sync updates favorites without echo writes", () => {
  const h = createHarness('["plan-1"]');
  let notifications = 0;
  const unsubscribe = h.store.subscribe(() => notifications++);

  assert.deepEqual(h.store.getSnapshot(), ["plan-1"]);

  // Simulate external tab write
  h.triggerExternal('["plan-2","plan-3"]');
  assert.deepEqual(h.store.getSnapshot(), ["plan-2", "plan-3"]);
  assert.equal(notifications, 1);
  assert.equal(h.writes.length, 0); // No echo write back to storage

  // Clean unsubscribe
  unsubscribe();
  assert.equal(h.unsubscribed(), 1);
});

test("storage permission denial / quota exceeded gracefully works in memory", () => {
  const store = createFavoritesStore(
    {
      read: () => {
        throw new Error("QuotaExceededError or localStorage disabled");
      },
      write: () => {
        throw new Error("QuotaExceededError or localStorage disabled");
      },
      listen: () => () => {},
    },
    10
  );

  const unsub = store.subscribe(() => {});
  store.add("plan-safe");
  assert.deepEqual(store.getSnapshot(), ["plan-safe"]);
  assert.equal(store.isFavorite("plan-safe"), true);
  unsub();
});

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { vi } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * Evaluates one of the browser scripts of the project in the current jsdom
 * global scope, so the functions it declares become available on `globalThis`.
 * The scripts are plain `<script>` files without exports, so an indirect
 * `eval` is the only way to exercise them from a test.
 */
export function loadScript(relativePath) {
  const path = resolve(repoRoot, relativePath);
  const source = readFileSync(path, "utf8").replace(/^\uFEFF/, "");
  const globalEval = eval;
  // `sourceURL` faz o V8 (e o relatorio de cobertura) associar o codigo ao arquivo real.
  globalEval(`${source}\n//# sourceURL=${pathToFileURL(path).href}`);
}

/** Minimal `fetch` stub resolving with the given JSON payload. */
export function stubFetchJson(payload) {
  const fetchMock = vi.fn(() => Promise.resolve({ json: () => Promise.resolve(payload) }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** Flushes the microtask queue used by the scripts to load their JSON files. */
export async function flushPromises(times = 5) {
  for (let i = 0; i < times; i++) await Promise.resolve();
}

/** Options of a `<select>` grouped by the label of their `<optgroup>`. */
export function optgroups(select) {
  return [...select.querySelectorAll("optgroup")].map((group) => ({
    label: group.label,
    options: [...group.children].map((option) => ({ text: option.textContent, value: option.value })),
  }));
}

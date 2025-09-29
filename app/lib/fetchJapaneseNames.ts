export interface PokeAPIName {
  language: { name: string };
  name: string;
}

interface PokeAPISpeciesNames {
  names: PokeAPIName[];
}

const japaneseNameCache = new Map<string, string>();
const inFlight = new Map<string, Promise<string>>();
const STORAGE_KEY = 'jp-name-cache-v1';
let storageLoaded = false;

function loadFromStorageOnce(): void {
  if (storageLoaded) return;
  storageLoaded = true;
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const obj = JSON.parse(raw) as Record<string, string>;
    for (const [k, v] of Object.entries(obj)) {
      japaneseNameCache.set(k.toLowerCase(), v);
    }
  } catch {
    // ignore storage errors
  }
}

let persistTimer: number | undefined;
function persistToStorageDebounced(): void {
  if (typeof window === 'undefined') return;
  if (persistTimer !== undefined) return;
  // Debounce writes to avoid thrashing
  persistTimer = window.setTimeout(() => {
    try {
      const obj: Record<string, string> = {};
      for (const [k, v] of japaneseNameCache.entries()) obj[k] = v;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch {
      // ignore storage errors
    } finally {
      persistTimer = undefined;
    }
  }, 250);
}

async function fetchJapaneseNameFor(
  enName: string,
  options?: { signal?: AbortSignal; useGlobalInflight?: boolean }
): Promise<string> {
  const key = enName.toLowerCase();
  if (japaneseNameCache.has(key)) return japaneseNameCache.get(key)!;

  const useDedup = options?.useGlobalInflight !== false;
  if (useDedup && inFlight.has(key)) return inFlight.get(key)!;

  const runner = (async () => {
    let timeoutId: number | undefined;
    const parentSignal: AbortSignal | undefined = options?.signal;
    const controller = new AbortController();
    let abortOnParent: (() => void) | undefined;
    try {
      abortOnParent = () => controller.abort();
      if (parentSignal) {
        if (parentSignal.aborted) controller.abort();
        else parentSignal.addEventListener('abort', abortOnParent);
      }
      if (typeof window !== 'undefined') {
        timeoutId = window.setTimeout(() => controller.abort(), 6000);
      }

      const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${key}`, {
        signal: controller.signal
      });
      if (!res.ok) {
        japaneseNameCache.set(key, enName);
        return enName;
      }
      const data: PokeAPISpeciesNames = await res.json();
      const jpEntry = data.names.find((n) => n.language.name === 'ja-Hrkt');
      const jpName = jpEntry?.name ?? enName;
      japaneseNameCache.set(key, jpName);
      persistToStorageDebounced();
      return jpName;
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        // キャンセル時はキャッシュしないで伝播
        throw e;
      }
      japaneseNameCache.set(key, enName);
      return enName;
    } finally {
      // cleanup listeners/timers
      // Note: parentSignal may be undefined
      try {
        if (typeof window !== 'undefined' && timeoutId !== undefined) {
          window.clearTimeout(timeoutId);
        }
      } catch {}
      try {
        if (parentSignal && abortOnParent) parentSignal.removeEventListener('abort', abortOnParent);
      } catch {}
      if (useDedup) inFlight.delete(key);
    }
  })();

  if (useDedup) inFlight.set(key, runner);
  return runner;
}

async function runWithConcurrency<T>(items: T[], worker: (item: T) => Promise<void>, concurrency: number): Promise<void> {
  let index = 0;
  const workerCount = Math.max(1, Math.min(concurrency, items.length));
  const runners = new Array(workerCount).fill(0).map(async () => {
    while (index < items.length) {
      const current = index++;
       
      await worker(items[current]);
    }
  });
  await Promise.all(runners);
}

export async function fetchJapaneseNamesBatch(
  names: string[],
  opts?: { concurrency?: number; signal?: AbortSignal }
): Promise<Record<string, string>> {
  loadFromStorageOnce();
  const concurrency = opts?.concurrency ?? 4;
  const unique = Array.from(new Set(names.map((n) => n.toLowerCase())));

  const toFetch = unique.filter((n) => !japaneseNameCache.has(n));

  if (toFetch.length > 0) {
    await runWithConcurrency(toFetch, async (name) => {
      try {
        await fetchJapaneseNameFor(name, { signal: opts?.signal, useGlobalInflight: false });
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') {
          // 中断時はそのまま無視
          return;
        }
        // それ以外は中で英名フォールバック済み
      }
    }, concurrency);
  }

  const result: Record<string, string> = {};
  for (const original of names) {
    const key = original.toLowerCase();
    result[original] = japaneseNameCache.get(key) ?? original;
  }
  return result;
}

export function getCachedJapaneseName(name: string): string | undefined {
  return japaneseNameCache.get(name.toLowerCase());
}


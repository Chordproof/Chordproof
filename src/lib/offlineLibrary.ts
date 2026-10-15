// Biblioteca offline do ChordProof+ — guarda cifras no IndexedDB para uso sem internet.
// Requisito Plus: "Offline Mode (PWA)" da /pricing.

export interface OfflineTab {
  slug_artist: string;
  slug_song: string;
  song: string;
  artist: string;
  content: string;
  tablature?: string | null;
  key_sig?: string | null;
  capo?: string | null;
  difficulty?: string | null;
  saved_at: number;
}

const DB_NAME = "chordproof-offline";
const DB_VERSION = 1;
const STORE = "tabs";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        const store = req.result.createObjectStore(STORE, { keyPath: ["slug_artist", "slug_song"] });
        store.createIndex("saved_at", "saved_at");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveTabOffline(tab: Omit<OfflineTab, "saved_at">): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ ...tab, saved_at: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function removeTabOffline(slugArtist: string, slugSong: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete([slugArtist, slugSong]);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineTab(slugArtist: string, slugSong: string): Promise<OfflineTab | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, "readonly").objectStore(STORE).get([slugArtist, slugSong]);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function listOfflineTabs(): Promise<OfflineTab[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result as OfflineTab[]).sort((a, b) => b.saved_at - a.saved_at));
    req.onerror = () => reject(req.error);
  });
}

/**
 * Field notes storage — IndexedDB
 * For longer-form researcher memos and reflections, separate from ritual notes.
 * Local-first, no external transmission.
 */

const DB_NAME    = 'foghorn_notes';
const DB_VERSION = 1;
const STORE      = 'notes';

let db = null;

async function initDB() {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(new Error('Failed to open field notes DB'));

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE)) {
        const store = database.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * Save a field note
 * @param {{ id: string, timestamp: string, body: string }} note
 */
export async function saveNote(note) {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const tx      = database.transaction([STORE], 'readwrite');
    const request = tx.objectStore(STORE).add(note);
    request.onsuccess = () => resolve(note.id);
    request.onerror   = () => reject(new Error('Failed to save note'));
  });
}

/**
 * Get all field notes, newest first
 */
export async function getAllNotes() {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const tx      = database.transaction([STORE], 'readonly');
    const request = tx.objectStore(STORE).index('timestamp').openCursor(null, 'prev');
    const notes   = [];
    request.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) { notes.push(cursor.value); cursor.continue(); }
      else resolve(notes);
    };
    request.onerror = () => reject(new Error('Failed to retrieve notes'));
  });
}

/**
 * Delete a field note by ID
 */
export async function deleteNote(id) {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const tx      = database.transaction([STORE], 'readwrite');
    const request = tx.objectStore(STORE).delete(id);
    request.onsuccess = () => resolve();
    request.onerror   = () => reject(new Error('Failed to delete note'));
  });
}

/**
 * Delete ALL field notes (for exit/cleanup)
 * @returns {Promise<void>}
 */
export async function deleteAllNotes() {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const tx      = database.transaction([STORE], 'readwrite');
    const request = tx.objectStore(STORE).clear();
    request.onsuccess = () => resolve();
    request.onerror   = () => reject(new Error('Failed to clear notes'));
  });
}

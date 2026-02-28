/**
 * Ritual storage service using IndexedDB
 * Local-first, privacy-first architecture
 * NO external transmission - all data stays on device
 */

const DB_NAME = 'foghorn';
const DB_VERSION = 1;
const STORE_NAME = 'rituals';

let db = null;

/**
 * Initialize IndexedDB
 * @returns {Promise<IDBDatabase>}
 */
async function initDB() {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Create rituals object store
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, {
          keyPath: 'id',
        });

        // Index by timestamp for chronological queries
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });

        // Index by date for daily ritual queries
        objectStore.createIndex('date', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * Save a ritual to local storage
 * @param {Object} ritual - Ritual record to save
 * @returns {Promise<string>} Ritual ID
 */
export async function saveRitual(ritual) {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(ritual);

    request.onsuccess = () => {
      resolve(ritual.id);
    };

    request.onerror = () => {
      reject(new Error('Failed to save ritual'));
    };
  });
}

/**
 * Get all rituals (chronological, newest first)
 * @returns {Promise<Array>} All ritual records
 */
export async function getAllRituals() {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const request = index.openCursor(null, 'prev'); // Reverse chronological

    const rituals = [];

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        rituals.push(cursor.value);
        cursor.continue();
      } else {
        resolve(rituals);
      }
    };

    request.onerror = () => {
      reject(new Error('Failed to retrieve rituals'));
    };
  });
}

/**
 * Get ritual by ID
 * @param {string} id - Ritual ID
 * @returns {Promise<Object|null>} Ritual record or null
 */
export async function getRitualById(id) {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(new Error('Failed to retrieve ritual'));
    };
  });
}

/**
 * Get rituals for a specific date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Rituals in date range
 */
export async function getRitualsByDateRange(startDate, endDate) {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');

    const range = IDBKeyRange.bound(
      startDate.toISOString(),
      endDate.toISOString()
    );

    const request = index.getAll(range);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(new Error('Failed to retrieve rituals by date'));
    };
  });
}

/**
 * Delete a ritual
 * @param {string} id - Ritual ID
 * @returns {Promise<void>}
 */
export async function deleteRitual(id) {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to delete ritual'));
    };
  });
}

/**
 * Delete ALL rituals (for exit/cleanup)
 * @returns {Promise<void>}
 */
export async function deleteAllRituals() {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to clear rituals'));
    };
  });
}

/**
 * Export all rituals as JSON (for backup/portability)
 * @returns {Promise<string>} JSON string of all rituals
 */
export async function exportRituals() {
  const rituals = await getAllRituals();
  return JSON.stringify(rituals, null, 2);
}

/**
 * Get ritual count
 * @returns {Promise<number>} Total number of rituals
 */
export async function getRitualCount() {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.count();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(new Error('Failed to count rituals'));
    };
  });
}

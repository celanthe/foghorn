/**
 * IndexedDB cache for historical weather matches
 * Stored separately from ritual data (different DB)
 * Historical data never changes — 30-day TTL is conservative
 */

const DB_NAME = 'foghorn_historical'
const STORE_NAME = 'matches'
const DB_VERSION = 1
const TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

let db = null

async function initDB() {
  if (db) return db

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onerror = () => reject(new Error('Failed to open historical cache DB'))

    req.onupgradeneeded = (event) => {
      const database = event.target.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'cacheKey' })
      }
    }

    req.onsuccess = () => {
      db = req.result
      resolve(db)
    }
  })
}

/**
 * Cache key: "YYYY-MM-DD" of the current date (one match per calendar day)
 */
function makeCacheKey(date) {
  return date.toISOString().split('T')[0]
}

/**
 * Get cached match for today's date, or null if missing/expired
 * @param {Date} date
 * @returns {Promise<Object|null>}
 */
export async function getCachedMatch(date) {
  try {
    const database = await initDB()
    const key = makeCacheKey(date)

    return new Promise((resolve) => {
      const tx = database.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(key)

      req.onsuccess = () => {
        const record = req.result
        if (!record) return resolve(null)
        if (new Date(record.expiresAt) < new Date()) return resolve(null)
        resolve(record.match)
      }

      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

/**
 * Save a match to cache
 * @param {Date} date
 * @param {Object|null} match - The best match found (or null = no match exists)
 */
export async function cacheMatch(date, match) {
  try {
    const database = await initDB()
    const key = makeCacheKey(date)

    const record = {
      cacheKey: key,
      match,
      cachedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + TTL_MS).toISOString(),
    }

    return new Promise((resolve) => {
      const tx = database.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.put(record)
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve() // Fail silently — cache is best-effort
    })
  } catch {
    // Cache is optional; don't throw
  }
}

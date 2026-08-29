/**
 * Shothik AI: Offline IndexedDB WASM & ONNX Asset Cache Manager
 * Persists tokenizers, WASM modules, and model weights in the client browser
 * to ensure 100% offline WebGPU speculative execution.
 */

export interface CachedAssetRecord {
  key: string;
  type: "wasm_binary" | "onnx_model" | "tokenizer_json" | "dictionary";
  sizeBytes: number;
  data: string | ArrayBuffer;
  updatedAt: number;
  version: string;
}

export class OfflineAssetManager {
  private static dbName = "shothik_wasm_cache_v1";
  private static storeName = "assets";
  private static dbPromise: Promise<IDBDatabase> | null = null;

  /**
   * Initialize or open the IndexedDB database
   */
  private static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    if (typeof window === "undefined" || !("indexedDB" in window)) {
      return Promise.reject(new Error("IndexedDB not supported in this environment"));
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "key" });
        }
      };

      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };

      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Save an asset to IndexedDB
   */
  public static async putAsset(
    key: string,
    data: string | ArrayBuffer,
    type: CachedAssetRecord["type"] = "dictionary",
    version: string = "1.0.0"
  ): Promise<boolean> {
    try {
      const db = await this.getDB();
      const sizeBytes = typeof data === "string" ? new Blob([data]).size : data.byteLength;

      const record: CachedAssetRecord = {
        key,
        type,
        sizeBytes,
        data,
        updatedAt: Date.now(),
        version,
      };

      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, "readwrite");
        const store = tx.objectStore(this.storeName);
        store.put(record);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  /**
   * Retrieve a cached asset
   */
  public static async getAsset<T = string | ArrayBuffer>(key: string): Promise<T | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, "readonly");
        const store = tx.objectStore(this.storeName);
        const req = store.get(key);
        req.onsuccess = () => {
          resolve(req.result ? (req.result.data as T) : null);
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  /**
   * Preload critical dictionary tables and offline weights
   */
  public static async preloadCoreAssets(): Promise<void> {
    const coreDictionary = {
      "shothik_bengali_dictionary": JSON.stringify({
        "revenue": "রাজস্ব",
        "profit": "মুনাফা",
        "logistics": "লজিস্টিকস ও পরিবহন",
        "courier": "কুরিয়ার সার্ভিস",
        "delivery": "হোম ডেলিভারি",
        "cash on delivery": "ক্যাশ অন ডেলিভারি (সিওডি)",
        "merchant": "মার্চেন্ট বা বিক্রেতা",
        "customer": "ক্রেতা",
        "return": "পণ্য ফেরত বা আরটিও",
        "growth": "প্রবৃদ্ধি",
        "market": "বাজার",
        "report": "প্রতিবেদন",
      }),
    };

    for (const [k, v] of Object.entries(coreDictionary)) {
      await this.putAsset(k, v, "dictionary", "2.0.0");
    }
  }

  /**
   * Get all cache storage stats
   */
  public static async getCacheMetrics(): Promise<{ totalAssets: number; totalSizeBytes: number }> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, "readonly");
        const store = tx.objectStore(this.storeName);
        const req = store.getAll();
        req.onsuccess = () => {
          const items: CachedAssetRecord[] = req.result || [];
          const totalSizeBytes = items.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);
          resolve({ totalAssets: items.length, totalSizeBytes });
        };
        req.onerror = () => resolve({ totalAssets: 0, totalSizeBytes: 0 });
      });
    } catch {
      return { totalAssets: 0, totalSizeBytes: 0 };
    }
  }
}

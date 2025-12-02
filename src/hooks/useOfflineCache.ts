import { useCallback, useEffect, useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { useNetworkStatus } from './useNativeFeatures';

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  key: string;
}

interface CachedData<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export const useOfflineCache = <T>(options: CacheOptions) => {
  const { key, ttl = 24 * 60 * 60 * 1000 } = options; // Default 24 hours
  const { isOnline } = useNetworkStatus();
  const [cachedData, setCachedData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load from cache on mount
  useEffect(() => {
    loadFromCache();
  }, [key]);

  const loadFromCache = useCallback(async () => {
    try {
      setIsLoading(true);
      const { value } = await Preferences.get({ key: `cache_${key}` });
      
      if (value) {
        const cached: CachedData<T> = JSON.parse(value);
        const now = Date.now();
        
        // Check if cache is still valid
        if (now - cached.timestamp < cached.ttl) {
          setCachedData(cached.data);
          setLastUpdated(new Date(cached.timestamp));
        } else {
          // Cache expired, clear it
          await Preferences.remove({ key: `cache_${key}` });
        }
      }
    } catch (error) {
      console.error('Error loading from cache:', error);
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  const saveToCache = useCallback(async (data: T) => {
    try {
      const cacheEntry: CachedData<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      
      await Preferences.set({
        key: `cache_${key}`,
        value: JSON.stringify(cacheEntry),
      });
      
      setCachedData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }, [key, ttl]);

  const clearCache = useCallback(async () => {
    try {
      await Preferences.remove({ key: `cache_${key}` });
      setCachedData(null);
      setLastUpdated(null);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, [key]);

  const fetchWithCache = useCallback(async (
    fetchFn: () => Promise<T>,
    forceRefresh = false
  ): Promise<T | null> => {
    // If offline and we have cached data, return it
    if (!isOnline && cachedData) {
      return cachedData;
    }

    // If online or no cache, try to fetch
    if (isOnline || !cachedData || forceRefresh) {
      try {
        const freshData = await fetchFn();
        await saveToCache(freshData);
        return freshData;
      } catch (error) {
        console.error('Error fetching data:', error);
        // If fetch fails but we have cached data, return it
        if (cachedData) {
          return cachedData;
        }
        throw error;
      }
    }

    return cachedData;
  }, [isOnline, cachedData, saveToCache]);

  return {
    cachedData,
    isLoading,
    isOnline,
    lastUpdated,
    saveToCache,
    loadFromCache,
    clearCache,
    fetchWithCache,
  };
};

// Helper to cache multiple items (like a list of stories)
export const useCacheList = <T extends { id: string }>(baseKey: string) => {
  const saveItem = useCallback(async (item: T) => {
    await Preferences.set({
      key: `${baseKey}_${item.id}`,
      value: JSON.stringify({ data: item, timestamp: Date.now() }),
    });
  }, [baseKey]);

  const getItem = useCallback(async (id: string): Promise<T | null> => {
    const { value } = await Preferences.get({ key: `${baseKey}_${id}` });
    if (value) {
      const parsed = JSON.parse(value);
      return parsed.data;
    }
    return null;
  }, [baseKey]);

  const saveList = useCallback(async (items: T[]) => {
    // Save each item individually
    await Promise.all(items.map(item => saveItem(item)));
    
    // Save list of IDs
    await Preferences.set({
      key: `${baseKey}_ids`,
      value: JSON.stringify(items.map(i => i.id)),
    });
  }, [baseKey, saveItem]);

  const getList = useCallback(async (): Promise<T[]> => {
    const { value } = await Preferences.get({ key: `${baseKey}_ids` });
    if (!value) return [];
    
    const ids: string[] = JSON.parse(value);
    const items = await Promise.all(ids.map(id => getItem(id)));
    return items.filter((item): item is NonNullable<typeof item> => item !== null) as T[];
  }, [baseKey, getItem]);

  const clearList = useCallback(async () => {
    const { value } = await Preferences.get({ key: `${baseKey}_ids` });
    if (value) {
      const ids: string[] = JSON.parse(value);
      await Promise.all(ids.map(id => Preferences.remove({ key: `${baseKey}_${id}` })));
      await Preferences.remove({ key: `${baseKey}_ids` });
    }
  }, [baseKey]);

  return { saveItem, getItem, saveList, getList, clearList };
};

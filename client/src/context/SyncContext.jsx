import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getMotherById, updateMother } from '../services/motherService';
import { logGrowthRecord } from '../services/childService';
import * as offlineQueue from '../services/offlineQueue';

const SyncContext = createContext(null);

// True when the request never reached the server (offline, DNS failure,
// backend unreachable, timeout) -- as opposed to the server responding
// with an error (validation, 404, etc.), which should surface normally
// rather than being queued for retry.
function isNetworkFailure(err) {
  return !err.response;
}

export function SyncProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState(() => offlineQueue.getQueue());
  const [syncing, setSyncing] = useState(false);
  const syncingRef = useRef(false);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const flushQueue = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setSyncing(true);

    try {
      for (const item of offlineQueue.getQueue()) {
        try {
          if (item.type === 'anc_visit') {
            // Re-fetch the mother's current history before appending, so a
            // queued visit can't clobber visits logged elsewhere while this
            // one was waiting to sync (the API replaces ancVisitHistory
            // wholesale rather than appending).
            const fresh = await getMotherById(item.motherId);
            await updateMother(item.motherId, {
              ancVisitHistory: [...fresh.ancVisitHistory, item.payload],
            });
          } else if (item.type === 'growth_entry') {
            await logGrowthRecord(item.childId, item.payload);
          }
          setQueue(offlineQueue.removeFromQueue(item.id));
        } catch (err) {
          if (isNetworkFailure(err)) {
            // Still can't reach the server -- stop here, the rest will be
            // retried on the next online transition or manual retry.
            break;
          }
          // Server rejected it (e.g. validation) -- won't succeed by
          // replaying as-is. Mark it and move on to the next item.
          setQueue(
            offlineQueue.updateQueueItem(item.id, {
              status: 'failed',
              errorMessage: err.response?.data?.error || 'Sync failed',
            })
          );
        }
      }
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, []);

  // Retry whenever we come back online, and once on initial load in case a
  // queue was left over from a previous offline session.
  useEffect(() => {
    if (isOnline) flushQueue();
  }, [isOnline, flushQueue]);

  const submitAncVisit = useCallback(
    async (motherId, entry) => {
      if (isOnline) {
        try {
          const fresh = await getMotherById(motherId);
          const updated = await updateMother(motherId, {
            ancVisitHistory: [...fresh.ancVisitHistory, entry],
          });
          return { queued: false, mother: updated };
        } catch (err) {
          if (!isNetworkFailure(err)) throw err;
          // fall through to queue
        }
      }
      setQueue(offlineQueue.enqueue({ type: 'anc_visit', motherId, payload: entry }));
      return { queued: true };
    },
    [isOnline]
  );

  const submitGrowthEntry = useCallback(
    async (childId, entry) => {
      if (isOnline) {
        try {
          const result = await logGrowthRecord(childId, entry);
          return { queued: false, ...result };
        } catch (err) {
          if (!isNetworkFailure(err)) throw err;
          // fall through to queue
        }
      }
      setQueue(offlineQueue.enqueue({ type: 'growth_entry', childId, payload: entry }));
      return { queued: true };
    },
    [isOnline]
  );

  const value = {
    isOnline,
    queue,
    syncing,
    retryNow: flushQueue,
    submitAncVisit,
    submitGrowthEntry,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return ctx;
}

import { useSync } from '../context/SyncContext';

export default function OfflineBanner() {
  const { isOnline, queue, syncing, retryNow } = useSync();

  if (isOnline && queue.length === 0) return null;

  const failedCount = queue.filter((item) => item.status === 'failed').length;

  return (
    <div className={`offline-banner ${isOnline ? 'offline-banner-syncing' : 'offline-banner-offline'}`}>
      {!isOnline && (
        <span>
          You're offline. ANC visits and growth entries will be saved on this device and synced
          automatically once you're back online.
        </span>
      )}

      {isOnline && queue.length > 0 && (
        <>
          <span>
            {syncing
              ? 'Syncing…'
              : `${queue.length} item${queue.length === 1 ? '' : 's'} waiting to sync`}
            {failedCount > 0 && !syncing && ` (${failedCount} failed)`}
          </span>
          {!syncing && (
            <button type="button" onClick={retryNow}>
              Retry now
            </button>
          )}
        </>
      )}
    </div>
  );
}

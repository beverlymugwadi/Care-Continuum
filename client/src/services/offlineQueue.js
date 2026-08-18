const STORAGE_KEY = 'careContinuum.offlineQueue';

function readQueue() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function getQueue() {
  return readQueue();
}

/**
 * Adds an item to the offline queue and returns the full updated queue.
 * item: { type: 'anc_visit' | 'growth_entry', motherId?, childId?, payload }
 */
export function enqueue(item) {
  const queue = readQueue();
  queue.push({
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
  });
  writeQueue(queue);
  return queue;
}

export function removeFromQueue(id) {
  const queue = readQueue().filter((item) => item.id !== id);
  writeQueue(queue);
  return queue;
}

export function updateQueueItem(id, updates) {
  const queue = readQueue().map((item) => (item.id === id ? { ...item, ...updates } : item));
  writeQueue(queue);
  return queue;
}

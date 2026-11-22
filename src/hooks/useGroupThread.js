import { useEffect, useState } from 'react';
import { entities, functions } from '@/api/client';

// Loads one thread a page and keeps it live: new, edited and removed records
// arrive through the entity subscription, filtered down to this thread.
export default function useGroupThread(entityName, query) {
  const [messages, setMessages] = useState(null);
  const key = JSON.stringify(query);

  useEffect(() => {
    let active = true;
    const collection = entities[entityName];
    const matches = (record) =>
      Object.entries(query).every(([field, value]) => record?.[field] === value);

    (async () => {
      const page = await collection.filter(query, { sort: '-created_date', limit: 100 });
      if (active) setMessages(page.items.slice().reverse());
    })();

    const unsubscribe = collection.subscribe((event) => {
      const record = event.data;
      if (!matches(record)) return;
      setMessages((prev) => {
        if (!prev) return prev;
        if (event.type === 'create') {
          return prev.some((item) => item.id === record.id) ? prev : [...prev, record];
        }
        if (event.type === 'update') {
          return prev.map((item) => (item.id === record.id ? record : item));
        }
        if (event.type === 'delete') {
          return prev.filter((item) => item.id !== record.id);
        }
        return prev;
      });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [entityName, key]);

  return messages;
}
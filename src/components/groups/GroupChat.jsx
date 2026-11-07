import { useEffect, useMemo, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ChatMessage from '@/components/groups/ChatMessage';

export default function GroupChat({ group, people, user }) {
  const [messages, setMessages] = useState(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollerRef = useRef(null);

  // Every reader of a thread lives in its `members` list, which is what the
  // message rules check, so the audience is rebuilt on each send.
  const audience = useMemo(
    () =>
      Array.from(
        new Set(
          [
            ...(group?.members || []),
            ...(people || []).map((person) => person?.user_id),
            group?.created_by_id,
            user?.id,
          ].filter(Boolean)
        )
      ),
    [group, people, user]
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const page = await base44.entities.GroupMessage.filter(
        { group_id: group.id },
        { sort: '-created_date', limit: 100 }
      );
      if (active) setMessages(page.items.slice().reverse());
    })();
    return () => {
      active = false;
    };
  }, [group.id]);

  useEffect(() => {
    const unsubscribe = base44.entities.GroupMessage.subscribe((event) => {
      const message = event.data;
      if (!message || message.group_id !== group.id) return;
      setMessages((prev) => {
        if (!prev) return prev;
        if (event.type === 'create') {
          return prev.some((item) => item.id === message.id) ? prev : [...prev, message];
        }
        if (event.type === 'update') {
          return prev.map((item) => (item.id === message.id ? message : item));
        }
        if (event.type === 'delete') {
          return prev.filter((item) => item.id !== message.id);
        }
        return prev;
      });
    });
    return unsubscribe;
  }, [group.id]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [messages]);

  const send = async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await base44.entities.GroupMessage.create({
        group_id: group.id,
        body,
        author_id: user?.id,
        author_name: user?.full_name || user?.email || 'Member',
        members: audience,
      });
      setDraft('');
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send(event);
    }
  };

  return (
    <section className="mt-10 border-t border-border/80 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Conversation</p>
          <h2 className="mt-3 text-[clamp(1.3rem,3vw,1.7rem)] leading-tight">Talk it through.</h2>
        </div>
        <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          Live for everyone in the group
        </p>
      </div>

      <div className="mt-5 rounded-[14px] border border-border/80 bg-card/40 p-5 sm:p-6">
        {messages === null ? (
          <div className="h-32 animate-pulse rounded-[10px] bg-secondary" />
        ) : messages.length === 0 ? (
          <p className="py-10 text-center text-[13.5px] text-muted-foreground">
            No messages yet. Share the first insight from this study.
          </p>
        ) : (
          <ol
            ref={scrollerRef}
            className="max-h-[420px] space-y-5 overflow-y-auto pr-1"
          >
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                mine={message.author_id === user?.id}
              />
            ))}
          </ol>
        )}

        <form onSubmit={send} className="mt-5 flex items-end gap-2 border-t border-border/70 pt-4">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            placeholder="Share an insight, ask a question…"
            className="min-h-[56px] flex-1 resize-none rounded-[10px] border border-input bg-background/60 px-3.5 py-2.5 text-[14px] leading-[1.6] text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            aria-label="Send message"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-foreground bg-foreground text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </section>
  );
}
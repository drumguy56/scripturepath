import { useEffect, useMemo, useRef, useState } from 'react';
import { entities } from '@/api/client';
import ChatMessage from '@/components/groups/ChatMessage';
import ThreadComposer from '@/components/groups/ThreadComposer';
import useGroupThread from '@/hooks/useGroupThread';
import { groupAudience } from '@/lib/groupAudience';

export default function GroupChat({ group, people, user }) {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollerRef = useRef(null);
  const query = useMemo(() => ({ group_id: group.id }), [group.id]);
  const messages = useGroupThread('GroupMessage', query);
  const audience = useMemo(() => groupAudience(group, people, user), [group, people, user]);

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
      await entities.GroupMessage.create({
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
          <ol ref={scrollerRef} className="max-h-[420px] space-y-5 overflow-y-auto pr-1">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                mine={message.author_id === user?.id}
              />
            ))}
          </ol>
        )}

        <ThreadComposer
          value={draft}
          onChange={setDraft}
          onSubmit={send}
          sending={sending}
          placeholder="Share an insight, ask a question…"
        />
      </div>
    </section>
  );
}
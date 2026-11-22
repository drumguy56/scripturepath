import { useMemo, useState } from 'react';
import { entities } from '@/api/client';
import ChatMessage from '@/components/groups/ChatMessage';
import ThreadComposer from '@/components/groups/ThreadComposer';
import useGroupThread from '@/hooks/useGroupThread';
import { groupAudience } from '@/lib/groupAudience';

export default function LessonDiscussion({ group, lesson, user }) {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const query = useMemo(
    () => ({ group_id: group.id, lesson_id: lesson.id }),
    [group.id, lesson.id]
  );
  const comments = useGroupThread('LessonComment', query);
  const audience = useMemo(
    () => groupAudience(group, group.member_profiles, user),
    [group, user]
  );

  const send = async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await entities.LessonComment.create({
        group_id: group.id,
        study_id: lesson.study_id,
        lesson_id: lesson.id,
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
    <section className="mt-14 border-t border-border/80 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Group discussion</p>
          <h2 className="mt-3 text-[22px] leading-snug">Reflect together</h2>
          <p className="mt-2 max-w-[460px] text-[13.5px] leading-relaxed text-muted-foreground">
            Only members of {group.name} see this, and only for this lesson. Your journal
            stays private to you.
          </p>
        </div>
        <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          Live for the group
        </span>
      </div>

      <div className="mt-5 rounded-[14px] border border-border/80 bg-card/40 p-5 sm:p-6">
        {comments === null ? (
          <div className="h-28 animate-pulse rounded-[10px] bg-secondary" />
        ) : comments.length === 0 ? (
          <p className="py-8 text-center text-[13.5px] text-muted-foreground">
            No comments on this lesson yet. Be the first to share a thought.
          </p>
        ) : (
          <ol className="max-h-[420px] space-y-5 overflow-y-auto pr-1">
            {comments.map((comment) => (
              <ChatMessage
                key={comment.id}
                message={comment}
                mine={comment.author_id === user?.id}
              />
            ))}
          </ol>
        )}

        <ThreadComposer
          value={draft}
          onChange={setDraft}
          onSubmit={send}
          sending={sending}
          placeholder="What stood out to you in this lesson?"
        />
      </div>
    </section>
  );
}
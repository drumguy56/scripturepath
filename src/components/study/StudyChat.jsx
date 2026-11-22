import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { ai } from '@/api/client';

// Ask questions about one lesson of this study. Chat lives in component state only:
// reloading the page clears it.
export default function StudyChat({ study, lessons, defaultLessonId }) {
  const [lessonId, setLessonId] = useState(defaultLessonId || lessons[0]?.id);
  const [history, setHistory] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef(null);

  // Changing lesson starts a fresh conversation for that lesson.
  useEffect(() => {
    setHistory([]);
    setError('');
  }, [lessonId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [history, sending]);

  const lesson = lessons.find((l) => l.id === lessonId);

  const send = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending || !lesson) return;
    const next = [...history, { role: 'user', content: text }];
    setHistory(next);
    setDraft('');
    setSending(true);
    setError('');
    try {
      const { reply } = await ai.studyChat(study.id, lesson.id, next);
      setHistory((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-[14px] border border-border bg-card p-6">
      <p className="eyebrow">Ask about a lesson</p>
      <select
        value={lessonId || ''}
        onChange={(e) => setLessonId(e.target.value)}
        className="mt-4 w-full rounded-[6px] border border-border bg-background px-3 py-2 text-[13.5px]"
        aria-label="Lesson"
      >
        {lessons.map((l) => (
          <option key={l.id} value={l.id}>
            {l.order}. {l.title}
          </option>
        ))}
      </select>

      <div ref={listRef} className="mt-4 flex max-h-[340px] min-h-[120px] flex-col gap-3 overflow-y-auto">
        {history.length === 0 && (
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Ask what a verse means, what the lesson is driving at, or how a passage fits the
            study.
          </p>
        )}
        {history.map((m, i) => (
          <div
            key={i}
            className={`max-w-[90%] whitespace-pre-line rounded-[10px] px-3.5 py-2.5 text-[14px] leading-relaxed ${
              m.role === 'user' ? 'self-end bg-primary text-primary-foreground' : 'self-start bg-secondary text-foreground'
            }`}
          >
            {m.content}
          </div>
        ))}
        {sending && <p className="self-start text-[12.5px] text-muted-foreground">Thinking…</p>}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-[13px] text-destructive">
          {error}
        </p>
      )}

      <form onSubmit={send} className="mt-4 flex items-end gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) send(e);
          }}
          rows={2}
          maxLength={4000}
          placeholder="Ask about this lesson…"
          aria-label="Your question"
          className="flex-1 resize-none rounded-[6px] border border-border bg-background px-3 py-2 text-[14px]"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          aria-label="Send"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-[6px] bg-primary text-primary-foreground transition-colors hover:bg-foreground disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
      <p className="mt-3 text-[11.5px] text-muted-foreground">
        Chats are not saved. Reloading the page clears them.
      </p>
    </div>
  );
}

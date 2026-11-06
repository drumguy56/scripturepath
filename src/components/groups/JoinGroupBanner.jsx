import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function JoinGroupBanner({ code, onDismiss }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const join = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await base44.functions.invoke('studyGroupMembership', {
        action: 'join',
        invite_code: code,
      });
      const group = res.data?.group;
      if (!group) throw new Error(res.data?.error || 'That invite link is not valid.');
      navigate(`/groups/${group.id}`);
    } catch (err) {
      setError(
        err?.response?.data?.error || err?.message || 'That invite link is not valid.'
      );
      setBusy(false);
    }
  };

  return (
    <div className="mt-10 flex flex-wrap items-center gap-4 rounded-[14px] bg-secondary/70 px-5 py-4">
      <div className="min-w-0">
        <p className="text-[13.5px]">
          You have an invite — code <span className="font-mono tracking-[0.16em]">{code}</span>
        </p>
        {error && <p className="mt-1 text-[12.5px] text-destructive">{error}</p>}
      </div>
      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={join}
          disabled={busy}
          className="rounded-full border border-foreground bg-foreground px-4 py-2 text-[12px] uppercase tracking-[0.12em] text-background disabled:opacity-60"
        >
          {busy ? 'Joining…' : 'Join group'}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[12px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
        >
          Later
        </button>
      </div>
    </div>
  );
}
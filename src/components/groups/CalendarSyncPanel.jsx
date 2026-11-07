import { useEffect, useState } from 'react';
import { CalendarPlus, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CONNECTOR_ID = '6aee69fd5485e89c4874baf5';

export default function CalendarSyncPanel({ groupId }) {
  const [connected, setConnected] = useState(false);
  const [checking, setChecking] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const check = async () => {
    const res = await base44.functions.invoke('calendarStatus', {});
    setConnected(Boolean(res.data?.connected));
  };

  useEffect(() => {
    (async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (authed) await check();
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  const connect = async () => {
    setError('');
    const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
    const popup = window.open(url, '_blank');
    const timer = setInterval(async () => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        setChecking(true);
        try {
          await check();
        } finally {
          setChecking(false);
        }
      }
    }, 500);
  };

  const sync = async () => {
    setSyncing(true);
    setError('');
    setResult(null);
    try {
      const res = await base44.functions.invoke('syncGroupSessions', {
        group_id: groupId,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      setResult(res.data);
    } catch (err) {
      if (err?.response?.status === 409) setConnected(false);
      else setError(err?.response?.data?.error || 'Could not reach Google Calendar.');
    } finally {
      setSyncing(false);
    }
  };

  const disconnect = async () => {
    await base44.connectors.disconnectAppUser(CONNECTOR_ID);
    setConnected(false);
    setResult(null);
  };

  if (checking) {
    return <p className="mt-5 text-[12.5px] text-muted-foreground">Checking your calendar…</p>;
  }

  return (
    <div className="mt-5 rounded-[14px] border border-border/80 bg-card/40 p-5">
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        Sessions are added to your own Google Calendar with a reminder one day before and an email
        one hour before.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {connected ? (
          <>
            <button
              type="button"
              onClick={sync}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-full border border-foreground bg-foreground px-4 py-2 text-[12px] uppercase tracking-[0.12em] text-background disabled:opacity-60"
            >
              {syncing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CalendarPlus className="h-3.5 w-3.5" />
              )}
              {result ? 'Update my calendar' : 'Add to my calendar'}
            </button>
            <button
              type="button"
              onClick={disconnect}
              className="text-[11.5px] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={connect}
            className="inline-flex items-center gap-2 rounded-full border border-foreground bg-foreground px-4 py-2 text-[12px] uppercase tracking-[0.12em] text-background"
          >
            <CalendarPlus className="h-3.5 w-3.5" /> Connect Google Calendar
          </button>
        )}
      </div>

      {result && (
        <p className="mt-3 text-[12.5px] text-foreground/80">
          {result.synced} of {result.total} sessions are on your calendar.
          {result.failed > 0 && ` ${result.failed} could not be added.`}
        </p>
      )}
      {error && <p className="mt-3 text-[12.5px] text-destructive">{error}</p>}
    </div>
  );
}
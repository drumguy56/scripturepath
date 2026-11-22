import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function InvitePanel({ code }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/groups?code=${code}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast({ title: 'Invite link copied', description: 'Send it to a friend — they join after signing in.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Could not copy', description: link, variant: 'destructive' });
    }
  };

  return (
    <div className="rounded-[14px] border border-border/80 p-5">
      <p className="eyebrow">Invite friends</p>
      <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
        Share this link with anyone you want in the group.
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-[8px] border border-dashed border-border px-4 py-3">
        <span className="font-mono text-[15px] tracking-[0.18em]">{code}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>

      <p className="mt-3 break-all text-[12px] leading-relaxed text-muted-foreground">{link}</p>
    </div>
  );
}
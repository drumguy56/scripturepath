import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const makeCode = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(3)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();

export default function CreateGroupDialog({ open, onOpenChange, onCreated }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [studyId, setStudyId] = useState('');
  const [studies, setStudies] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    (async () => {
      const page = await base44.entities.Study.list({ sort: 'order', limit: 50 });
      setStudies(page.items);
    })();
  }, [open]);

  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError('');
    try {
      const displayName = user?.full_name || user?.email || 'Host';
      const study = studies.find((item) => item.id === studyId);
      const group = await base44.entities.StudyGroup.create({
        name: name.trim(),
        description: description.trim(),
        study_id: study?.id || '',
        study_title: study?.title || '',
        invite_code: makeCode(),
        members: [user.id],
        member_profiles: [{ user_id: user.id, name: displayName }],
      });
      onOpenChange(false);
      onCreated(group);
    } catch (err) {
      setError(err?.message || 'Could not create the group.');
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-[22px]">New study group</DialogTitle>
          <DialogDescription>
            Name your group and pick a study. You can invite friends once it exists.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <Input
            placeholder="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Textarea
            placeholder="Who is this for? (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <select
            value={studyId}
            onChange={(e) => setStudyId(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-[14px]"
          >
            <option value="">Choose a study (optional)</option>
            {studies.map((study) => (
              <option key={study.id} value={study.id}>
                {study.title}
              </option>
            ))}
          </select>

          {error && <p className="text-[13px] text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="w-full rounded-full border border-foreground bg-foreground py-2.5 text-[12px] uppercase tracking-[0.14em] text-background disabled:opacity-60"
          >
            {busy ? 'Creating…' : 'Create group'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import InvitePanel from '@/components/groups/InvitePanel';
import MemberList from '@/components/groups/MemberList';

export default function GroupDetail() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [status, setStatus] = useState('loading');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const record = await base44.entities.StudyGroup.get(groupId);
        if (active) {
          setGroup(record);
          setStatus('ready');
        }
      } catch {
        if (active) setStatus('denied');
      }
    })();
    return () => {
      active = false;
    };
  }, [groupId]);

  const leave = async () => {
    if (!window.confirm('Leave this group?')) return;
    setBusy(true);
    try {
      await base44.functions.invoke('studyGroupMembership', {
        action: 'leave',
        group_id: groupId,
      });
      navigate('/groups');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this group for everyone?')) return;
    setBusy(true);
    try {
      await base44.entities.StudyGroup.delete(groupId);
      navigate('/groups');
    } finally {
      setBusy(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-[760px] px-5 pt-16 sm:px-8">
        <div className="h-40 animate-pulse rounded-[14px] bg-secondary" />
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="mx-auto max-w-[760px] px-5 pt-16 sm:px-8">
        <p className="eyebrow">Groups</p>
        <h1 className="mt-3 text-[26px] leading-tight">This group is not yours yet.</h1>
        <p className="mt-3 text-[14px] text-muted-foreground">
          Ask the host for the invite link to join.
        </p>
        <Link
          to="/groups"
          className="mt-6 inline-block text-[12.5px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
        >
          Back to groups
        </Link>
      </div>
    );
  }

  const isOwner = group.created_by_id === user?.id;

  return (
    <div className="mx-auto max-w-[760px] px-5 pt-10 sm:px-8">
      <Link
        to="/groups"
        className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All groups
      </Link>

      <p className="eyebrow mt-8">{group.study_title || 'Group'}</p>
      <h1 className="mt-3 text-[clamp(1.8rem,4vw,2.4rem)] leading-tight">{group.name}</h1>
      {group.description && (
        <p className="mt-3 max-w-[560px] text-[14.5px] leading-[1.7] text-foreground/75">
          {group.description}
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        {group.study_id && (
          <Link
            to={`/study/${group.study_id}`}
            className="rounded-full border border-foreground bg-foreground px-4 py-2 text-[12px] uppercase tracking-[0.12em] text-background"
          >
            Open the study
          </Link>
        )}
        {isOwner ? (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="rounded-full border border-border px-4 py-2 text-[12px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
          >
            Delete group
          </button>
        ) : (
          <button
            type="button"
            onClick={leave}
            disabled={busy}
            className="rounded-full border border-border px-4 py-2 text-[12px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
          >
            Leave group
          </button>
        )}
      </div>

      <div className="mt-10 grid gap-8 border-t border-border/80 pt-8 sm:grid-cols-2">
        <InvitePanel code={group.invite_code} />
        <div>
          <p className="eyebrow">Members</p>
          <div className="mt-3">
            <MemberList
              members={group.member_profiles || []}
              ownerId={group.created_by_id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
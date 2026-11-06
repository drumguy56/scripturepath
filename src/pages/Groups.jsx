import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import GroupCard from '@/components/groups/GroupCard';
import CreateGroupDialog from '@/components/groups/CreateGroupDialog';
import JoinGroupBanner from '@/components/groups/JoinGroupBanner';

export default function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [memberNames, setMemberNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [memberCount, setMemberCount] = useState(0);
  const [creating, setCreating] = useState(false);
  const [inviteCode, setInviteCode] = useState(
    new URLSearchParams(window.location.search).get('code') || ''
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [page, stats] = await Promise.all([
          base44.entities.StudyGroup.list({ sort: '-updated_date', limit: 50 }),
          base44.functions.invoke('communityStats').catch(() => null),
        ]);
        const names = page.items.length
          ? await base44.functions
              .invoke('groupMembers', { group_ids: page.items.map((group) => group.id) })
              .catch(() => null)
          : null;
        if (!active) return;
        setGroups(page.items);
        setMemberNames(names?.data?.groups || {});
        setMemberCount(stats?.data?.members || 0);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-[1180px] px-5 pt-14 sm:px-8 md:pt-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Groups</p>
          <h1 className="mt-4 text-[clamp(1.9rem,4.2vw,2.75rem)] leading-[1.15]">
            Study together.
          </h1>
          <p className="mt-4 max-w-[520px] text-[15px] leading-[1.7] text-foreground/70">
            Start a group for your friends, small group or family. Share the invite link and
            everyone walks through the same study at their own pace.
          </p>
          {!loading && memberCount > 0 && (
            <p className="mt-5 text-[11.5px] uppercase tracking-[0.12em] text-muted-foreground">
              {memberCount} readers in the app
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-full border border-foreground bg-foreground px-5 py-2.5 text-[12.5px] uppercase tracking-[0.12em] text-background transition-opacity hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> New group
        </button>
      </div>

      {inviteCode && (
        <JoinGroupBanner
          code={inviteCode}
          onDismiss={() => setInviteCode('')}
        />
      )}

      {loading ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[150px] animate-pulse rounded-[14px] bg-secondary" />
          ))}
        </div>
      ) : groups.length > 0 ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} memberNames={memberNames[group.id]} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-[14px] border border-dashed border-border px-6 py-16 text-center">
          <p className="text-[14px] text-muted-foreground">
            No groups yet. Create one, then send the invite link to a friend.
          </p>
        </div>
      )}

      <CreateGroupDialog
        open={creating}
        onOpenChange={setCreating}
        onCreated={(group) => navigate(`/groups/${group.id}`)}
      />
    </div>
  );
}
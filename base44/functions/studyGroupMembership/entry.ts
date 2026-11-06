import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Join a study group with an invite code, or leave one you are part of.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth
      .me()
      .catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action;
    if (action !== 'join' && action !== 'leave') {
      return Response.json({ error: 'action must be join or leave' }, { status: 400 });
    }

    const displayName = user.full_name || user.email || 'Member';

    if (action === 'join') {
      const code = String(body.invite_code || '').trim().toUpperCase();
      if (!code) return Response.json({ error: 'An invite code is required' }, { status: 400 });

      const { items } = await base44.asServiceRole.entities.StudyGroup.filter(
        { invite_code: code },
        { limit: 1 }
      );
      const group = items[0];
      if (!group) return Response.json({ error: 'That invite code is not valid' }, { status: 404 });

      const members = group.members || [];
      if (members.includes(user.id)) return Response.json({ group });

      const updated = await base44.asServiceRole.entities.StudyGroup.update(group.id, {
        members: [...members, user.id],
        member_profiles: [
          ...(group.member_profiles || []),
          { user_id: user.id, name: displayName },
        ],
      });
      return Response.json({ group: updated });
    }

    const groupId = String(body.group_id || '');
    if (!groupId) return Response.json({ error: 'group_id is required' }, { status: 400 });

    const group = await base44.asServiceRole.entities.StudyGroup.get(groupId).catch((e) =>
      e.status === 404 ? null : Promise.reject(e)
    );
    if (!group) return Response.json({ error: 'Group not found' }, { status: 404 });
    if (!(group.members || []).includes(user.id)) {
      return Response.json({ error: 'You are not in this group' }, { status: 403 });
    }
    if (group.created_by_id === user.id) {
      return Response.json({ error: 'The host cannot leave the group' }, { status: 400 });
    }

    const updated = await base44.asServiceRole.entities.StudyGroup.update(groupId, {
      members: (group.members || []).filter((id) => id !== user.id),
      member_profiles: (group.member_profiles || []).filter((p) => p.user_id !== user.id),
    });
    return Response.json({ group: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
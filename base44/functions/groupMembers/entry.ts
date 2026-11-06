import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Resolve the display names of everyone currently joined to the given study groups.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth
      .me()
      .catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const requested = Array.isArray(body.group_ids)
      ? body.group_ids
          .slice(0, 50)
          .map(String)
          .filter((id) => /^[0-9a-f]{24}$/i.test(id))
      : [];
    if (requested.length === 0) return Response.json({ groups: {} });

    const { items } = await base44.asServiceRole.entities.StudyGroup.filter(
      { id: { $in: requested } },
      { limit: 50 }
    );

    const groups = {};
    const nameCache = new Map();

    for (const group of items) {
      const memberIds = group.members || [];
      const allowed =
        memberIds.includes(user.id) || group.created_by_id === user.id || user.role === 'admin';
      if (!allowed) continue;

      const stored = new Map(
        (group.member_profiles || []).map((profile) => [profile.user_id, profile.name])
      );

      const members = [];
      for (const memberId of memberIds) {
        let name = stored.get(memberId);
        if (!name) {
          if (!nameCache.has(memberId)) {
            const record = await base44.asServiceRole.entities.User.get(memberId).catch(() => null);
            nameCache.set(memberId, record?.full_name || record?.email || 'Member');
          }
          name = nameCache.get(memberId);
        }
        members.push({ user_id: memberId, name });
      }

      groups[group.id] = members;
    }

    return Response.json({ groups });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
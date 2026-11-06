import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// A single community number for the home screen. No user details are returned.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth
      .me()
      .catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const users = await base44.asServiceRole.entities.User.list();
    return Response.json({ members: users.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
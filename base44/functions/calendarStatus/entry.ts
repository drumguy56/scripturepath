import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const CONNECTOR_ID = '6aee69fd5485e89c4874baf5';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    try {
      await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
      return Response.json({ connected: true });
    } catch {
      return Response.json({ connected: false });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
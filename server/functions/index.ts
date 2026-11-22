import type { Actor } from '../lib/auth';
import { getBibleChapter } from './bible';
import * as groups from './groups';
import { getWeather } from './weather';

// Every named server function the frontend can invoke at POST /api/functions/:name.
type Handler = (actor: Actor, body: Record<string, any>) => Promise<unknown>;

export const functions: Record<string, Handler> = {
  calendarStatus: (actor) => groups.calendarStatus(actor),
  communityStats: () => groups.communityStats(),
  groupMembers: (actor, body) => groups.groupMembers(actor, body),
  groupProgress: (actor, body) => groups.groupProgress(actor, body),
  groupSessions: (actor, body) => groups.groupSessions(actor, body),
  memberBadges: (actor, body) => groups.memberBadges(actor, body),
  studyGroupMembership: (actor, body) => groups.studyGroupMembership(actor, body),
  syncGroupSessions: (actor, body) => groups.syncGroupSessions(actor, body),
  seedCurriculum: (actor) => groups.seedCurriculum(actor),
  getWeather: (actor, body) => getWeather(actor, body),
  getBibleChapter: (actor, body) => getBibleChapter(actor, body),
};

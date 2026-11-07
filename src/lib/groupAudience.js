// Everyone who may read a thread: the group's member ids, the people list the
// app resolved for the group, its host, and the reader writing the record.
export function groupAudience(group, people, user) {
  return Array.from(
    new Set(
      [
        ...(group?.members || []),
        ...(people || []).map((person) => person?.user_id),
        group?.created_by_id,
        user?.id,
      ].filter(Boolean)
    )
  );
}
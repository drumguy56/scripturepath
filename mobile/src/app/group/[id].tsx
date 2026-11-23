import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { entities, functions, WEB_BASE, type Row } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Body, Button, Card, ErrorText, Eyebrow, Loading, Title } from '../../lib/ui';
import { colors } from '../../lib/theme';

type Member = { user_id: string; name: string };

export default function GroupDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [group, setGroup] = useState<Row | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'denied'>('loading');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const record = await entities.StudyGroup.get(id);
      const resolved = await functions.invoke('groupMembers', { group_ids: [id] }).catch(() => null);
      setGroup(record);
      setMembers(resolved?.data?.groups?.[id] || record.member_profiles || []);
      setState('ready');
    } catch {
      setState('denied');
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (state === 'loading') return <Loading />;
  if (state === 'denied' || !group) {
    return (
      <View style={styles.wrap}>
        <Title>This group is not yours yet.</Title>
        <Body style={{ color: colors.muted }}>Ask the host for the invite code to join.</Body>
      </View>
    );
  }

  const isHost = group.created_by_id === user?.id;

  const invite = () =>
    Share.share({
      message: `Join my study group "${group.name}" on ScripturePath. Invite code: ${group.invite_code}\n${WEB_BASE}/groups?code=${group.invite_code}`,
    });

  const run = (action: () => Promise<unknown>, after?: () => void) => async () => {
    setBusy(true);
    setError('');
    try {
      await action();
      after?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setBusy(false);
    }
  };

  const leave = () =>
    Alert.alert('Leave this group?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: run(
          () => functions.invoke('studyGroupMembership', { action: 'leave', group_id: id }),
          () => router.back(),
        ),
      },
    ]);

  const remove = () =>
    Alert.alert('Delete this group?', 'It is removed for everyone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: run(() => entities.StudyGroup.delete(id), () => router.back()),
      },
    ]);

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Stack.Screen options={{ title: group.name }} />
      <Eyebrow>{group.study_title || 'Group'}</Eyebrow>
      <Title>{group.name}</Title>
      {group.description ? <Body style={{ color: colors.muted, marginBottom: 16 }}>{group.description}</Body> : null}

      {group.study_id ? (
        <View style={{ marginBottom: 12 }}>
          <Button label="Open the study" variant="ghost" onPress={() => router.push(`/study/${group.study_id}`)} />
        </View>
      ) : null}

      {isHost ? (
        <Card style={{ marginBottom: 16 }}>
          <Text style={styles.label}>Invite code</Text>
          <Text style={styles.code}>{group.invite_code}</Text>
          <View style={{ marginTop: 12 }}>
            <Button label="Share invite" variant="ghost" onPress={invite} />
          </View>
        </Card>
      ) : null}

      <Card style={{ marginBottom: 16 }}>
        <Text style={styles.label}>
          {members.length} {members.length === 1 ? 'member' : 'members'}
        </Text>
        {members.map((m) => (
          <Text key={m.user_id} style={styles.member}>
            {m.name || 'Reader'}
            {m.user_id === group.created_by_id ? '  · host' : ''}
            {m.user_id === user?.id ? '  · you' : ''}
          </Text>
        ))}
      </Card>

      {error ? <ErrorText>{error}</ErrorText> : null}

      <View style={{ marginTop: 8, gap: 10 }}>
        {isHost ? (
          <Button label="Delete group" variant="ghost" onPress={remove} disabled={busy} />
        ) : (
          <Button label="Leave group" variant="ghost" onPress={leave} disabled={busy} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 40, backgroundColor: colors.background, flexGrow: 1 },
  label: { color: colors.muted, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
  code: { color: colors.ink, fontSize: 22, fontWeight: '700', letterSpacing: 3 },
  member: { color: colors.ink, fontSize: 16, lineHeight: 28 },
});

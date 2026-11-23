import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { entities, functions, ApiError, type Row } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Body, Button, Card, ErrorText, Eyebrow, Loading, Title, inputStyle } from '../../lib/ui';
import { colors } from '../../lib/theme';

export default function Groups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Row[] | null>(null);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  const load = useCallback(async () => {
    try {
      const page = await entities.StudyGroup.list({ sort: '-updated_date', limit: 50 });
      setGroups(page.items);
      setError('');
    } catch {
      setError('Could not load your groups.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const join = async () => {
    const invite = code.trim().toUpperCase();
    if (!invite) return;
    setJoining(true);
    setJoinError('');
    try {
      const res = await functions.invoke('studyGroupMembership', { action: 'join', invite_code: invite });
      const group = res.data?.group;
      if (!group) throw new Error('That invite code is not valid.');
      setCode('');
      router.push(`/group/${group.id}`);
    } catch (err) {
      setJoinError(err instanceof ApiError || err instanceof Error ? err.message : 'That invite code is not valid.');
    } finally {
      setJoining(false);
    }
  };

  if (groups === null && !error) return <Loading />;

  return (
    <FlatList
      data={groups ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.wrap}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.primary} />}
      ListHeaderComponent={
        <View style={{ marginBottom: 12 }}>
          <Eyebrow>Groups</Eyebrow>
          <Title>Study together</Title>
          <Body style={{ color: colors.muted, marginBottom: 16 }}>
            Start a group for friends, a small group or family. Share the invite code and everyone works through the same study at their own pace.
          </Body>
          <Button label="New group" onPress={() => router.push('/group/new')} />

          <View style={styles.joinBox}>
            <Text style={styles.label}>Have an invite code?</Text>
            <View style={styles.joinRow}>
              <TextInput
                value={code}
                onChangeText={setCode}
                autoCapitalize="characters"
                autoCorrect={false}
                placeholder="Invite code"
                placeholderTextColor={colors.muted}
                style={[inputStyle, styles.joinInput]}
              />
              <Pressable onPress={join} disabled={joining || !code.trim()} style={[styles.joinButton, (joining || !code.trim()) && { opacity: 0.5 }]}>
                <Text style={styles.joinButtonText}>{joining ? 'Joining…' : 'Join'}</Text>
              </Pressable>
            </View>
            {joinError ? <ErrorText>{joinError}</ErrorText> : null}
          </View>

          {error ? <ErrorText>{error}</ErrorText> : null}
        </View>
      }
      ListEmptyComponent={
        error ? undefined : (
          <Card>
            <Body style={{ color: colors.muted }}>No groups yet. Create one, then send the invite code to a friend.</Body>
          </Card>
        )
      }
      renderItem={({ item }) => {
        const members: { name?: string }[] = item.member_profiles || [];
        const count = (item.members || []).length;
        return (
          <Pressable onPress={() => router.push(`/group/${item.id}`)} style={{ marginBottom: 12 }}>
            <Card>
              <Eyebrow>{item.study_title || 'Group'}</Eyebrow>
              <Text style={styles.groupName}>{item.name}</Text>
              {item.description ? <Body style={{ color: colors.muted, marginTop: 4 }}>{item.description}</Body> : null}
              <Text style={styles.meta}>
                {count} {count === 1 ? 'member' : 'members'}
                {members.length ? ` · ${members.slice(0, 3).map((m) => m.name).filter(Boolean).join(', ')}` : ''}
                {item.created_by_id === user?.id ? ' · You host' : ''}
              </Text>
            </Card>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 40, backgroundColor: colors.background, flexGrow: 1 },
  joinBox: { marginTop: 24, marginBottom: 8 },
  label: { color: colors.ink, fontSize: 15, fontWeight: '600', marginBottom: 8 },
  joinRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  joinInput: { flex: 1, marginBottom: 0, letterSpacing: 2 },
  joinButton: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 10, paddingVertical: 13, paddingHorizontal: 18 },
  joinButtonText: { color: colors.ink, fontWeight: '600', fontSize: 16 },
  groupName: { color: colors.ink, fontSize: 19, fontWeight: '600', marginTop: 4 },
  meta: { color: colors.muted, fontSize: 13, marginTop: 10 },
});

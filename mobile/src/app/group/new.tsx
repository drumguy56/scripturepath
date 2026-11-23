import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { entities, type Row } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Button, ErrorText, Eyebrow, Title, inputStyle } from '../../lib/ui';
import { colors } from '../../lib/theme';

const makeCode = () =>
  Array.from({ length: 3 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('').toUpperCase();

export default function NewGroup() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [studies, setStudies] = useState<Row[]>([]);
  const [studyId, setStudyId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    entities.Study.list({ sort: 'order', limit: 50 })
      .then((page) => setStudies(page.items))
      .catch(() => setError('Could not load studies.'));
  }, []);

  const submit = async () => {
    if (!name.trim() || !user) return;
    setBusy(true);
    setError('');
    try {
      const study = studies.find((s) => s.id === studyId);
      const group = await entities.StudyGroup.create({
        name: name.trim(),
        description: description.trim(),
        study_id: study?.id || '',
        study_title: study?.title || '',
        invite_code: makeCode(),
        members: [user.id],
        member_profiles: [{ user_id: user.id, name: user.name || user.email || 'Host' }],
      });
      router.replace(`/group/${group.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the group.');
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
      <Eyebrow>New group</Eyebrow>
      <Title>Name your group</Title>

      <Text style={styles.label}>Group name</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Tuesday night men's study" placeholderTextColor={colors.muted} style={inputStyle} />

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="What you want from this group"
        placeholderTextColor={colors.muted}
        style={[inputStyle, { minHeight: 80, textAlignVertical: 'top' }]}
      />

      <Text style={styles.label}>Study</Text>
      <View style={styles.chips}>
        {studies.map((study) => {
          const active = study.id === studyId;
          return (
            <Pressable key={study.id} onPress={() => setStudyId(active ? '' : study.id)} style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && { color: colors.primaryInk }]}>{study.title}</Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <ErrorText>{error}</ErrorText> : null}
      <View style={{ marginTop: 20 }}>
        <Button label={busy ? 'Creating…' : 'Create group'} onPress={submit} disabled={busy || !name.trim()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 24, paddingBottom: 48, backgroundColor: colors.background, flexGrow: 1 },
  label: { color: colors.ink, fontSize: 15, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: colors.card },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.ink, fontSize: 14 },
});

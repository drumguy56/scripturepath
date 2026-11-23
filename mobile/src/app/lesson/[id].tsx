import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { entities, type Row } from '../../lib/api';
import { Body, Button, Card, ErrorText, Eyebrow, Loading, Title, inputStyle } from '../../lib/ui';
import { colors, fonts } from '../../lib/theme';

export default function LessonScreen() {
  const { id: lessonId } = useLocalSearchParams<{ id: string }>();
  const [lesson, setLesson] = useState<Row | null>(null);
  const [study, setStudy] = useState<Row | null>(null);
  const [siblings, setSiblings] = useState<Row[]>([]);
  const [progress, setProgress] = useState<Row | null>(null);
  const [entries, setEntries] = useState<Row[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setState('loading');
    (async () => {
      try {
        const record = await entities.Lesson.get(lessonId).catch((e: { status?: number }) =>
          e.status === 404 ? null : Promise.reject(e)
        );
        if (!active) return;
        if (!record) return setState('missing');

        const [studyRecord, lessonPage, progressPage, entryPage] = await Promise.all([
          entities.Study.get(record.study_id),
          entities.Lesson.filter({ study_id: record.study_id }, { sort: 'order', limit: 100 }),
          entities.StudyProgress.filter({ study_id: record.study_id }),
          entities.JournalEntry.filter({ lesson_id: lessonId }, { sort: '-created_date', limit: 50 }),
        ]);
        if (!active) return;

        let current = progressPage.items[0] ?? null;
        if (current) {
          if (current.last_lesson_id !== lessonId) {
            current = await entities.StudyProgress.update(current.id, { last_lesson_id: lessonId, last_active: new Date().toISOString() });
          }
        } else {
          current = await entities.StudyProgress.create({
            study_id: record.study_id,
            study_title: studyRecord.title,
            completed_lesson_ids: [],
            last_lesson_id: lessonId,
            last_active: new Date().toISOString(),
          });
        }
        if (!active) return;

        const map: Record<string, string> = {};
        (record.reflection_prompts || []).forEach((prompt: string) => {
          map[prompt] = entryPage.items.find((e) => e.prompt === prompt)?.content || '';
        });
        setLesson(record);
        setStudy(studyRecord);
        setSiblings(lessonPage.items);
        setProgress(current);
        setEntries(entryPage.items);
        setDrafts(map);
        setState('ready');
      } catch {
        if (active) setState('error');
      }
    })();
    return () => {
      active = false;
    };
  }, [lessonId]);

  const index = useMemo(() => siblings.findIndex((item) => item.id === lessonId), [siblings, lessonId]);
  const nextLesson = index >= 0 ? siblings[index + 1] : null;
  const isComplete = (progress?.completed_lesson_ids || []).includes(lessonId);

  const saveReflection = async (prompt: string) => {
    const content = (drafts[prompt] || '').trim();
    if (!content) return;
    setError(null);
    try {
      const existing = entries.find((e) => e.prompt === prompt);
      if (existing) {
        if (existing.content !== content) {
          const updated = await entities.JournalEntry.update(existing.id, { content });
          setEntries((list) => list.map((e) => (e.id === updated.id ? updated : e)));
        }
      } else {
        const created = await entities.JournalEntry.create({
          study_id: lesson?.study_id,
          study_title: study?.title,
          lesson_id: lessonId,
          lesson_title: lesson?.title,
          prompt,
          content,
        });
        setEntries((list) => [...list, created]);
      }
      setSaved(prompt);
    } catch {
      setError('Could not save your answer. Try again.');
    }
  };

  const markComplete = async () => {
    if (!progress) return;
    setBusy(true);
    setError(null);
    try {
      const done = progress.completed_lesson_ids || [];
      const nextDone = done.includes(lessonId) ? done : [...done, lessonId];
      const updated = await entities.StudyProgress.update(progress.id, {
        completed_lesson_ids: nextDone,
        last_lesson_id: lessonId,
        last_active: new Date().toISOString(),
      });
      setProgress(updated);
      if (nextLesson) router.replace({ pathname: '/lesson/[id]', params: { id: nextLesson.id } });
      else router.back();
    } catch {
      setError('Could not mark this lesson complete. Try again.');
    } finally {
      setBusy(false);
    }
  };

  if (state === 'loading') return <Loading />;
  if (state === 'error') return <View style={styles.wrap}><ErrorText>Could not load this lesson.</ErrorText></View>;
  if (state === 'missing' || !lesson) return <View style={styles.wrap}><Title>This lesson is not here.</Title></View>;

  const paragraphs = (lesson.teaching || '').split('\n\n').filter(Boolean);

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: study?.title ?? 'Lesson' }} />
      <Eyebrow>{study?.title}</Eyebrow>
      <Title>{lesson.title}</Title>

      {lesson.scripture_reference ? (
        <Card style={{ marginBottom: 20 }}>
          <Text style={styles.refLabel}>{lesson.scripture_reference}</Text>
          {lesson.scripture_text ? <Text style={styles.scripture}>{lesson.scripture_text}</Text> : null}
        </Card>
      ) : null}

      {paragraphs.map((p: string, i: number) => (
        <Text key={i} style={styles.teaching}>{p}</Text>
      ))}

      {lesson.prayer ? (
        <Card style={{ marginVertical: 20 }}>
          <Eyebrow>Prayer</Eyebrow>
          <Text style={styles.prayer}>{lesson.prayer}</Text>
        </Card>
      ) : null}

      {(lesson.reflection_prompts || []).length > 0 && (
        <View style={{ gap: 16, marginTop: 8 }}>
          <Eyebrow>Reflect</Eyebrow>
          {(lesson.reflection_prompts as string[]).map((prompt) => (
            <View key={prompt}>
              <Text style={styles.prompt}>{prompt}</Text>
              <TextInput
                style={[inputStyle, { minHeight: 90, textAlignVertical: 'top', marginBottom: 6 }]}
                multiline
                placeholder="Write your answer"
                placeholderTextColor={colors.muted}
                value={drafts[prompt] || ''}
                onChangeText={(text) => {
                  setDrafts((d) => ({ ...d, [prompt]: text }));
                  setSaved(null);
                }}
              />
              <Pressable onPress={() => saveReflection(prompt)} disabled={!(drafts[prompt] || '').trim()}>
                <Text style={[styles.save, !(drafts[prompt] || '').trim() && { opacity: 0.4 }]}>
                  {saved === prompt ? 'Saved to your journal' : 'Save answer'}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {error && <ErrorText>{error}</ErrorText>}

      <View style={{ marginTop: 28, gap: 12 }}>
        {isComplete ? (
          <Body style={{ color: colors.muted, textAlign: 'center' }}>You finished this lesson.</Body>
        ) : (
          <Button label={busy ? 'Saving…' : 'Mark complete'} onPress={markComplete} disabled={busy || !progress} />
        )}
        {nextLesson ? (
          <Button
            label="Next lesson"
            variant="ghost"
            onPress={() => router.replace({ pathname: '/lesson/[id]', params: { id: nextLesson.id } })}
          />
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 48 },
  refLabel: { color: colors.primary, fontWeight: '600', marginBottom: 6 },
  scripture: { color: colors.ink, fontFamily: fonts.serif, fontSize: 16, lineHeight: 25 },
  teaching: { color: colors.ink, fontSize: 16, lineHeight: 26, marginBottom: 14 },
  prayer: { color: colors.ink, fontFamily: fonts.serif, fontSize: 16, lineHeight: 25, fontStyle: 'italic' },
  prompt: { color: colors.ink, fontSize: 15, fontWeight: '600', marginBottom: 8 },
  save: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});

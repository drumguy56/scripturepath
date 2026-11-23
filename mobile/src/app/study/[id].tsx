import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { entities, type Row } from '../../lib/api';
import { Body, Card, ErrorText, Eyebrow, Loading, Title } from '../../lib/ui';
import { colors } from '../../lib/theme';

export default function StudyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [study, setStudy] = useState<Row | null>(null);
  const [lessons, setLessons] = useState<Row[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');

  useEffect(() => {
    let active = true;
    setState('loading');
    (async () => {
      try {
        const [record, lessonPage, progressPage] = await Promise.all([
          entities.Study.get(id).catch((e: { status?: number }) => (e.status === 404 ? null : Promise.reject(e))),
          entities.Lesson.filter({ study_id: id }, { sort: 'order', limit: 100 }),
          entities.StudyProgress.filter({ study_id: id }),
        ]);
        if (!active) return;
        if (!record) return setState('missing');
        setStudy(record);
        setLessons(lessonPage.items);
        setCompleted(progressPage.items[0]?.completed_lesson_ids || []);
        setState('ready');
      } catch {
        if (active) setState('error');
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (state === 'loading') return <Loading />;
  if (state === 'error') return <View style={styles.wrap}><ErrorText>Could not load this study.</ErrorText></View>;
  if (state === 'missing' || !study) return <View style={styles.wrap}><Title>This study is not here.</Title></View>;

  return (
    <View style={styles.wrap}>
      <Stack.Screen options={{ title: study.title }} />
      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 16 }}>
            <Eyebrow>{[study.category, study.level, study.duration_label].filter(Boolean).join(' · ')}</Eyebrow>
            <Title>{study.title}</Title>
            {study.summary ? <Body style={{ color: colors.muted }}>{study.summary}</Body> : null}
            <Text style={styles.count}>
              {completed.length} of {lessons.length} lessons complete
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const done = completed.includes(item.id);
          return (
            <Pressable
              onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: item.id } })}
              style={{ marginBottom: 10 }}
            >
              <Card style={styles.row}>
                <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={done ? colors.primary : colors.muted} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.lessonNo}>Lesson {index + 1}</Text>
                  <Text style={styles.lessonTitle}>{item.title}</Text>
                  {item.scripture_reference ? <Text style={styles.ref}>{item.scripture_reference}</Text> : null}
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </Card>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  count: { color: colors.primary, fontSize: 13, marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  lessonNo: { color: colors.muted, fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase' },
  lessonTitle: { color: colors.ink, fontFamily: 'serif', fontSize: 17, marginTop: 2 },
  ref: { color: colors.muted, fontSize: 13, marginTop: 2 },
});

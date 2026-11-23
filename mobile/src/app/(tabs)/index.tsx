import { useCallback, useState } from 'react';
import { ScrollView, Pressable, Text, View, StyleSheet } from 'react-native';
import { Link, useFocusEffect, router } from 'expo-router';
import { entities, type Row } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Body, Card, Eyebrow, ErrorText, Loading, Title } from '../../lib/ui';
import { colors } from '../../lib/theme';

type Continue = { studyId: string; studyTitle: string; lessonId: string | null; lessonTitle: string | null };

export default function Home() {
  const { user } = useAuth();
  const [studies, setStudies] = useState<Row[] | null>(null);
  const [resume, setResume] = useState<Continue | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [studyPage, progressPage] = await Promise.all([
        entities.Study.list({ sort: 'order', limit: 50 }),
        entities.StudyProgress.list({ sort: '-last_active', limit: 1 }),
      ]);
      setStudies(studyPage.items);
      const latest = progressPage.items[0];
      if (latest?.last_lesson_id) {
        const lesson = await entities.Lesson.get(latest.last_lesson_id).catch(() => null);
        setResume({
          studyId: latest.study_id,
          studyTitle: latest.study_title || 'Your study',
          lessonId: latest.last_lesson_id,
          lessonTitle: lesson?.title ?? null,
        });
      } else {
        setResume(null);
      }
    } catch (err) {
      setError('Could not load your studies. Check your connection and pull to retry.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const firstName = (user?.name || '').split(' ')[0];

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Eyebrow>Welcome{firstName ? `, ${firstName}` : ''}</Eyebrow>
      <Title>Pick up where you left off</Title>

      {error && <ErrorText>{error}</ErrorText>}

      {resume && (
        <Pressable
          onPress={() =>
            resume.lessonId
              ? router.push({ pathname: '/lesson/[id]', params: { id: resume.lessonId } })
              : router.push({ pathname: '/study/[id]', params: { id: resume.studyId } })
          }
        >
          <Card style={{ marginTop: 8, marginBottom: 24 }}>
            <Eyebrow>Continue</Eyebrow>
            <Text style={styles.cardTitle}>{resume.studyTitle}</Text>
            {resume.lessonTitle && <Body style={{ color: colors.muted }}>{resume.lessonTitle}</Body>}
          </Card>
        </Pressable>
      )}

      <Eyebrow>Studies</Eyebrow>
      {!studies && !error && <Loading />}
      {studies?.map((study) => (
        <Link key={study.id} href={{ pathname: '/study/[id]', params: { id: study.id } }} asChild>
          <Pressable>
            <Card style={{ marginBottom: 12 }}>
              <Text style={styles.cardTitle}>{study.title}</Text>
              {study.summary ? <Body style={{ color: colors.muted, fontSize: 14 }}>{study.summary}</Body> : null}
            </Card>
          </Pressable>
        </Link>
      ))}
      {studies?.length === 0 && <Body style={{ color: colors.muted }}>No studies yet.</Body>}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 40, backgroundColor: colors.background, flexGrow: 1 },
  cardTitle: { color: colors.ink, fontFamily: 'serif', fontSize: 19, marginTop: 4 },
});

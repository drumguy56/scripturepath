import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { entities, type Row } from '../../lib/api';
import { Body, Card, ErrorText, Eyebrow, Loading, Title } from '../../lib/ui';
import { colors } from '../../lib/theme';

export default function Journal() {
  const [entries, setEntries] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      entities.JournalEntry.list({ sort: '-created_date', limit: 100 })
        .then((page) => active && setEntries(page.items))
        .catch(() => active && setError('Could not load your journal.'));
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <View style={styles.wrap}>
      {error && <ErrorText>{error}</ErrorText>}
      {!entries && !error && <Loading />}
      {entries && (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          ListHeaderComponent={
            <View style={{ marginBottom: 12 }}>
              <Eyebrow>Journal</Eyebrow>
              <Title>Your reflections</Title>
              <Body style={{ color: colors.muted }}>Write answers in a lesson. They are collected here.</Body>
            </View>
          }
          ListEmptyComponent={<Body style={{ color: colors.muted }}>Nothing written yet.</Body>}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: 12 }}>
              <Text style={styles.meta}>
                {[item.study_title, item.lesson_title].filter(Boolean).join(' · ')}
              </Text>
              {item.prompt ? <Text style={styles.prompt}>{item.prompt}</Text> : null}
              <Body>{item.content}</Body>
              {item.created_date ? (
                <Text style={styles.meta}>{new Date(item.created_date).toLocaleDateString()}</Text>
              ) : null}
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  meta: { color: colors.muted, fontSize: 12, marginBottom: 6 },
  prompt: { color: colors.primary, fontStyle: 'italic', marginBottom: 6, fontSize: 14 },
});

import { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { entities, type Row } from '../../lib/api';
import { Body, Card, ErrorText, Eyebrow, Loading, Title } from '../../lib/ui';
import { colors } from '../../lib/theme';

const FILTERS = ['All', 'Old Testament', 'New Testament', 'Psalms & Wisdom', 'Foundations'];

export default function Library() {
  const [filter, setFilter] = useState('All');
  const [studies, setStudies] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setStudies(null);
    setError(null);
    const query = filter === 'All' ? {} : { category: filter };
    entities.Study.filter(query, { sort: 'order', limit: 50 })
      .then((page) => active && setStudies(page.items))
      .catch(() => active && setError('Could not load the library.'));
    return () => {
      active = false;
    };
  }, [filter]);

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {FILTERS.map((item) => {
          const on = filter === item;
          return (
            <Pressable key={item} onPress={() => setFilter(item)} style={[styles.chip, on && styles.chipOn]}>
              <Text style={{ color: on ? colors.primaryInk : colors.ink, fontSize: 13 }}>{item}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {error && <ErrorText>{error}</ErrorText>}
      {!studies && !error && <Loading />}
      {studies && (
        <FlatList
          data={studies}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingTop: 8 }}
          ListHeaderComponent={
            <View style={{ marginBottom: 12 }}>
              <Eyebrow>The library</Eyebrow>
              <Title>Guided studies</Title>
              <Body style={{ color: colors.muted }}>Each study is a short series of lessons. Your progress is kept for you.</Body>
            </View>
          }
          ListEmptyComponent={<Body style={{ color: colors.muted }}>No studies in this category.</Body>}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push({ pathname: '/study/[id]', params: { id: item.id } })} style={{ marginBottom: 12 }}>
              <Card>
                <Eyebrow>{[item.category, item.level, item.duration_label].filter(Boolean).join(' · ')}</Eyebrow>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.summary ? <Body style={{ color: colors.muted, fontSize: 14 }}>{item.summary}</Body> : null}
              </Card>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  chips: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  chip: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.card, marginRight: 8 },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  cardTitle: { color: colors.ink, fontFamily: 'serif', fontSize: 19, marginTop: 4 },
});

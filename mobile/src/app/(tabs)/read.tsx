import { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { functions } from '../../lib/api';
import { BIBLE_BOOKS, DEFAULT_REFERENCE, findBook, stepReference, type Book } from '../../lib/bible';
import { Body, ErrorText, Loading } from '../../lib/ui';
import { colors, fonts } from '../../lib/theme';

const TRANSLATIONS = [
  { id: 'nlt', label: 'New Living Translation' },
  { id: 'niv', label: 'New International Version (NIV)' },
  { id: 'kjv', label: 'King James Version' },
  { id: 'web', label: 'World English Bible' },
  { id: 'asv', label: 'American Standard Version' },
  { id: 'bbe', label: 'Bible in Basic English' },
  { id: 'ylt', label: "Young's Literal Translation (NT)" },
  { id: 'darby', label: 'Darby Translation' },
  { id: 'esv', label: 'English Standard Version (ESV)' },
  { id: 'bsb', label: 'Berean Standard Bible (BSB)' },
  { id: 'nas', label: 'New American Standard Bible (NASB)' },
  { id: 'amp', label: 'Amplified Bible (AMP)' },
  { id: 'csb', label: 'Christian Standard Bible (CSB)' },
  { id: 'lsb', label: 'Legacy Standard Bible (LSB)' },
  { id: 'net', label: 'New English Translation (NET)' },
  { id: 'cev', label: 'Contemporary English Version (CEV)' },
  { id: 'gnt', label: 'Good News Translation (GNT)' },
  { id: 'isr', label: 'The Scriptures (ISR)' },
  { id: 'isv', label: 'International Standard Version (ISV)' },
  { id: 'erv', label: 'Easy-to-Read Version (ERV)' },
  { id: 'drb', label: 'Douay-Rheims Bible (DRB)' },
  { id: 'ara', label: 'Almeida Revista e Atualizada (ARA)' },
];

const LAST_KEY = 'scripturepath.last-read';
const NIV_NOTICE =
  'Scripture quotations taken from The Holy Bible, New International Version®, NIV®. Copyright © 1973, 1978, 1984, 2011 by Biblica, Inc.® Used by permission. All rights reserved worldwide.';
const NLT_NOTICE =
  'Scripture quotations marked NLT are taken from the Holy Bible, New Living Translation, copyright © 1996, 2004, 2015 by Tyndale House Foundation. Used by permission of Tyndale House Publishers. All rights reserved.';

type Verse = { verse: number; text: string };
type Last = { slug: string; chapter: number; translation: string };

export default function Read() {
  const [ready, setReady] = useState(false);
  const [slug, setSlug] = useState(DEFAULT_REFERENCE.slug);
  const [chapter, setChapter] = useState(DEFAULT_REFERENCE.chapter);
  const [translation, setTranslation] = useState('kjv');
  const [verses, setVerses] = useState<Verse[]>([]);
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [picker, setPicker] = useState<null | 'book' | 'chapter' | 'translation'>(null);

  const book = findBook(slug) ?? BIBLE_BOOKS[0];

  // Restore the last passage the reader had open.
  useEffect(() => {
    SecureStore.getItemAsync(LAST_KEY)
      .then((raw) => {
        if (raw) {
          const last = JSON.parse(raw) as Last;
          if (findBook(last.slug)) {
            setSlug(last.slug);
            setChapter(last.chapter);
          }
          if (TRANSLATIONS.some((t) => t.id === last.translation)) setTranslation(last.translation);
        }
      })
      .catch(() => null)
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    SecureStore.setItemAsync(LAST_KEY, JSON.stringify({ slug, chapter, translation } satisfies Last)).catch(() => null);
  }, [ready, slug, chapter, translation]);

  useEffect(() => {
    if (!ready) return;
    let active = true;
    setLoading(true);
    setError(null);
    functions
      .invoke<{ reference?: string; verses?: Verse[]; error?: string }>('getBibleChapter', {
        book: book.name,
        chapter,
        translation,
      })
      .then(({ data }) => {
        if (!active) return;
        if (data?.error || !data?.verses) {
          setError(data?.error || 'This chapter could not be loaded.');
          setVerses([]);
        } else {
          setVerses(data.verses);
          setReference(data.reference || `${book.name} ${chapter}`);
        }
      })
      .catch(() => {
        if (!active) return;
        setError('Check your connection and try again.');
        setVerses([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [ready, book.name, chapter, translation]);

  const go = (target: { slug: string; chapter: number } | null) => {
    if (!target) return;
    setSlug(target.slug);
    setChapter(target.chapter);
  };
  const previous = stepReference(slug, chapter, -1);
  const next = stepReference(slug, chapter, 1);
  const translationLabel = TRANSLATIONS.find((t) => t.id === translation)?.label;

  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        <Pressable onPress={() => setPicker('book')} style={styles.pill}>
          <Text style={styles.pillText}>{book.name}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.muted} />
        </Pressable>
        <Pressable onPress={() => setPicker('chapter')} style={styles.pill}>
          <Text style={styles.pillText}>Chapter {chapter}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.muted} />
        </Pressable>
        <Pressable onPress={() => setPicker('translation')} style={styles.pill}>
          <Text style={styles.pillText}>{translation.toUpperCase()}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.muted} />
        </Pressable>
      </View>

      <View style={styles.nav}>
        <Pressable disabled={!previous} onPress={() => go(previous)} style={[styles.navBtn, !previous && { opacity: 0.3 }]}>
          <Ionicons name="chevron-back" size={18} color={colors.ink} />
          <Text style={styles.navText}>Previous</Text>
        </Pressable>
        <Text style={styles.ref} numberOfLines={1}>{loading ? 'Loading' : reference}</Text>
        <Pressable disabled={!next} onPress={() => go(next)} style={[styles.navBtn, !next && { opacity: 0.3 }]}>
          <Text style={styles.navText}>Next</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.ink} />
        </Pressable>
      </View>

      {loading ? (
        <Loading />
      ) : error ? (
        <View style={{ padding: 20 }}>
          <ErrorText>{error}</ErrorText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.text}>
          <Text style={styles.translation}>{translationLabel}</Text>
          {verses.map((v) => (
            <Text key={v.verse} style={styles.verse}>
              <Text style={styles.num}>{v.verse} </Text>
              {v.text}
            </Text>
          ))}
          {translation === 'niv' && <Body style={styles.notice}>{NIV_NOTICE}</Body>}
          {translation === 'nlt' && <Body style={styles.notice}>{NLT_NOTICE}</Body>}
        </ScrollView>
      )}

      <Modal visible={picker !== null} animationType="slide" onRequestClose={() => setPicker(null)}>
        <View style={styles.sheet}>
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>
              {picker === 'book' ? 'Book' : picker === 'chapter' ? 'Chapter' : 'Translation'}
            </Text>
            <Pressable onPress={() => setPicker(null)} hitSlop={12}>
              <Text style={styles.done}>Done</Text>
            </Pressable>
          </View>

          {picker === 'book' && (
            <FlatList
              data={BIBLE_BOOKS}
              keyExtractor={(b: Book) => b.slug}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.row}
                  onPress={() => {
                    setSlug(item.slug);
                    setChapter(1);
                    setPicker(null);
                  }}
                >
                  <Text style={[styles.rowText, item.slug === slug && { color: colors.primary, fontWeight: '600' }]}>{item.name}</Text>
                </Pressable>
              )}
            />
          )}

          {picker === 'chapter' && (
            <FlatList
              data={Array.from({ length: book.chapters }, (_, i) => i + 1)}
              numColumns={5}
              keyExtractor={(n) => String(n)}
              contentContainerStyle={{ padding: 16, gap: 10 }}
              columnWrapperStyle={{ gap: 10 }}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.cell, item === chapter && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                  onPress={() => {
                    setChapter(item);
                    setPicker(null);
                  }}
                >
                  <Text style={{ color: item === chapter ? colors.primaryInk : colors.ink, fontSize: 16 }}>{item}</Text>
                </Pressable>
              )}
            />
          )}

          {picker === 'translation' && (
            <FlatList
              data={TRANSLATIONS}
              keyExtractor={(t) => t.id}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.row}
                  onPress={() => {
                    setTranslation(item.id);
                    setPicker(null);
                  }}
                >
                  <Text style={[styles.rowText, item.id === translation && { color: colors.primary, fontWeight: '600' }]}>{item.label}</Text>
                </Pressable>
              )}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  bar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16, paddingBottom: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.card, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  pillText: { color: colors.ink, fontSize: 14 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 4 },
  navText: { color: colors.ink, fontSize: 14 },
  ref: { color: colors.muted, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  text: { padding: 20, paddingBottom: 48 },
  translation: { color: colors.muted, fontSize: 12, marginBottom: 12, letterSpacing: 0.5 },
  verse: { color: colors.ink, fontFamily: fonts.serif, fontSize: 18, lineHeight: 29, marginBottom: 10 },
  num: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  notice: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 24, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.border, paddingTop: 12 },
  sheet: { flex: 1, backgroundColor: colors.background, paddingTop: 20 },
  sheetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  sheetTitle: { color: colors.ink, fontSize: 18, fontWeight: '600' },
  done: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  row: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: colors.card },
  rowText: { color: colors.ink, fontSize: 16 },
  cell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: colors.card },
});

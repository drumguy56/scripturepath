// Canonical book list used by the Bible reader (mirrors src/data/bibleBooks.js).
export type Book = { name: string; slug: string; chapters: number; testament: 'Old' | 'New' };
export const BIBLE_BOOKS: Book[] = [
  { name: 'Genesis', slug: 'genesis', chapters: 50, testament: 'Old' },
  { name: 'Exodus', slug: 'exodus', chapters: 40, testament: 'Old' },
  { name: 'Leviticus', slug: 'leviticus', chapters: 27, testament: 'Old' },
  { name: 'Numbers', slug: 'numbers', chapters: 36, testament: 'Old' },
  { name: 'Deuteronomy', slug: 'deuteronomy', chapters: 34, testament: 'Old' },
  { name: 'Joshua', slug: 'joshua', chapters: 24, testament: 'Old' },
  { name: 'Judges', slug: 'judges', chapters: 21, testament: 'Old' },
  { name: 'Ruth', slug: 'ruth', chapters: 4, testament: 'Old' },
  { name: '1 Samuel', slug: '1-samuel', chapters: 31, testament: 'Old' },
  { name: '2 Samuel', slug: '2-samuel', chapters: 24, testament: 'Old' },
  { name: '1 Kings', slug: '1-kings', chapters: 22, testament: 'Old' },
  { name: '2 Kings', slug: '2-kings', chapters: 25, testament: 'Old' },
  { name: '1 Chronicles', slug: '1-chronicles', chapters: 29, testament: 'Old' },
  { name: '2 Chronicles', slug: '2-chronicles', chapters: 36, testament: 'Old' },
  { name: 'Ezra', slug: 'ezra', chapters: 10, testament: 'Old' },
  { name: 'Nehemiah', slug: 'nehemiah', chapters: 13, testament: 'Old' },
  { name: 'Esther', slug: 'esther', chapters: 10, testament: 'Old' },
  { name: 'Job', slug: 'job', chapters: 42, testament: 'Old' },
  { name: 'Psalms', slug: 'psalms', chapters: 150, testament: 'Old' },
  { name: 'Proverbs', slug: 'proverbs', chapters: 31, testament: 'Old' },
  { name: 'Ecclesiastes', slug: 'ecclesiastes', chapters: 12, testament: 'Old' },
  { name: 'Song of Solomon', slug: 'song-of-solomon', chapters: 8, testament: 'Old' },
  { name: 'Isaiah', slug: 'isaiah', chapters: 66, testament: 'Old' },
  { name: 'Jeremiah', slug: 'jeremiah', chapters: 52, testament: 'Old' },
  { name: 'Lamentations', slug: 'lamentations', chapters: 5, testament: 'Old' },
  { name: 'Ezekiel', slug: 'ezekiel', chapters: 48, testament: 'Old' },
  { name: 'Daniel', slug: 'daniel', chapters: 12, testament: 'Old' },
  { name: 'Hosea', slug: 'hosea', chapters: 14, testament: 'Old' },
  { name: 'Joel', slug: 'joel', chapters: 3, testament: 'Old' },
  { name: 'Amos', slug: 'amos', chapters: 9, testament: 'Old' },
  { name: 'Obadiah', slug: 'obadiah', chapters: 1, testament: 'Old' },
  { name: 'Jonah', slug: 'jonah', chapters: 4, testament: 'Old' },
  { name: 'Micah', slug: 'micah', chapters: 7, testament: 'Old' },
  { name: 'Nahum', slug: 'nahum', chapters: 3, testament: 'Old' },
  { name: 'Habakkuk', slug: 'habakkuk', chapters: 3, testament: 'Old' },
  { name: 'Zephaniah', slug: 'zephaniah', chapters: 3, testament: 'Old' },
  { name: 'Haggai', slug: 'haggai', chapters: 2, testament: 'Old' },
  { name: 'Zechariah', slug: 'zechariah', chapters: 14, testament: 'Old' },
  { name: 'Malachi', slug: 'malachi', chapters: 4, testament: 'Old' },
  { name: 'Matthew', slug: 'matthew', chapters: 28, testament: 'New' },
  { name: 'Mark', slug: 'mark', chapters: 16, testament: 'New' },
  { name: 'Luke', slug: 'luke', chapters: 24, testament: 'New' },
  { name: 'John', slug: 'john', chapters: 21, testament: 'New' },
  { name: 'Acts', slug: 'acts', chapters: 28, testament: 'New' },
  { name: 'Romans', slug: 'romans', chapters: 16, testament: 'New' },
  { name: '1 Corinthians', slug: '1-corinthians', chapters: 16, testament: 'New' },
  { name: '2 Corinthians', slug: '2-corinthians', chapters: 13, testament: 'New' },
  { name: 'Galatians', slug: 'galatians', chapters: 6, testament: 'New' },
  { name: 'Ephesians', slug: 'ephesians', chapters: 6, testament: 'New' },
  { name: 'Philippians', slug: 'philippians', chapters: 4, testament: 'New' },
  { name: 'Colossians', slug: 'colossians', chapters: 4, testament: 'New' },
  { name: '1 Thessalonians', slug: '1-thessalonians', chapters: 5, testament: 'New' },
  { name: '2 Thessalonians', slug: '2-thessalonians', chapters: 3, testament: 'New' },
  { name: '1 Timothy', slug: '1-timothy', chapters: 6, testament: 'New' },
  { name: '2 Timothy', slug: '2-timothy', chapters: 4, testament: 'New' },
  { name: 'Titus', slug: 'titus', chapters: 3, testament: 'New' },
  { name: 'Philemon', slug: 'philemon', chapters: 1, testament: 'New' },
  { name: 'Hebrews', slug: 'hebrews', chapters: 13, testament: 'New' },
  { name: 'James', slug: 'james', chapters: 5, testament: 'New' },
  { name: '1 Peter', slug: '1-peter', chapters: 5, testament: 'New' },
  { name: '2 Peter', slug: '2-peter', chapters: 3, testament: 'New' },
  { name: '1 John', slug: '1-john', chapters: 5, testament: 'New' },
  { name: '2 John', slug: '2-john', chapters: 1, testament: 'New' },
  { name: '3 John', slug: '3-john', chapters: 1, testament: 'New' },
  { name: 'Jude', slug: 'jude', chapters: 1, testament: 'New' },
  { name: 'Revelation', slug: 'revelation', chapters: 22, testament: 'New' },
];

export const DEFAULT_REFERENCE = { slug: 'john', chapter: 1 };

export function findBook(slug: string | null | undefined): Book | null {
  return BIBLE_BOOKS.find((book) => book.slug === slug) || null;
}

export function stepReference(slug: string, chapter: number, direction: 1 | -1) {
  const index = BIBLE_BOOKS.findIndex((book) => book.slug === slug);
  if (index < 0) return null;
  const book = BIBLE_BOOKS[index];
  const nextChapter = chapter + direction;
  if (nextChapter >= 1 && nextChapter <= book.chapters) return { slug: book.slug, chapter: nextChapter };
  const neighbour = BIBLE_BOOKS[index + direction];
  if (!neighbour) return null;
  return { slug: neighbour.slug, chapter: direction > 0 ? 1 : neighbour.chapters };
}

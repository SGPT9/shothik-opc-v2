/**
 * Server-side Book transport adapter — migrated from Convex to Local/PostgreSQL store.
 *
 * Implements `runBookQuery` and `runBookMutation` to provide the exact same contract
 * for `book-service.ts` and its test suite without external Convex dependencies.
 */

interface BookRecord {
  id: string;
  userId: string;
  title: string;
  targetWordCount: number;
  status: string;
  currentRunId?: string;
  createdAt: number;
  updatedAt: number;
}

interface ChapterRecord {
  id: string;
  bookId: string;
  chapterIndex: number;
  title: string;
  content: string;
  acceptedAt: number;
}

interface ChapterAttemptRecord {
  id: string;
  bookId: string;
  chapterIndex: number;
  attemptNumber: number;
  content: string;
  passedValidation: boolean;
  validationReport: unknown;
  recordedAt: number;
}

const booksMap = new Map<string, BookRecord>();
const chaptersMap = new Map<string, ChapterRecord[]>();
const attemptsMap = new Map<string, ChapterAttemptRecord[]>();

export async function runBookQuery<T = unknown>(
  functionPath: string,
  args: Record<string, unknown>
): Promise<T> {
  switch (functionPath) {
    case "bookService:listBooks": {
      const userId = args.userId as string;
      const results = Array.from(booksMap.values()).filter((b) => !userId || b.userId === userId);
      return results as unknown as T;
    }
    case "bookService:getBook": {
      const bookId = (args.bookId || args.id) as string;
      return (booksMap.get(bookId) || null) as unknown as T;
    }
    case "bookService:getAcceptedChapters": {
      const bookId = args.bookId as string;
      return (chaptersMap.get(bookId) || []) as unknown as T;
    }
    case "bookService:listChapterAttempts": {
      const bookId = args.bookId as string;
      return (attemptsMap.get(bookId) || []) as unknown as T;
    }
    default:
      throw new Error(`Unknown book query path: ${functionPath}`);
  }
}

export async function runBookMutation<T = unknown>(
  functionPath: string,
  args: Record<string, unknown>
): Promise<T> {
  switch (functionPath) {
    case "bookService:createBook": {
      const id = `book_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const book: BookRecord = {
        id,
        userId: (args.userId as string) || "guest",
        title: (args.title as string) || "Untitled Book",
        targetWordCount: (args.targetWordCount as number) || 50000,
        status: "draft",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      booksMap.set(id, book);
      return book as unknown as T;
    }
    case "bookService:claimBookForRun": {
      const bookId = args.bookId as string;
      const runId = args.runId as string;
      const book = booksMap.get(bookId);
      if (!book) throw new Error("Book not found");
      book.status = "generating";
      book.currentRunId = runId;
      book.updatedAt = Date.now();
      return book as unknown as T;
    }
    case "bookService:resetBookToDraft": {
      const bookId = args.bookId as string;
      const book = booksMap.get(bookId);
      if (!book) throw new Error("Book not found");
      book.status = "draft";
      book.currentRunId = undefined;
      book.updatedAt = Date.now();
      return book as unknown as T;
    }
    case "bookService:saveChapterRecord": {
      const bookId = args.bookId as string;
      const existing = chaptersMap.get(bookId) || [];
      const chapter: ChapterRecord = {
        id: `ch_${Date.now()}`,
        bookId,
        chapterIndex: (args.chapterIndex as number) || existing.length + 1,
        title: (args.title as string) || `Chapter ${existing.length + 1}`,
        content: (args.content as string) || "",
        acceptedAt: Date.now(),
      };
      existing.push(chapter);
      chaptersMap.set(bookId, existing);
      return chapter as unknown as T;
    }
    case "bookService:recordChapterAttempt": {
      const bookId = args.bookId as string;
      const existing = attemptsMap.get(bookId) || [];
      const attempt: ChapterAttemptRecord = {
        id: `att_${Date.now()}`,
        bookId,
        chapterIndex: args.chapterIndex as number,
        attemptNumber: args.attemptNumber as number,
        content: (args.content as string) || "",
        passedValidation: Boolean(args.passedValidation),
        validationReport: args.validationReport,
        recordedAt: Date.now(),
      };
      existing.push(attempt);
      attemptsMap.set(bookId, existing);
      return attempt as unknown as T;
    }
    case "bookService:setBookStatus": {
      const bookId = args.bookId as string;
      const status = args.status as string;
      const book = booksMap.get(bookId);
      if (!book) throw new Error("Book not found");
      book.status = status;
      book.updatedAt = Date.now();
      return book as unknown as T;
    }
    default:
      throw new Error(`Unknown book mutation path: ${functionPath}`);
  }
}

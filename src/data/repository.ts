import type {
  AddVisitInput,
  CandidateFilter,
  DecisionMode,
  DecisionSession,
  ImportResult,
  ListQuery,
  NotifPermission,
  ParsedRow,
  Restaurant,
  SaveRestaurantInput,
  StartSessionOptions,
  SwipeResult,
  Tag,
  TagCategory,
  UserSettings,
  Visit,
} from "@/domain/models";

/**
 * Repositoryインターフェース (docs/api/api-design.md)。
 *
 * MVPはサーバーを持たないため、これがアプリ層と永続化層の唯一の境界であり、
 * 将来のリモート同期(Supabase)を差し込む同期シームでもある
 * (docs/adr/0002-local-first-with-sync-seam.md)。
 *
 * 全メソッドは呼出側が暗黙に持つ現在のowner_idスコープ内で動作する。
 * 実装はLocalSqliteRepository(同期SQLite)でも、インターフェースは将来のリモート実装と
 * 一致させるためPromiseで統一する。
 */

export interface RestaurantRepository {
  create(input: SaveRestaurantInput): Promise<Restaurant>;
  findById(id: string): Promise<Restaurant | null>;
  findByNormalizedUrl(normalizedUrl: string): Promise<Restaurant | null>;
  list(query: ListQuery): Promise<Restaurant[]>;
  update(id: string, patch: Partial<Restaurant>): Promise<Restaurant>;
  setArchived(id: string, archived: boolean): Promise<void>;
  delete(id: string): Promise<void>;
  /** 決定用の候補集合(archived/visited除外が既定)。 */
  pickCandidates(filter: CandidateFilter): Promise<Restaurant[]>;
}

export interface TagRepository {
  listTags(): Promise<Tag[]>;
  createTag(name: string, category: TagCategory): Promise<Tag>;
  setRestaurantTags(restaurantId: string, tagIds: string[]): Promise<void>;
  seedSystemTags(): Promise<void>;
}

export interface VisitRepository {
  /** restaurants.visited/visit_count/last_visited_atも合わせて更新する。 */
  addVisit(input: AddVisitInput): Promise<Visit>;
  listByRestaurant(restaurantId: string): Promise<Visit[]>;
  updateVisit(id: string, patch: Partial<Visit>): Promise<Visit>;
  /** 決定済みで未記録のセッション(記録うながしバナー用)。 */
  findPendingRecordPrompt(): Promise<DecisionSession | null>;
}

export interface SettingsRepository {
  /** 取得。初回は既定値をシードする。 */
  getSettings(): Promise<UserSettings>;
  updateSettings(patch: Partial<UserSettings>): Promise<UserSettings>;
  setNotifPermission(status: NotifPermission): Promise<void>;
}

export interface ImportRepository {
  parseCsv(fileContent: string): Promise<ParsedRow[]>;
  importBatch(rows: ParsedRow[], mapping: Record<string, string>): Promise<ImportResult>;
  /** バッチで新規作成した行のみ削除する。既存重複は削除しない。 */
  undoBatch(batchId: string): Promise<void>;
}

export interface DecisionRepository {
  /** セッション開始(候補をスナップショット保存)。vote/rankingはopts.participantCountを渡す。 */
  startSession(
    mode: DecisionMode,
    filter: CandidateFilter,
    opts?: StartSessionOptions,
  ): Promise<DecisionSession>;
  getSession(id: string): Promise<DecisionSession>;
  recordSwipe(sessionId: string, restaurantId: string, result: SwipeResult): Promise<void>;
  /** swipeで残った最終候補集合。 */
  keptCandidates(sessionId: string): Promise<Restaurant[]>;
  /** みんなで・投票制: 1票を加算(候補のtally++)。 */
  castVote(sessionId: string, restaurantId: string): Promise<void>;
  /** みんなで・順位制: 並べた順に加点をtallyへ加算。 */
  castRanking(sessionId: string, ranked: string[]): Promise<void>;
  dismissRecordPrompt(sessionId: string): Promise<void>;
  complete(sessionId: string, decidedRestaurantId: string): Promise<void>;
  cancel(sessionId: string): Promise<void>;
}

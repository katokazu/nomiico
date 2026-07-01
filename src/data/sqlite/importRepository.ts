import type { ImportRepository } from "@/data/repository";
import type { ImportResult, ParsedRow } from "@/domain/models";

import type { db as Database } from "./client";

/**
 * CSV一括取り込み (docs/specs/csv-import.md)。MVP直後の初期拡張のため、
 * ひな型段階では未実装。
 */
export class SqliteImportRepository implements ImportRepository {
  constructor(private readonly db: typeof Database) {}

  async parseCsv(_fileContent: string): Promise<ParsedRow[]> {
    throw new Error("not implemented: SqliteImportRepository.parseCsv");
  }

  async importBatch(
    _rows: ParsedRow[],
    _mapping: Record<string, string>,
  ): Promise<ImportResult> {
    throw new Error("not implemented: SqliteImportRepository.importBatch");
  }

  async undoBatch(_batchId: string): Promise<void> {
    throw new Error("not implemented: SqliteImportRepository.undoBatch");
  }
}

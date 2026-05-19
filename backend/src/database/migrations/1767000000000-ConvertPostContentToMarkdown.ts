import { MigrationInterface, QueryRunner } from 'typeorm';
// turndown is a CommonJS module — use require to avoid esModuleInterop issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const TurndownService = require('turndown');

export class ConvertPostContentToMarkdown1767000000000
  implements MigrationInterface
{
  name = 'ConvertPostContentToMarkdown1767000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Backup column for the original HTML — keeps a recovery path until
    // the conversion is verified, after which it can be dropped.
    await queryRunner.query(
      `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "contentHtmlBackup" text`,
    );

    const turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
      emDelimiter: '_',
    });

    // Only convert posts we haven't already backed up — makes this idempotent.
    const rows: Array<{ id: number; content: string | null }> =
      await queryRunner.query(
        `SELECT id, content FROM "posts" WHERE "contentHtmlBackup" IS NULL`,
      );

    for (const row of rows) {
      const html = row.content ?? '';
      const md = turndown.turndown(html);
      await queryRunner.query(
        `UPDATE "posts" SET "contentHtmlBackup" = $1, "content" = $2 WHERE "id" = $3`,
        [html, md, row.id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore HTML from the backup column.
    await queryRunner.query(
      `UPDATE "posts" SET "content" = "contentHtmlBackup" WHERE "contentHtmlBackup" IS NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP COLUMN IF EXISTS "contentHtmlBackup"`,
    );
  }
}

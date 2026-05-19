import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropContentHtmlBackup1767000100000 implements MigrationInterface {
  name = 'DropContentHtmlBackup1767000100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" DROP COLUMN IF EXISTS "contentHtmlBackup"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // The original HTML is gone after up() runs; only the column shape is reversible.
    await queryRunner.query(
      `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "contentHtmlBackup" text`,
    );
  }
}

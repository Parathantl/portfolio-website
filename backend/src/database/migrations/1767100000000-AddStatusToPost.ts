import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToPost1767100000000 implements MigrationInterface {
  name = 'AddStatusToPost1767100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // NOT NULL DEFAULT 'published' backfills every existing row as published,
    // so adding drafts never hides content that was already live.
    await queryRunner.query(
      `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "status" character varying NOT NULL DEFAULT 'published'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" DROP COLUMN IF EXISTS "status"`,
    );
  }
}

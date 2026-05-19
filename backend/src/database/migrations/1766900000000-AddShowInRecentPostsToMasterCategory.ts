import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShowInRecentPostsToMasterCategory1766900000000
  implements MigrationInterface
{
  name = 'AddShowInRecentPostsToMasterCategory1766900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "master_categories" ADD COLUMN IF NOT EXISTS "showInRecentPosts" boolean NOT NULL DEFAULT false`,
    );
    // Defensive: drop the column from categories if it slipped in during dev.
    await queryRunner.query(
      `ALTER TABLE "categories" DROP COLUMN IF EXISTS "showInRecentPosts"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "master_categories" DROP COLUMN IF EXISTS "showInRecentPosts"`,
    );
  }
}

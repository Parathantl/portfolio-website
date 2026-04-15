import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExcerptToPost1766800000000 implements MigrationInterface {
  name = 'AddExcerptToPost1766800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "excerpt" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" DROP COLUMN IF EXISTS "excerpt"`,
    );
  }
}

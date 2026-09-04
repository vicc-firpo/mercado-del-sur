import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductIsActive1788550100000 implements MigrationInterface {
  name = 'AddProductIsActive1788550100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD "is_active" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "is_active"`);
  }
}

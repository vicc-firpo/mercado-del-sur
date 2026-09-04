import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductDescription1788550000000
  implements MigrationInterface
{
  name = 'AddProductDescription1788550000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD "description" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "description"`);
  }
}

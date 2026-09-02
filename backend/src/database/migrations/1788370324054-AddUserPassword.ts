import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPassword1788370324054 implements MigrationInterface {
  name = 'AddUserPassword1788370324054';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "password" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
  }
}

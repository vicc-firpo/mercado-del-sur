import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderPaymentFields1788572000000 implements MigrationInterface {
  name = 'AddOrderPaymentFields1788572000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "is_paid" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "stripe_checkout_session_id" character varying`,
    );
    await queryRunner.query(`UPDATE "orders" SET "is_paid" = true`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_orders_stripe_checkout_session_id" ON "orders" ("stripe_checkout_session_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_orders_user_id_is_paid" ON "orders" ("user_id", "is_paid")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_orders_user_id_is_paid"`);
    await queryRunner.query(
      `DROP INDEX "UQ_orders_stripe_checkout_session_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "stripe_checkout_session_id"`,
    );
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "is_paid"`);
  }
}

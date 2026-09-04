import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReplaceUserRolesWithRoleColumn1788550200000 implements MigrationInterface {
  name = 'ReplaceUserRolesWithRoleColumn1788550200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."role_enum" AS ENUM('admin', 'customer')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "role" "public"."role_enum" NOT NULL DEFAULT 'customer'`,
    );
    await queryRunner.query(`
      UPDATE "users" u
      SET "role" = 'admin'
      WHERE EXISTS (
        SELECT 1 FROM "user_roles" ur
        JOIN "roles" r ON r."id" = ur."role_id"
        WHERE ur."user_id" = u."id" AND r."name" = 'admin'
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_87b8888186ca9769c960e926870"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b23c65e50a758245a33ee35fda"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_87b8888186ca9769c960e92687"`,
    );
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(`DROP TABLE "roles"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_roles" ("user_id" uuid NOT NULL, "role_id" uuid NOT NULL, CONSTRAINT "PK_23ed6f04fe43066df08379fd034" PRIMARY KEY ("user_id", "role_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_87b8888186ca9769c960e92687" ON "user_roles" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b23c65e50a758245a33ee35fda" ON "user_roles" ("role_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `INSERT INTO "roles" ("name") VALUES ('admin'), ('customer')`,
    );
    await queryRunner.query(`
      INSERT INTO "user_roles" ("user_id", "role_id")
      SELECT u."id", r."id"
      FROM "users" u
      JOIN "roles" r ON r."name" = u."role"::text
    `);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
    await queryRunner.query(`DROP TYPE "public"."role_enum"`);
  }
}

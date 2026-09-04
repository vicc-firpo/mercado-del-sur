import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateImages1788538890100 implements MigrationInterface {
  name = 'CreateImages1788538890100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."image_extension_enum" AS ENUM('jpg', 'png', 'webp')`,
    );
    await queryRunner.query(
      `CREATE TABLE "images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "extension" "public"."image_extension_enum" NOT NULL, "product_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1fe148074c6a1a91b63cb9ee3c9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "images" ADD CONSTRAINT "FK_96fabbb1202770b8e6a58bf6f1d" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "images" DROP CONSTRAINT "FK_96fabbb1202770b8e6a58bf6f1d"`,
    );
    await queryRunner.query(`DROP TABLE "images"`);
    await queryRunner.query(`DROP TYPE "public"."image_extension_enum"`);
  }
}

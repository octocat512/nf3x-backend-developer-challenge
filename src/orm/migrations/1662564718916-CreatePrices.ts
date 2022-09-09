import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePrice1662564718916 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "prices" ("id" SERIAL NOT NULL, "price" character varying(40), "token_name" character varying(40), "time" character varying(40), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), PRIMARY KEY ("id"))`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "prices"`, undefined);
  }
}

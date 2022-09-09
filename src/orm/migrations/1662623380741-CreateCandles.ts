import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCandles1662623380741 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "candles" ("id" SERIAL NOT NULL, "time" character varying(20), "token_name" character varying(40), "first_swap_time" character varying(20), "last_swap_time" character varying(20), "interval" character varying(40), "open" character varying(40), "close" character varying(40), "high" character varying(40), "low" character varying(40), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), PRIMARY KEY ("id"))`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "candles"`, undefined);
  }
}

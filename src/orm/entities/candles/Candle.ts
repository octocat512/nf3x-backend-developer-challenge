import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('candles')
export class Candle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  time: string;

  @Column()
  tokenName: string;

  @Column()
  firstSwapTime: string;

  @Column()
  lastSwapTime: string;

  @Column()
  interval: string;

  @Column()
  open: string;

  @Column()
  close: string;

  @Column()
  high: string;

  @Column()
  low: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}

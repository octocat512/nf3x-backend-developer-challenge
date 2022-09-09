import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('prices')
export class Price {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  price: string;

  @Column()
  tokenName: string;

  @Column()
  time: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}

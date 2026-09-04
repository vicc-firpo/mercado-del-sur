import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Currency } from '../enums/currency.enum';
import { Image } from './image.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: string;

  @Column({ type: 'enum', enum: Currency, enumName: 'currency_enum' })
  currency: Currency;

  @OneToMany(() => Image, (image) => image.product)
  images: Image[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

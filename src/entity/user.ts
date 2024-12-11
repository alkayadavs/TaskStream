// entity>User.ts
 
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
 
@Entity()
export class Task {
  static json(json: any, arg1: string, arg2: (err: any) => import("express").Response<any, Record<string, any>>) {
      throw new Error('Method not implemented.');
  }
  @PrimaryGeneratedColumn()
  id!: number;
 
  @Column()
  title!: string;
 
  @Column()
  description!: string;

  
  @Column({default : false})
  completed! : boolean 
}
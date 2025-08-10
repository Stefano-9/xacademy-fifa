import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from './player.entity';

@Entity()
export class PlayerVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Player, (p) => p.versions, { onDelete: 'CASCADE' })
  player: Player;

  @Column({ type: 'int' })
  year: number; 

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ type: 'int', nullable: true })
  rating: number;
}

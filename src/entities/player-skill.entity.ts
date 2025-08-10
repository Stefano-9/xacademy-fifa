import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Player } from './player.entity';
import { Skill } from './skill.entity';

@Entity()
@Unique(['player', 'skill', 'year']) 
export class PlayerSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Player, (p) => p.skills, { onDelete: 'CASCADE' })
  player: Player;

  @ManyToOne(() => Skill, (s) => s.players, { eager: true, onDelete: 'CASCADE' })
  skill: Skill;

  @Column({ type: 'int' })
  year: number; 

  @Column({ type: 'int' })
  value: number; 
}

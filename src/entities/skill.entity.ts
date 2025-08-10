import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { PlayerSkill } from './player-skill.entity';

@Entity()
@Unique(['code'])
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 60 })
  name: string;

  @Column({ length: 60 })
  code: string; 

  @OneToMany(() => PlayerSkill, (ps) => ps.skill)
  players: PlayerSkill[];
}

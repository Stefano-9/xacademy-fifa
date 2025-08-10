import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PlayerVersion } from './player-version.entity';
import { PlayerSkill } from './player-skill.entity';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 120, nullable: true })
  club: string;

  @Column({ length: 10, nullable: true })
  position: string;

  @Column({ type: 'int', default: 0 })
  rating: number;

  @Column({ length: 80, nullable: true })
  nationality: string;

  @OneToMany(() => PlayerVersion, (v) => v.player, { cascade: true })
  versions: PlayerVersion[];

  @OneToMany(() => PlayerSkill, (ps) => ps.player, { cascade: true })
  skills: PlayerSkill[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

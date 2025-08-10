import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { Player } from '../entities/player.entity';
import { Skill } from '../entities/skill.entity';
import { PlayerSkill } from '../entities/player-skill.entity';
import { PlayerVersion } from '../entities/player-version.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player, Skill, PlayerSkill, PlayerVersion]),
    
    MulterModule.register({}),
  ],
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}

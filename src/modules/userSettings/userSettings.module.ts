import { Module } from '@nestjs/common';

import { UserSettingsController } from './userSettings.controller';
import { UserSettingsService } from './userSettings.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserSettingsController],
  providers: [UserSettingsService]
})
export class UserSettingsModule {}

import { Module } from '@nestjs/common';

import { DirectMessageController } from './dm.controller';
import { DirectMessageService } from './dm.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DirectMessageController],
  providers: [DirectMessageService],
  exports: [DirectMessageService]
})
export class DirectMessageModule {}

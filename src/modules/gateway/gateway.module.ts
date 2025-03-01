import { Module } from '@nestjs/common';

import { ChatGateway } from './chatGateway';
import { AuthModule } from '../auth/auth.module';
import { DirectMessageModule } from '../dm/dm.module';

@Module({
  imports: [AuthModule, DirectMessageModule],
  providers: [ChatGateway]
})
export class GatewayModule {}

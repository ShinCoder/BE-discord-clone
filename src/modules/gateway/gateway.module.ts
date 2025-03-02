import { Module } from '@nestjs/common';

import { ChatGateway } from './chatGateway';
import { AuthModule } from '../auth/auth.module';
import { DirectMessageModule } from '../dm/dm.module';
import { UserSettingsModule } from '../userSettings/userSettings.module';

@Module({
  imports: [AuthModule, DirectMessageModule, UserSettingsModule],
  providers: [ChatGateway]
})
export class GatewayModule {}

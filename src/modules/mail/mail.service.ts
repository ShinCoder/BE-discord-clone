import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import { ISendVerificationEmailData } from 'src/types/mail.types';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(data: ISendVerificationEmailData) {
    await this.mailerService.sendMail({
      to: data.to,
      subject: 'Verify Email Address NOT for Discord',
      template: 'verify',
      context: data.context
    });
  }
}

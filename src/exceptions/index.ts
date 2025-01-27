import { HttpException } from '@nestjs/common';

export class CustomException extends HttpException {
  private customCode: number;

  constructor(message: string, status: number, customCode: number) {
    super(message, status);
    this.customCode = customCode;
  }

  getCustomCode() {
    return this.customCode;
  }
}

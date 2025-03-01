import { EMessageType, IDirectMessageDto } from '../api';

export type IJoinDirectMessageRoomData = {
  targetId: string;
};

export type ILeaveDirectMessageRoomData = {
  targetId: string;
};

export type ISendDirectMessageData = {
  targetId: string;
  content: string;
  type: EMessageType;
};

export type IReceiveDirectMessageDto = {
  message: IDirectMessageDto;
};

export type IFailedDirectMessageDto = {
  senderId: string;
  targetId: string;
  content: string;
  type: EMessageType;
  createdAt: string;
};

export type IReceiveFailedDirectMessageDto = {
  message: IFailedDirectMessageDto;
};

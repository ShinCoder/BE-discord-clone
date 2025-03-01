export enum EMessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE'
}

export type ICreateDirectMessageData = {
  senderId: string;
  targetId: string;
  content: string;
  type: EMessageType;
};

export type IDirectMessageDto = {
  id: string;
  senderId: string;
  targetId: string;
  content: string;
  type: EMessageType;
  createdAt: string;
  updatedAt: string;
};

export type ICreateDirectMessageResult = IDirectMessageDto;

export type IGetDirectMessagesQuery = {
  senderId: string;
  targetId: string;
  take?: number;
  page?: number;
  skip?: number;
};

export enum EMessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE'
}

export type IDirectMessageDto = {
  id: string;
  senderId: string;
  targetId: string;
  content: string;
  type: EMessageType;
  createdAt: string;
  updatedAt: string;
};

export type IGetDirectMessagesResult = {
  messages: Array<IDirectMessageDto>;
};

import {
  IUserDto,
  WithConnectionStatus,
  WithRelationship
} from './user-api.types';

export type IPinDirectMessageData = {
  targetId: string;
};

export type IPinDirectMessageResult = {
  newPin: IUserDto & WithRelationship & WithConnectionStatus;
};

import { IUserDto, WithConnectionStatus, WithRelationship } from '../api';

export type IReceiveDmPinData = {
  newPin: IUserDto & WithRelationship & WithConnectionStatus;
};

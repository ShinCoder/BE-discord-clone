export type IUserDto = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  dateOfBirth: string;
  phoneNumber?: string;
  avatar?: string;
  pronouns?: string;
  bannerColor: string;
  about?: string;
  createdAt: string;
  updatedAt: string;
};

export enum EConnectionStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE'
}

export enum ERelationshipStatus {
  PENDING = 'PENDING',
  REQUESTING = 'REQUESTING',
  FRIEND = 'FRIEND',
  BLOCKED = 'BLOCKED'
}

export type IRelationshipDto = {
  userId: string;
  targetId: string;
  status: ERelationshipStatus;
  updatedAt: string;
};

export type WithRelationship = {
  inRelationshipWith?: IRelationshipDto;
};

export type WithConnectionStatus = {
  connectionStatus: EConnectionStatus;
};

export type IUserSettingsDto = {
  dmSettings: {
    pinnedDms: Array<IUserDto & WithRelationship & WithConnectionStatus>;
  };
};

export type IUserWithSettingsDto = IUserDto & {
  settings: IUserSettingsDto;
};

export type IGetMeResult = IUserWithSettingsDto;

export type IGetFriendsResult = {
  friends: Array<IUserDto & WithRelationship & WithConnectionStatus>;
};

export type ISendFriendRequestData = {
  targetId?: string;
  targetUsername?: string;
};

export type IGetFriendRequestsResult = {
  incomingRequests: Array<IUserDto & WithRelationship>;
  outgoingRequests: Array<IUserDto & WithRelationship>;
};

export type IAcceptFriendRequestData = {
  targetId: string;
};

export type IIgnoreFriendRequestData = {
  targetId: string;
};

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

export type IUserWithRelationshipDto = IUserDto & {
  inRelationshipWith?: IRelationshipDto;
};

export type IUserSettingsDto = {
  dmSettings: {
    pinnedDms: Array<
      IUserWithRelationshipDto & { connectionStatus: EConnectionStatus }
    >;
  };
};

export type IUserWithSettingsDto = IUserDto & {
  settings: IUserSettingsDto;
};

export type IGetMeResult = IUserWithSettingsDto;

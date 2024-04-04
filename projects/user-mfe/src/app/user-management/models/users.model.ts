import { CookieConsent, LoginUserMetadata, UserTag } from '@app-core/models/core.model';

export enum UserStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING',
}

export interface UserFleetInfo {
  fleetId: string;
  role: {
    level: number;
    roleId: number;
    roleName: string;
  };
  userTags?: UserTag[];
}

export interface User {
  email: string;
  name: string;
  fleets: UserFleetInfo[];
  status: string;
  userId: string;
  metadata: any;
  portalId: number;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface Metadata {
  userMetadata?: LoginUserMetadata;
}

export interface CreatedUser {
  id: number;
  name: string;
  email: string;
  roleId: string;
  status: string;
  userId: string;
  fleetId: string;
  metadata: Metadata;
  portalId: number;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

// Request body classes
export class ListUsersParams {
  public limit?: number;
  public offset?: number;
  public status?: string;
  public search?: string;

  constructor(params: { limit?: number; offset?: number; status?: UserStatus; search?: string }) {
    if (params.status) {
      this.status = params.status;
    } else {
      delete this.status;
    }

    if (params.limit) {
      this.limit = params.limit;
    } else {
      delete this.limit;
    }

    if (params.offset !== undefined && params.offset !== null) {
      this.offset = params.offset;
    } else {
      delete this.offset;
    }

    if (params.search) {
      this.search = params.search;
    } else {
      delete this.search;
    }
  }
}

export class CreateUserReqBody {
  public email: string;
  public name: string;
  public status?: UserStatus;
  public roleId: number;
  public tagIds: number[];

  constructor(formData: any, tagIds) {
    this.email = formData.email;
    this.name = formData.name;
    this.roleId = formData.roleId;
    this.status = formData.status;
    this.tagIds = tagIds;
    if (!this.status) {
      delete this.status;
    }
    // if (!(this.tagIds && this.tagIds.length)) {
    //   delete this.tagIds;
    // }
  }
}

export class EditUserReqBody extends CreateUserReqBody {
  constructor(formData: any, tagIds: number[]) {
    super(formData, tagIds);
    delete this.email;
  }
}

export class UpdateUserStatusReqBody {
  public status: UserStatus;

  constructor(status: UserStatus) {
    this.status = status;
  }
}

export interface UpdateUserMetadataPayload {
  dateFormat?: string;
  metricUnit?: string;
  timezone?: string;
  language?: string;
  theme?: string;
  preferredFleet?: string;
  tablePageSize?: string;
  mfaEnabled?: boolean;
  cookieConsent?: CookieConsent;
}

export class UpdateUserMetadataReqBody {
  userMetadata: UpdateUserMetadataPayload;

  constructor(data: UpdateUserMetadataPayload) {
    this.userMetadata = {
      dateFormat: data.dateFormat,
      metricUnit: data.metricUnit,
      timezone: data.timezone,
      language: data.language,
      theme: data.theme,
      preferredFleet: data.preferredFleet,
      tablePageSize: data.tablePageSize,
      mfaEnabled: data.mfaEnabled,
      cookieConsent: data.cookieConsent,
    };
  }
}

// Responses
export interface ListUsersResp {
  code: number;
  rows: User[];
  skip: number;
  limit: number;
  totalRows: number;
}

export interface UserDetailsResp {
  // code: number;
  data: User;
}

export interface CreateUserResp {
  code: number;
  user: CreatedUser;
  message: string;
}

export interface UpdateUserResp extends CreateUserResp {}

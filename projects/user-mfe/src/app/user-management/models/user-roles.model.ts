export enum UserRoleStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

export interface UserRole {
  roleId: string;
  roleName: string;
  level: number;
  isAdmin: boolean;
  status: UserRoleStatus;
  createdAt: string;
  createdBy: string;
  permissions: string[];
  uiPermissions: string[];
  description: string;
  portalId: number;
  userCount: number;

  updatedAt?: string;
  updatedBy?: string;
  templateUsed?: string;
  attributeIds: string[];
}

export interface UserRoleTemplate {
  description: string;
  id: number;
  level: null;
  name: string;
  permissions: string[];
  uiPermissions: string[];
  portalId: number;

  createdBy?: string;
}

export interface UserRoleHierarchy {
  level: number;
  roles: string[];
}

// Request body classes
export class ListUserRolesParams {
  public limit?: number;
  public offset?: number;
  public status?: string;
  public search?: string;
  public attributeIds?: number[];

  constructor(params: { limit?: number; offset?: number; status?: UserRoleStatus; search?: string; attributeIds?: number[] }) {
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

    if (params.attributeIds && params.attributeIds?.length) {
      this.attributeIds = params.attributeIds;
    } else {
      delete this.attributeIds;
    }
  }
}

export class CreateRoleReqBody {
  public roleName: string;
  public description?: string;
  public level: number;
  public status: UserRoleStatus;
  public isAdmin: boolean;
  public permissions: string[];
  public uiPermissions: string[];
  public attributeIds?: number[];

  constructor(formData: any, attributeIds?: number[]) {
    const { permissions, uiConfig } = formData;

    const selectedPermissions: string[] = [];
    const selectedUiConfigs: string[] = [];

    permissions.forEach((per) => {
      const mainPerName = Object.keys(per)[0];
      if (per[mainPerName]) {
        selectedPermissions.push(mainPerName);
      }

      per.subPermissions.map((subPer) => {
        const subPerName = Object.keys(subPer)[0];
        if (subPer[subPerName]) {
          selectedPermissions.push(subPerName);
        }
      });
    });

    uiConfig.forEach((per) => {
      const mainPerName = Object.keys(per)[0];
      if (per[mainPerName]) {
        selectedUiConfigs.push(mainPerName);
      }

      per.subUiConfigs.map((subPer) => {
        const subPerName = Object.keys(subPer)[0];
        if (subPer[subPerName]) {
          selectedUiConfigs.push(subPerName);
        }
      });
    });

    this.roleName = formData.roleName;
    this.description = formData.description;
    this.level = formData.level;
    this.status = formData.status;
    this.isAdmin = formData.level === 1;
    this.permissions = selectedPermissions;
    this.uiPermissions = selectedUiConfigs;
    this.attributeIds = attributeIds;
    if (!this.description) {
      delete this.description;
    }
  }
}

export class UpdateUserRoleStatusReqBody {
  public status: UserRoleStatus;

  constructor(status: UserRoleStatus) {
    this.status = status;
  }
}

export class EditUserRoleDetailsReqBody extends CreateRoleReqBody {
  constructor(formData, attributeIds) {
    super(formData, attributeIds);
  }
}

// Response interfaces
export interface ListUserRolesResp {
  code: number;
  data: UserRole[];
  skip: number;
  limit: number;
  totalRoles: number;
}

export interface UserRoleDetailsResp {
  code: number;
  role: UserRole;
}

export interface UserRolesHierarchyResp {
  code: number;
  data: UserRoleHierarchy[];
}

export interface ListUserRoleTemplatesResp {
  code: number;
  rows: UserRoleTemplate[];
}

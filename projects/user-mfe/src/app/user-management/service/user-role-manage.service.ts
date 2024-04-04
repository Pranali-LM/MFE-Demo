import { Injectable } from '@angular/core';
import { setParams } from '@app-core/models/core.model';
import { API } from '@app-core/constants/api.constants';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateRoleReqBody,
  EditUserRoleDetailsReqBody,
  ListUserRoleTemplatesResp,
  ListUserRolesResp,
  UpdateUserRoleStatusReqBody,
  UserRole,
  UserRoleDetailsResp,
  UserRolesHierarchyResp,
  ListUserRolesParams,
} from '@app-user-management/models/user-roles.model';

@Injectable({
  providedIn: 'root',
})
export class UserRoleManageService {
  private portalIdHttpOptions = {
    params: setParams({ userType: 'fleetmanager' }),
  };

  constructor(private http: HttpClient) {}

  public roleDeatils: UserRole;
  public isRefresh: boolean;

  public getUserAttributes(attributes: any) {
    const result = attributes.map((x: any) => {
      if (x.Name === 'custom:user_permissions') {
        return {
          permissions: JSON.parse(x.Value),
        };
      }
      if (x.Name === 'custom:app_metadata') {
        const { fleets = [] } = JSON.parse(x.Value);
        return {
          fleets,
        };
      }
      if (x.Name === 'custom:user_metadata') {
        const { mfaEnabled } = JSON.parse(x.Value);
        return {
          mfaEnabled,
        };
      }
      return { [x.Name]: x.Value };
    });
    const flattenObject = Object.assign({}, ...result);
    return flattenObject;
  }

  public modifyUsersResponse(users: any, currentFleetId: string) {
    const result = users.map((user: any) => {
      const { Attributes = [], UserStatus: accountStatus = '', UserCreateDate: creationDate = '' } = user;
      const { email, name, permissions, fleets, mfaEnabled } = this.getUserAttributes(Attributes);
      return {
        email,
        name,
        fleets,
        creationDate,
        accountStatus,
        deleteUserLoader: false,
        resendEmailLoader: false,
        permissions,
        mfaEnabled,
        currentFleet: fleets.find((f) => f.fleetId === currentFleetId),
      };
    });
    return result || [];
  }

  public getRolesList(params: ListUserRolesParams): Observable<ListUserRolesResp> {
    const httpOptions = {
      params: setParams({ ...params, userType: 'fleetmanager' }),
    };
    return this.http.get<ListUserRolesResp>(API.rolesList, httpOptions);
  }

  public getRoleHierarchy(): Observable<UserRolesHierarchyResp> {
    const httpOptions = {
      params: setParams({ userType: 'fleetmanager' }),
    };
    return this.http.get<UserRolesHierarchyResp>(API.roleHierarchy, httpOptions);
  }

  public getRoleDetails(roleId: string): Observable<UserRoleDetailsResp> {
    return this.http.get<UserRoleDetailsResp>(API.getRoleDetails(roleId), this.portalIdHttpOptions);
  }

  public getRoleTemplates(): Observable<ListUserRoleTemplatesResp> {
    return this.http.get<ListUserRoleTemplatesResp>(API.roleTemplate, this.portalIdHttpOptions);
  }

  public addRole(body: CreateRoleReqBody): Observable<any> {
    return this.http.post(API.addRole, body, this.portalIdHttpOptions);
  }

  public updateRole(roleId: string, body: UpdateUserRoleStatusReqBody | EditUserRoleDetailsReqBody): Observable<any> {
    const url = API.updateRole(roleId);
    return this.http.patch(url, body, this.portalIdHttpOptions);
  }

  public deleteRole(roleId: string): Observable<any> {
    const url = API.deleteRole(roleId);
    return this.http.delete(url, this.portalIdHttpOptions);
  }
}

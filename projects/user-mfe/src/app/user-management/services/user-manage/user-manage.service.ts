import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API } from '@app-core/constants/api.constants';
import { setParams } from '@app-core/models/core.model';
import { HttpCacheService } from '@app-core/services/cache/cache.service';
import {
  CreateUserReqBody,
  CreateUserResp,
  EditUserReqBody,
  ListUsersParams,
  ListUsersResp,
  UpdateUserMetadataReqBody,
  UpdateUserStatusReqBody,
  User,
  UserDetailsResp,
} from '@app-user-management/models/users.model';

@Injectable({
  providedIn: 'root',
})
export class UserManageService {
  public userDeatils: User;

  private portalIdHttpOptions = {
    params: setParams({ userType: 'fleetmanager' }),
  };

  constructor(private http: HttpClient, private cacheService: HttpCacheService) {}

  public getUserList(params: ListUsersParams, isRefresh?: boolean) {
    const httpOptions = {
      params: setParams({ ...params, userType: 'fleetmanager' }),
    };
    if (isRefresh) {
      this.cacheService.burstCache$.next(API.GET_USERS_V2);
    }
    return this.http.get<ListUsersResp>(API.GET_USERS_V2, httpOptions);
  }

  public getUserDetails(userId: string) {
    return this.http.get<UserDetailsResp>(API.GET_SPECIFIC_USER_V2(userId), this.portalIdHttpOptions);
  }

  public addUser(body: CreateUserReqBody) {
    return this.http.post<CreateUserResp>(API.CREATE_USER_V2, body, this.portalIdHttpOptions);
  }

  public updateUser(userId: string, body: UpdateUserStatusReqBody | EditUserReqBody | UpdateUserMetadataReqBody, userTypeParam) {
    // we have added userType as loginType because in redirection cases the userPrefrence update is getting 500 error.
    const httpOptions = {
      params: setParams({ userType: userTypeParam }),
    };
    return this.http.patch<UserDetailsResp>(API.UPDATE_USER_V2(userId), body, httpOptions);
  }

  public deleteUser(userId: string) {
    return this.http.delete(API.DELETE_USER_V2(userId), this.portalIdHttpOptions);
  }

  public exportUsers(params: any) {
    const httpOptions = {
      params: setParams(params),
    };
    return this.http.get<any>(API.exportUsers, {
      ...httpOptions,
      observe: 'response',
      responseType: 'blob' as 'json',
    });
  }
}

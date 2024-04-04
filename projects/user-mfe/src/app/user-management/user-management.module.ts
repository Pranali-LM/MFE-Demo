import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementRoutingModule } from './user-management-routing.module';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { SharedModule } from '@app-shared/shared.module';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { EditRoleComponent } from './components/edit-role/edit-role.component';
import { RoleHierarchyComponent } from './components/role-hierarchy/role-hierarchy.component';
import { RoleTemplateComponent } from './components/role-template/role-template.component';
import { ManageRolesComponent } from './components/manage-roles/manage-roles.component';
import { EditUserV2Component } from './components/edit-user-v2/edit-user-v2.component';
import { UserListV2Component } from './components/user-list-v2/user-list-v2.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    UserManagementComponent,
    EditRoleComponent,
    RoleHierarchyComponent,
    RoleTemplateComponent,
    ManageRolesComponent,
    EditUserV2Component,
    UserListV2Component,
    ConfirmationModalComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    UserManagementRoutingModule,
    // MatProgressSpinnerModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  entryComponents: [RoleTemplateComponent, RoleHierarchyComponent],
})
export class UserManagementModule {}

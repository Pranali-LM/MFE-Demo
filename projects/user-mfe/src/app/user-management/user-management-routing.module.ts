import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { EditRoleComponent } from './components/edit-role/edit-role.component';
import { EditUserV2Component } from './components/edit-user-v2/edit-user-v2.component';

const routes: Routes = [
  {
    path: '',
    component: UserManagementComponent,
  },
  {
    path: 'edit-role',
    component: EditRoleComponent,
  },
  {
    path: 'edit-user',
    component: EditUserV2Component,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserManagementRoutingModule {}

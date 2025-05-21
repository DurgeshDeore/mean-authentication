import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from '../pages/register/register.component'; 
import { LoginComponent } from '../pages/login/login.component'; 
import { OtpVerifyComponent } from '../pages/otp-verify/otp-verify.component'; 
import { DashboardComponent } from '../pages/dashboard/dashboard.component'; 
import { AuthGuard } from '../auth.guard'; 
import { UnAuthGuard } from '../unauth.guard'; 

const routes: Routes = [
  { path: 'register', component: RegisterComponent, canActivate: [UnAuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [UnAuthGuard] },
  { path: 'verify-otp', component: OtpVerifyComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
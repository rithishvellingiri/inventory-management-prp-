import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { ProductsListComponent } from './components/products/products-list.component';
import { CartComponent } from './components/cart/cart.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard.component';
import { UserDashboardComponent } from './components/user/user-dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'products', component: ProductsListComponent },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'user-dashboard', component: UserDashboardComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];

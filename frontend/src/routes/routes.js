// Routes configuration
import Login from '../pages/Login';
import AuthCallback from '../pages/AuthCallback';
import CompleteProfile from '../pages/CompleteProfile';
import Dashboard from '../pages/Dashboard';
import Reports from '../pages/Reports';
import CreateReport from '../pages/CreateReport';
import UserManagement from '../pages/UserManagement';
import UserProfile from '../pages/UserProfile';

export const routes = [
  {
    path: '/login',
    component: Login,
    isPublic: true
  },
  {
    path: '/auth/callback',
    component: AuthCallback,
    isPublic: true
  },
  {
    path: '/complete-profile',
    component: CompleteProfile,
    isProtected: true,
    allowFirstTime: true
  },
  {
    path: '/dashboard',
    component: Dashboard,
    isProtected: true
  },
  {
    path: '/reports',
    component: Reports,
    isProtected: true
  },
  {
    path: '/reports/create',
    component: CreateReport,
    isProtected: true
  },
  {
    path: '/reports/:id/edit',
    component: CreateReport,
    isProtected: true
  },
  {
    path: '/users',
    component: UserManagement,
    isProtected: true,
    requiredRole: 'admin'
  },
  {
    path: '/profile',
    component: UserProfile,
    isProtected: true
  },
  {
    path: '/',
    component: Dashboard,
    isProtected: true
  }
];
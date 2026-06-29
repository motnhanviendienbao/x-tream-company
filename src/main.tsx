import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom'
import AppRoutes from './constants/AppRoutes'
import Login from './layout/pages/login/Login'
import Dashboard from './layout/pages/dashboard/Dashboard'
import Menu from './layout/pages/menu/Menu'
import Investors from './layout/pages/investors/Investors'
import NewInvestor from './layout/pages/investors/NewInvestor'
import WorkItems from './layout/pages/work-items/WorkItems'
import NewWorkItem from './layout/pages/work-items/NewWorkItem'
import AddWorkItem from './layout/pages/work-items/AddWorkItem'

const router = createHashRouter([
  {
    path: '/',
    element: <Navigate to={AppRoutes.LOGIN} replace />,
  },
  {
    path: AppRoutes.LOGIN,
    element: <Login />,
  },
  {
    path: AppRoutes.DASHBOARD,
    element: <Dashboard />,
  },
  {
    path: AppRoutes.MENU,
    element: <Menu />,
  },
  {
    path: AppRoutes.INVESTORS,
    element: <Investors />,
  },
  {
    path: AppRoutes.ADD_NEW_INVESTOR,
    element: <NewInvestor />,
  },
  {
    path: AppRoutes.WORK_ITEMS,
    element: <WorkItems />,
  },
  {
    path: AppRoutes.ADD_NEW_WORK_ITEM,
    element: <NewWorkItem />,
  },
  {
    path: AppRoutes.ADD_WORK_ITEM_DETAILS,
    element: <AddWorkItem />,
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const DashboardController = () => import('#controllers/v1/dashboard_controller')

/**
 * Endpoints for admin
 */
export default function adminRoutes() {
  router
    .group(() => {
      router.get('/dashboard', [DashboardController, 'admin'])
    })
    .use([middleware.auth(), middleware.roles('admin')])
}

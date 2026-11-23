import { createRouter, createWebHistory } from 'vue-router'
import Template from '@/layouts/Template.vue'
import Dashboard from '@/views/Dashboard.vue'
import Category from '@/views/categories/Category.vue'
import Login from '@/views/auth/Login.vue'
import SatuanIndex from '@/views/satuan/SatuanIndex.vue'
import ProductIndex from '@/views/products/ProductIndex.vue'
import CreateProduct from '@/views/products/CreateProduct.vue'
import EditProduct from '@/views/products/EditProduct.vue'
import TransactionIndex from '@/views/transactions/TransactionIndex.vue'
import StockTransactionIndex from '@/views/StockTransactions/stockTransactionIndex.vue'
import CreateStockTransaction from '@/views/StockTransactions/CreateStockTransaction.vue'
import DetailStockTransaction from '@/views/StockTransactions/DetailStockTransaction.vue'
import RiwayatTransactionIndex from '@/views/riwayatTransaction/RiwayatTransactionIndex.vue'
import DetailRiwayatTransaction from '@/views/riwayatTransaction/DetailRiwayatTransaction.vue'
import LaporanTransactionIndex from '@/views/laporan/LaporanTransactionIndex.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        guest: true,
      },
    },
    {
      path: '',
      name: 'template',
      component: Template,
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: '/dashboard',
          name: 'dashboard',
          component: Dashboard,
          meta: {
            requiresAuth: true,
            roles: ['Super Admin', 'Admin'],
          },
        },
        {
          path: '/category',
          name: 'category',
          component: Category,
          meta: {
            requiresAuth: true,
            roles: ['Super Admin'],
          },
        },
        {
          path: '/satuan',
          name: 'satuan',
          component: SatuanIndex,
          meta: {
            requiresAuth: true,
            roles: ['Super Admin'],
          },
        },

        // Route product
        {
          path: '/product',
          name: 'product',
          component: ProductIndex,
          meta: {
            requiresAuth: true,
            roles: ['Super Admin'],
          },
        },
        {
          path: '/tambah-data',
          name: 'tambah-data',
          component: CreateProduct,
          meta: {
            requiresAuth: true,
            roles: ['Super Admin'],
          },
        },
        {
          path: '/edit-product/:id/edit',
          name: 'edit-product',
          component: EditProduct,
          meta: {
            requiresAuth: true,
            roles: ['Super Admin'],
          },
        },

        // Route Transaction / POS / kasir
        {
          path: '/transaction',
          name: 'transaction',
          component: TransactionIndex,
          meta: {
            requiresAuth: true,
            roles: ['Super Admin', 'Kasir'],
          },
        },

        // Route Inventory
        {
          path: '/stock-transaction',
          name: 'stock-transaction',
          component: StockTransactionIndex,
          meta: {
            requiresAuth: true,
            roles: ['Super Admin', 'Admin'],
          },
        },
        {
          path: '/add-stock-transaction',
          name: 'add-stock-transaction',
          component: CreateStockTransaction,
          meta: {
            requiresAuth: true,
            roles: ['Super Admin', 'Admin'],
          },
        },
        {
          path: '/detail-stock-transaction/:id',
          name: 'detail-stock-transaction',
          component: DetailStockTransaction,
          meta: {
            requiresAuth: true,
            roles: ['Super Admin', 'Admin'],
          },
        },
        {
          path: '/riwayat-transaction',
          name: 'riwayat-transaction',
          component: RiwayatTransactionIndex,
          meta: {
            requiresAuth: true,
            roles: ['Super Admin'],
          },
        },
        {
          path: '/detail-riwayat-transaction/:id',
          name: 'detail-riwayat-transaction',
          component: DetailRiwayatTransaction,
          meta: {
            requiresAuth: true,
            roles: ['Super Admin'],
          },
        },
        {
          path: '/laporan-transaction',
          name: 'laporan-transaction',
          component: LaporanTransactionIndex,
          meta: {
            requiresAuth: true,
            roles: ['Super Admin'],
          },
        },
      ],
    },
  ],
})

// function redirect dashboard berdasarkan role
const getDashboardByRole = (role) => {
  switch (role) {
    case 'Super Admin':
      return '/dashboard'

    case 'Admin':
      return '/dashboard'

    case 'Kasir':
      return '/transaction'
  }
}

// Router Guard
router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  const userData = localStorage.getItem('user')

  // belum login
  if (!token) {
    if (to.meta.requiresAuth) {
      return '/login'
    }

    return true
  }

  // jika sudah login, tidak boleh masuk ke halaman guest
  if (to.meta.guest) {
    if (!userData) {
      return true
    }

    const user = JSON.parse(userData)
    const role = user.role.name

    if (!role) {
      return true
    }

    const dashboard = getDashboardByRole(role)

    if (!dashboard || to.path === dashboard) {
      return true
    }

    return dashboard
  }

  // cek role halaman
  if (to.meta.roles) {
    if (!userData) {
      return '/login'
    }

    const user = JSON.parse(userData)
    const role = user.role.name

    if (!to.meta.roles.includes(role)) {
      return getDashboardByRole(role)
    }
  }

  return true
})

export default router

// frontend-admin/src/lib/api/admin.ts

import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '@/types/auth'

/**
 * Make sure .env.local contains:
 *
 *   NEXT_PUBLIC_API_URL=http://localhost:5000/api
 *
 * (No trailing slash after `/api`.)
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Create a single Axios instance for all requests
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true, // in case you switch to cookie-based auth
})

// Attach Bearer token (if present) to every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * The “raw” shape returned by GET /admin/stats/usage
 * on your backend. Adjust if your backend differs.
 */
interface RawAdminStats {
  overview: {
    totalUsers: number
    activeUsers: number
    pendingSubscriptions: number
    totalSubscriptions: number
    activeSubscriptions: number
    totalFiles: number
    totalCharacters: number
  }
  period: {
    name: string
    startDate: string
    filesGenerated: number
    charactersProcessed: number
  }
  planDistribution: Array<{
    _id: string
    count: number
  }>
}

/**
 * The final shape that our StatsPage expects.
 */
export interface AdminStats {
  users: {
    totalUsers: number
    activeUsers: number
    pendingVerification: number
  }
  subscriptions: {
    totalSubscriptions: number
    activeSubscriptions: number
    pendingApprovals: number
    revenue: number
  }
  system: {
    totalCharactersGenerated: number
    totalFilesGenerated: number
    totalStorageUsed: number
  }
}

/**
 * Single subscription entry returned by GET /admin/subscriptions
 * (Adjust field names if your backend is different.)
 */
interface Subscription {
  _id: string
  userId: string
  planId: string
  status: 'pending' | 'active' | 'cancelled' | 'expired'
  startDate: string
  endDate: string
  paymentProofUrl?: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  plan: {
    name: string
    price: number
  }
}

/**
 * Single audit-log entry returned by GET /admin/audit-logs
 */
interface AuditLog {
  _id: string
  userId: string
  action: string
  details: string
  createdAt: string
  user?: {
    firstName: string
    lastName: string
    email: string
  }
}

/**
 * AdminAPI wraps all /admin/… calls
 */
class AdminAPI {
  private static async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
      params?: Record<string, unknown>
      data?: any
    } = {}
  ): Promise<T> {
    try {
      const response = await apiClient.request<{ success: boolean; data: T }>({
        url: endpoint,
        method: options.method || 'GET',
        params: options.params,
        data: options.data,
      })

      // We expect { success: true, data: T }
      return response.data.data
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        err.response &&
        typeof err.response.data === 'object'
      ) {
        const payload = err.response.data as any
        if (payload.error || payload.message) {
          throw new Error(payload.error ?? payload.message)
        }
      }
      throw new Error(err instanceof Error ? err.message : 'Request failed')
    }
  }

  // ——————————————————————————————————————————————
  // Stats endpoint (Admin + Manager)
  // GET /admin/stats/usage
  // ——————————————————————————————————————————————
  static async getStats(): Promise<AdminStats> {
    const raw: RawAdminStats = await this.request<RawAdminStats>(
      '/admin/stats/usage'
    )

    // Remap RawAdminStats → AdminStats
    return {
      users: {
        totalUsers: raw.overview.totalUsers,
        activeUsers: raw.overview.activeUsers,
        pendingVerification: raw.overview.pendingSubscriptions,
      },
      subscriptions: {
        totalSubscriptions: raw.overview.totalSubscriptions,
        activeSubscriptions: raw.overview.activeSubscriptions,
        pendingApprovals: raw.overview.pendingSubscriptions,
        revenue: 0, // Not returned by backend—default to 0
      },
      system: {
        totalCharactersGenerated: raw.overview.totalCharacters,
        totalFilesGenerated: raw.overview.totalFiles,
        totalStorageUsed: 0, // Not returned by backend—default to 0
      },
    }
  }

  // ——————————————————————————————————————————————
  // User management (Admin + Super Admin)
  // GET /admin/users?page=…&limit=…
  // ——————————————————————————————————————————————
  static async getUsers(
    page = 1,
    limit = 10
  ): Promise<{ users: User[]; total: number }> {
    const payload = await this.request<{
      users: User[]
      pagination: { total: number }
    }>('/admin/users', {
      params: { page, limit },
    })

    return {
      users: payload.users,
      total: payload.pagination.total,
    }
  }

  static async updateUser(
    userId: string,
    data: Partial<User>
  ): Promise<User> {
    const updated = await this.request<User>(`/admin/users/${userId}`, {
      method: 'PUT',
      data,
    })
    return updated
  }

  static async deleteUser(userId: string): Promise<void> {
    await this.request<void>(`/admin/users/${userId}`, {
      method: 'DELETE',
    })
  }

  // ——————————————————————————————————————————————
  // Subscription management (Admin + Finance Admin)
  // GET /admin/subscriptions?page=…&limit=…&status=…
  // ——————————————————————————————————————————————
  static async getSubscriptions(
    page = 1,
    limit = 10,
    status?: string
  ): Promise<{ subscriptions: Subscription[]; total: number }> {
    const params: any = { page, limit }
    if (status) params.status = status

    const payload = await this.request<{
      subscriptions: Subscription[]
      pagination: { total: number }
    }>('/admin/subscriptions', { params })

    return {
      subscriptions: payload.subscriptions,
      total: payload.pagination.total,
    }
  }

  static async approveSubscription(
    subscriptionId: string
  ): Promise<Subscription> {
    // Backend expects { approved: true, notes: '' }
    const updated = await this.request<Subscription>(
      `/admin/subscriptions/${subscriptionId}/approve`,
      {
        method: 'PUT',
        data: { approved: true, notes: '' },
      }
    )
    return updated
  }

  static async rejectSubscription(
    subscriptionId: string,
    reason: string
  ): Promise<Subscription> {
    const updated = await this.request<Subscription>(
      `/admin/subscriptions/${subscriptionId}/approve`,
      {
        method: 'PUT',
        data: { approved: false, notes: reason },
      }
    )
    return updated
  }

  // ——————————————————————————————————————————————
  // Audit logs (Admin)
  // GET /admin/audit-logs?page=…&limit=…
  // ——————————————————————————————————————————————
  static async getAuditLogs(
    page = 1,
    limit = 10
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const payload = await this.request<{
      logs: AuditLog[]
      pagination: { total: number }
    }>('/admin/audit-logs', {
      params: { page, limit },
    })

    return {
      logs: payload.logs,
      total: payload.pagination.total,
    }
  }

  // ——————————————————————————————————————————————
  // System maintenance (Super Admin)
  // POST /admin/system/cleanup
  // ——————————————————————————————————————————————
  static async clearExpiredFiles(): Promise<{ deletedCount: number }> {
    const result = await this.request<{ deletedCount: number }>(
      '/admin/system/cleanup',
      { method: 'POST' }
    )
    return result
  }

  static async updateSystemSettings(settings: {
    maxFileAge?: number
    maxStoragePerUser?: number
  }): Promise<void> {
    await this.request<void>('/admin/system/settings', {
      method: 'PUT',
      data: settings,
    })
  }
}

export default AdminAPI

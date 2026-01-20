'use server'

import sql from '@/lib/db'

export interface DashboardStats {
    totalRevenue: number
    activeOrders: number
    completedOrders: number
    totalCustomers: number
}

export interface OrderData {
    id: string
    total_price: number
    status: string
    created_at: string
    email: string
}

export interface ChartData {
    date: string
    revenue: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        // Use "Order" or "order" depending on exact table name in DB. Defaulting to lowercase "order" but quoted.
        const revenueResult = await sql`SELECT SUM(total_price) as total FROM "order"`
        const totalRevenue = Number(revenueResult[0]?.total) || 0

        const activeResult = await sql`SELECT COUNT(*) as count FROM "order" WHERE status IN ('pending', 'processing', 'approved')`
        const activeOrders = Number(activeResult[0]?.count) || 0

        const completedResult = await sql`SELECT COUNT(*) as count FROM "order" WHERE status = 'completed'`
        const completedOrders = Number(completedResult[0]?.count) || 0

        const customersResult = await sql`SELECT COUNT(*) as count FROM profile WHERE role = 'customer'`
        const totalCustomers = Number(customersResult[0]?.count) || 0

        return {
            totalRevenue,
            activeOrders,
            completedOrders,
            totalCustomers
        }
    } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        return { totalRevenue: 0, activeOrders: 0, completedOrders: 0, totalCustomers: 0 }
    }
}

export async function getRecentOrders(): Promise<OrderData[]> {
    try {
        const result = await sql`
      SELECT o.id, o.total_price, o.status, o.created_at, p.email
      FROM "order" o
      LEFT JOIN profile p ON o.user_id = p.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `
        // Map result to simple objects to avoid Date object serialization issues in Client Components if passed directly
        return result.map((row: any) => ({
            id: row.id,
            total_price: Number(row.total_price),
            status: row.status,
            created_at: new Date(row.created_at).toISOString(),
            email: row.email
        }))
    } catch (error) {
        console.error("Error fetching recent orders:", error)
        return []
    }
}

export async function getRevenueChartData(): Promise<ChartData[]> {
    try {
        const result = await sql`
      SELECT date_trunc('day', created_at) as date, SUM(total_price) as revenue
      FROM "order"
      WHERE created_at > now() - interval '90 days'
      GROUP BY 1
      ORDER BY 1 ASC
    `
        return result.map((row: any) => ({
            date: new Date(row.date).toISOString().split('T')[0],
            revenue: Number(row.revenue)
        }))
    } catch (error) {
        console.error("Error fetching chart data:", error)
        return []
    }
}

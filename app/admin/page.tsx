import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { orders } from '@/lib/db/schema'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package, Clock, CheckCircle2, TrendingUp } from 'lucide-react'

async function getStats() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const ordersData = await db.select().from(orders)

    const pending = ordersData.filter((o) => o.status === 'pending').length
    const confirmed = ordersData.filter((o) => o.status === 'confirmed').length
    const completed = ordersData.filter((o) => o.status === 'delivered').length

    const totalRevenue = ordersData
      .filter((o) => o.status === 'delivered')
      .reduce((sum, order) => sum + parseFloat(order.total || '0'), 0)

    return {
      pending,
      confirmed,
      completed,
      totalRevenue,
      todayOrders: ordersData.length,
    }
  } catch (error) {
    console.error('[admin] Error fetching stats:', error)
    return {
      pending: 0,
      confirmed: 0,
      completed: 0,
      totalRevenue: 0,
      todayOrders: 0,
    }
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Bem-vindo ao painel de controle do FastFlow</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span>Pedidos Pendentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
            <p className="text-xs text-gray-500 mt-1">Aguardando confirmação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span>Pedidos Confirmados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.confirmed}</div>
            <p className="text-xs text-gray-500 mt-1">Em preparação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Pedidos Entregues</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
            <p className="text-xs text-gray-500 mt-1">Hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Receita</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('pt-MZ', {
                style: 'currency',
                currency: 'MZN',
              }).format(stats.totalRevenue)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Hoje</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesse as funcionalidades principais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/admin/orders">
              <Button variant="outline" className="w-full justify-start">
                <Package className="w-4 h-4 mr-2" />
                Gerenciar Pedidos
              </Button>
            </Link>
            <Link href="/admin/menu">
              <Button variant="outline" className="w-full justify-start">
                <span>🍱</span>
                <span className="ml-2">Editar Cardápio</span>
              </Button>
            </Link>
            <Link href="/admin/drivers">
              <Button variant="outline" className="w-full justify-start">
                <span>🚚</span>
                <span className="ml-2">Entregadores</span>
              </Button>
            </Link>
            <Link href="/admin/restaurant">
              <Button variant="outline" className="w-full justify-start">
                <span>🏪</span>
                <span className="ml-2">Informações</span>
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button variant="outline" className="w-full justify-start">
                <span>📊</span>
                <span className="ml-2">Relatórios</span>
              </Button>
            </Link>
            <Link href="/admin/coupons">
              <Button variant="outline" className="w-full justify-start">
                <span>🎟️</span>
                <span className="ml-2">Cupons</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

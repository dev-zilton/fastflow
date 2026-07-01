'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ReportsPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    deliveredToday: 0,
    cancelledOrders: 0,
    totalCustomers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('today')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/orders')
        if (response.ok) {
          const orders = await response.json()
          const delivered = orders.filter((o: any) => o.status === 'delivered')
          const totalRevenue = delivered.reduce((sum: number, o: any) => sum + parseFloat(o.total || '0'), 0)

          setStats({
            totalOrders: orders.length,
            totalRevenue,
            averageOrderValue: orders.length > 0 ? totalRevenue / delivered.length : 0,
            deliveredToday: delivered.length,
            cancelledOrders: orders.filter((o: any) => o.status === 'cancelled').length,
            totalCustomers: new Set(orders.map((o: any) => o.customer_phone)).size,
          })
        }
      } catch (error) {
        console.error('[Reports] Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [period])

  const downloadReport = () => {
    const report = `
RELATÓRIO DE VENDAS - FastFlow
Data: ${new Date().toLocaleDateString('pt-MZ')}

RESUMO
Total de Pedidos: ${stats.totalOrders}
Pedidos Entregues: ${stats.deliveredToday}
Pedidos Cancelados: ${stats.cancelledOrders}

RECEITA
Receita Total: MT ${stats.totalRevenue.toFixed(2)}
Ticket Médio: MT ${stats.averageOrderValue.toFixed(2)}

CLIENTES
Total de Clientes: ${stats.totalCustomers}
    `.trim()

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report))
    element.setAttribute('download', `report-${new Date().toISOString().split('T')[0]}.txt`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>Carregando relatórios...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-2">Análise de vendas e desempenho</p>
        </div>
        <Button onClick={downloadReport} className="bg-red-600 hover:bg-red-700">
          <Download className="w-4 h-4 mr-2" />
          Baixar Relatório
        </Button>
      </div>

      <div className="flex space-x-2">
        {['today', 'week', 'month'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === p
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {p === 'today' ? 'Hoje' : p === 'week' ? 'Esta Semana' : 'Este Mês'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pedidos Entregues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.deliveredToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cancelados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.cancelledOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">MT {stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">MT {stats.averageOrderValue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.totalCustomers}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
          <CardDescription>Análise do desempenho</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-gray-700">Taxa de Entrega</span>
            <Badge className="bg-blue-600">
              {stats.totalOrders > 0 ? ((stats.deliveredToday / stats.totalOrders) * 100).toFixed(1) : 0}%
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm text-gray-700">Clientes Únicos</span>
            <Badge className="bg-green-600">{stats.totalCustomers} clientes</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <span className="text-sm text-gray-700">Valor Total por Cliente</span>
            <Badge className="bg-purple-600">
              MT {stats.totalCustomers > 0 ? (stats.totalRevenue / stats.totalCustomers).toFixed(2) : 0}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

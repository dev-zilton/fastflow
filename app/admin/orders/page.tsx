'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Eye, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface OrderData {
  id: string
  restaurantId: string
  customer_name: string
  customer_phone: string
  status: string
  total: string
  payment_method: string
  createdAt: string
  delivery_address: string
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  on_the_way: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders')
        if (response.ok) {
          const data = await response.json()
          setOrders(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('[Orders] Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
    const interval = setInterval(fetchOrders, 15000)
    return () => clearInterval(interval)
  }, [])

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updated = await response.json()
        setOrders(orders.map((o) => (o.id === orderId ? updated : o)))
      }
    } catch (error) {
      console.error('[Orders] Update error:', error)
    } finally {
      setUpdating(null)
    }
  }

  const getNextStatus = (current: string) => {
    const workflow = ['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered']
    const next = workflow[workflow.indexOf(current) + 1]
    return next || null
  }

  const filteredOrders =
    selectedStatus === 'all' ? orders : orders.filter((o) => o.status === selectedStatus)

  const statusGroups = {
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    on_the_way: orders.filter((o) => o.status === 'on_the_way').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Pedidos</h1>
        <p className="text-gray-600 mt-2">Total de {orders.length} pedidos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setSelectedStatus}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">
                Todos ({orders.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pendentes ({statusGroups.pending})
              </TabsTrigger>
              <TabsTrigger value="confirmed">
                Confirmados ({statusGroups.confirmed})
              </TabsTrigger>
              <TabsTrigger value="preparing">
                Preparando ({statusGroups.preparing})
              </TabsTrigger>
              <TabsTrigger value="on_the_way">
                Em Entrega ({statusGroups.on_the_way})
              </TabsTrigger>
              <TabsTrigger value="delivered">
                Entregues ({statusGroups.delivered})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedStatus} className="mt-6">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Carregando pedidos...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Nenhum pedido neste status</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => {
                    const nextStatus = getNextStatus(order.status)
                    return (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <div>
                              <p className="font-medium text-gray-900">
                                #{order.id.slice(-8).toUpperCase()}
                              </p>
                              <p className="text-sm text-gray-600">{order.customer_name}</p>
                              <p className="text-xs text-gray-500 mt-1">{order.customer_phone}</p>
                            </div>
                            <Badge className={statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100'}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 ml-4">
                          <div className="text-right">
                            <p className="font-bold text-red-600">
                              MT{parseFloat(order.total).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">{order.payment_method}</p>
                          </div>

                          <div className="flex space-x-2">
                            <Link href={`/orders/${order.id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>

                            {nextStatus && (
                              <Button
                                size="sm"
                                onClick={() => updateStatus(order.id, nextStatus)}
                                disabled={updating === order.id}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {updating === order.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  'Próximo'
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

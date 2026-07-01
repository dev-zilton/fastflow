'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, CheckCircle2, Loader2 } from 'lucide-react'

interface Order {
  id: string
  restaurantId: string
  status: string
  subtotal: string
  delivery_fee: string
  total: string
  payment_method: string
  delivery_address: string
  estimated_delivery_time?: string
  createdAt: string
}

export default function OrderTrackingPage() {
  const params = useParams()
  const orderId = params.orderId as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        if (!response.ok) throw new Error('Order not found')
        const data = await response.json()
        setOrder(data)

        // Simulate status updates (mock)
        const statusUpdates = ['pending', 'confirmed', 'preparing', 'on-the-way', 'delivered']
        const currentStatusIndex = Math.floor(Math.random() * statusUpdates.length)

        // In a real app, this would use WebSockets or polling for real-time updates
        const interval = setInterval(() => {
          setOrder((prev) =>
            prev
              ? {
                  ...prev,
                  status:
                    statusUpdates[
                      (statusUpdates.indexOf(prev.status) + 1) % statusUpdates.length
                    ],
                }
              : null
          )
        }, 10000)

        return () => clearInterval(interval)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading order')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      pending: { label: 'Pendente', color: 'text-orange-600', icon: <Clock className="h-5 w-5" /> },
      confirmed: { label: 'Confirmado', color: 'text-blue-600', icon: <CheckCircle2 className="h-5 w-5" /> },
      preparing: { label: 'Preparando', color: 'text-blue-600', icon: <Loader2 className="h-5 w-5 animate-spin" /> },
      'on-the-way': { label: 'A Caminho', color: 'text-purple-600', icon: <MapPin className="h-5 w-5" /> },
      delivered: { label: 'Entregue', color: 'text-green-600', icon: <CheckCircle2 className="h-5 w-5" /> },
    }
    return statusMap[status] || statusMap.pending
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando pedido...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">🍜</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">FastFlow</h1>
            </Link>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-muted-foreground mb-4">{error || 'Pedido não encontrado'}</p>
          <Link href="/restaurants">
            <Button className="bg-red-600 hover:bg-red-700">
              Voltar aos Restaurantes
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusDisplay = getStatusDisplay(order.status)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">🍜</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">FastFlow</h1>
          </Link>
        </div>
      </header>

      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Order Header */}
          <div className="bg-white rounded-lg border border-border p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Pedido #{order.id}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className={`flex items-center gap-2 ${statusDisplay.color} font-semibold text-lg`}>
                {statusDisplay.icon}
                {statusDisplay.label}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tracking Timeline */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-border p-6 mb-8">
                <h3 className="text-lg font-bold text-foreground mb-6">
                  Status do Pedido
                </h3>

                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>

                  {[
                    { status: 'pending', label: 'Recebido', time: '00:00' },
                    { status: 'confirmed', label: 'Confirmado', time: '00:05' },
                    { status: 'preparing', label: 'Preparando', time: '00:15' },
                    { status: 'on-the-way', label: 'A Caminho', time: '00:30' },
                    { status: 'delivered', label: 'Entregue', time: '00:40' },
                  ].map((step, index) => {
                    const isCompleted = ['pending', 'confirmed', 'preparing', 'on-the-way'].indexOf(
                      step.status
                    ) <= ['pending', 'confirmed', 'preparing', 'on-the-way', 'delivered'].indexOf(order.status)
                    const isActive = step.status === order.status

                    return (
                      <div key={step.status} className="relative mb-8 pl-12">
                        <div
                          className={`absolute -left-5 w-9 h-9 rounded-full flex items-center justify-center ${
                            isCompleted || isActive
                              ? 'bg-red-600'
                              : 'bg-gray-300'
                          }`}
                        >
                          {isCompleted && !isActive ? (
                            <CheckCircle2 className="h-5 w-5 text-white" />
                          ) : isActive ? (
                            <Loader2 className="h-5 w-5 text-white animate-spin" />
                          ) : (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <h4 className={`font-semibold text-sm mb-1 ${
                          isCompleted || isActive
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }`}>
                          {step.label}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          ~{step.time}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-white rounded-lg border border-border p-6 mb-8">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Localização da Entrega
                </h3>
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-muted-foreground">Mapa será exibido aqui</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-border p-6 sticky top-20">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Resumo
                </h3>

                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">
                      MT{parseFloat(order.subtotal).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Entrega</span>
                    <span className="font-semibold text-foreground">
                      MT{parseFloat(order.delivery_fee).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between mb-6">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-red-600">
                    MT{parseFloat(order.total).toFixed(2)}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-foreground text-sm mb-2">
                    Endereço de Entrega
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {order.delivery_address}
                  </p>
                </div>

                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Contatar Entregador
                  </Button>
                  <Link href="/restaurants">
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      Fazer Novo Pedido
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

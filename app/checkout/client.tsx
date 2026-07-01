'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Check } from 'lucide-react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  restaurantId: string
}

export default function CheckoutPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const restaurantId = searchParams.get('restaurantId')

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [restaurant, setRestaurant] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [loading, setLoading] = useState(true)

  // Delivery Address
  const [address, setAddress] = useState({
    street: '',
    number: '',
    neighborhood: '',
    city: 'Maputo',
    phone: '',
    name: '',
    email: '',
  })

  const [addressError, setAddressError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderConfirmation, setOrderConfirmation] = useState<any>(null)

  useEffect(() => {
    if (!restaurantId) return

    const loadCheckoutData = async () => {
      try {
        const savedCart = localStorage.getItem(`cart_${restaurantId}`) || '[]'
        const items = JSON.parse(savedCart)
        setCartItems(items)

        const response = await fetch(`/api/restaurants/${restaurantId}`)
        if (response.ok) {
          const data = await response.json()
          setRestaurant(data.restaurant)
        }

        // Try to load saved address
        const savedAddress = localStorage.getItem('delivery_address')
        if (savedAddress) {
          setAddress(JSON.parse(savedAddress))
        }
      } catch (error) {
        console.error('[Checkout] Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCheckoutData()
  }, [restaurantId])

  const validateAddress = () => {
    if (!address.street || !address.number || !address.neighborhood) {
      setAddressError('Preencha todos os campos de endereço')
      return false
    }
    if (!address.phone) {
      setAddressError('Telefone é obrigatório')
      return false
    }
    if (!address.name) {
      setAddressError('Nome é obrigatório')
      return false
    }
    setAddressError('')
    return true
  }

  const createOrder = async () => {
    if (!validateAddress()) return

    setIsProcessing(true)

    try {
      // Get coordinates (mock for now)
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          items: cartItems,
          address,
          paymentMethod,
          subtotal: subtotal,
          deliveryFee: restaurant?.delivery_fee || 0,
        }),
      })

      if (!response.ok) throw new Error('Failed to create order')

      const order = await response.json()
      setOrderConfirmation(order)

      // Save address for future orders
      localStorage.setItem('delivery_address', JSON.stringify(address))

      // Clear cart
      localStorage.removeItem(`cart_${restaurantId}`)
    } catch (error) {
      console.error('[Checkout] Error creating order:', error)
      setAddressError('Erro ao criar pedido. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (!restaurantId || cartItems.length === 0) {
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
          <p className="text-muted-foreground mb-4">Carrinho vazio</p>
          <Link href="/restaurants">
            <Button className="bg-red-600 hover:bg-red-700">
              Voltar aos Restaurantes
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Order Confirmation Screen
  if (orderConfirmation) {
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

        <section className="py-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg border border-border p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Pedido Confirmado!
              </h2>
              <p className="text-muted-foreground mb-6">
                Seu pedido #{orderConfirmation.id} foi recebido com sucesso.
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-foreground mb-4">Detalhes do Pedido</h3>
                <div className="space-y-2 mb-4">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Restaurante:</span>{' '}
                    <span className="font-semibold text-foreground">{restaurant?.name}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Status:</span>{' '}
                    <span className="font-semibold text-orange-600">Processando</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Entrega em:</span>{' '}
                    <span className="font-semibold text-foreground">
                      {restaurant?.estimated_delivery_minutes} minutos
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Link href={`/orders/${orderConfirmation.id}`}>
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Rastrear Pedido
                  </Button>
                </Link>
                <Link href="/restaurants">
                  <Button variant="outline" className="w-full">
                    Fazer Novo Pedido
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = restaurant?.delivery_fee || 0
  const total = subtotal + deliveryFee

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">🍜</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">FastFlow</h1>
          </Link>
          <h2 className="text-lg font-semibold text-foreground">
            Checkout
          </h2>
        </div>
      </header>

      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Delivery Address */}
              <div className="bg-white p-6 rounded-lg border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Endereço de Entrega
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">
                      Nome
                    </label>
                    <Input
                      type="text"
                      value={address.name}
                      onChange={(e) =>
                        setAddress({ ...address, name: e.target.value })
                      }
                      placeholder="Seu nome"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">
                      Telefone
                    </label>
                    <Input
                      type="tel"
                      value={address.phone}
                      onChange={(e) =>
                        setAddress({ ...address, phone: e.target.value })
                      }
                      placeholder="+258 8X XXX XXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">
                      Email (opcional)
                    </label>
                    <Input
                      type="email"
                      value={address.email}
                      onChange={(e) =>
                        setAddress({ ...address, email: e.target.value })
                      }
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1">
                        Rua
                      </label>
                      <Input
                        type="text"
                        value={address.street}
                        onChange={(e) =>
                          setAddress({ ...address, street: e.target.value })
                        }
                        placeholder="Av. Samora Machel"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1">
                        Número
                      </label>
                      <Input
                        type="text"
                        value={address.number}
                        onChange={(e) =>
                          setAddress({ ...address, number: e.target.value })
                        }
                        placeholder="123"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1">
                        Bairro
                      </label>
                      <Input
                        type="text"
                        value={address.neighborhood}
                        onChange={(e) =>
                          setAddress({ ...address, neighborhood: e.target.value })
                        }
                        placeholder="Polana"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1">
                        Cidade
                      </label>
                      <Input
                        type="text"
                        value={address.city}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 rounded-lg border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Forma de Pagamento
                </h3>

                <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pix">PIX</TabsTrigger>
                    <TabsTrigger value="card">Cartão</TabsTrigger>
                    <TabsTrigger value="cash">Dinheiro</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pix" className="mt-4">
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4">
                        Você receberá um QR Code para pagar após confirmar o pedido
                      </p>
                      <div className="bg-gray-100 w-32 h-32 rounded-lg mx-auto flex items-center justify-center">
                        <span className="text-4xl">📱</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="card" className="mt-4">
                    <div className="space-y-4">
                      <Input
                        placeholder="Número do cartão"
                        type="text"
                        maxLength={16}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="MM/AA"
                          type="text"
                          maxLength={5}
                        />
                        <Input
                          placeholder="CVV"
                          type="text"
                          maxLength={4}
                        />
                      </div>
                      <Input
                        placeholder="Nome do titular"
                        type="text"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="cash" className="mt-4">
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">
                        Pague na entrega em dinheiro
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Error Message */}
              {addressError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-sm">{addressError}</p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg border border-border sticky top-20">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Resumo do Pedido
                </h3>

                <div className="space-y-3 max-h-64 overflow-y-auto mb-6 pb-6 border-b border-border">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-semibold text-foreground">
                        MT{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">
                      MT{subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Entrega</span>
                    <span className="font-semibold text-foreground">
                      MT{deliveryFee.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between mb-6">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-red-600">
                    MT{total.toFixed(2)}
                  </span>
                </div>

                <Button
                  onClick={createOrder}
                  disabled={isProcessing}
                  className="w-full bg-red-600 hover:bg-red-700 h-12"
                >
                  {isProcessing ? 'Processando...' : 'Confirmar Pedido'}
                </Button>

                <Link href={`/cart?restaurantId=${restaurantId}`}>
                  <Button variant="outline" className="w-full mt-2">
                    Voltar ao Carrinho
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

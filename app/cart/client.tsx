'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus, Minus } from 'lucide-react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  restaurantId: string
}

export default function CartPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const restaurantId = searchParams.get('restaurantId')

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [restaurant, setRestaurant] = useState<any>(null)
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!restaurantId) return

    const loadCart = async () => {
      try {
        // Load cart from localStorage
        const savedCart = localStorage.getItem(`cart_${restaurantId}`) || '[]'
        const items = JSON.parse(savedCart)
        setCartItems(items)

        // Load restaurant data
        const response = await fetch(`/api/restaurants/${restaurantId}`)
        if (response.ok) {
          const data = await response.json()
          setRestaurant(data.restaurant)
        }
      } catch (error) {
        console.error('[Cart] Error loading cart:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [restaurantId])

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
      return
    }

    const updated = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    )
    setCartItems(updated)
    localStorage.setItem(`cart_${restaurantId}`, JSON.stringify(updated))
  }

  const removeItem = (itemId: string) => {
    const updated = cartItems.filter((item) => item.id !== itemId)
    setCartItems(updated)
    localStorage.setItem(`cart_${restaurantId}`, JSON.stringify(updated))
  }

  const applyCoupon = async () => {
    if (!couponCode) return

    try {
      const response = await fetch(`/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          restaurantId,
          subtotal,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setDiscount(data.discountAmount)
      } else {
        alert('Cupom inválido ou expirado')
      }
    } catch (error) {
      console.error('[Cart] Error validating coupon:', error)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = restaurant?.delivery_fee || 0
  const total = subtotal + deliveryFee - discount

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando carrinho...</p>
      </div>
    )
  }

  if (!restaurantId || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">🍜</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">FastFlow</h1>
            </Link>
          </div>
        </header>

        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Carrinho Vazio</h2>
            <p className="text-muted-foreground mb-8">
              Seu carrinho está vazio. Comece a adicionar itens!
            </p>
            <Link href="/restaurants">
              <Button className="bg-red-600 hover:bg-red-700">
                Voltar aos Restaurantes
              </Button>
            </Link>
          </div>
        </section>
      </div>
    )
  }

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
            {restaurant?.name}
          </h2>
        </div>
      </header>

      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold text-foreground mb-6">Itens do Carrinho</h3>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-lg border border-border flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        MT{item.price.toFixed(2)} cada
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 border border-border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="w-20 text-right">
                        <p className="font-semibold text-foreground">
                          MT{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="mt-8 bg-white p-4 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-4">Cupom Promocional</h4>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Código do cupom"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={applyCoupon}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg border border-border sticky top-20">
                <h3 className="text-lg font-bold text-foreground mb-6">Resumo</h3>

                <div className="space-y-3 mb-6 pb-6 border-b border-border">
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
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto</span>
                      <span className="font-semibold">
                        -MT{discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mb-6">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-red-600">
                    MT{total.toFixed(2)}
                  </span>
                </div>

                <Link href={`/checkout?restaurantId=${restaurantId}`}>
                  <Button className="w-full bg-red-600 hover:bg-red-700 h-12">
                    Continuar para Checkout
                  </Button>
                </Link>

                <Link href={`/menu/${restaurantId}`}>
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                  >
                    Voltar ao Cardápio
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

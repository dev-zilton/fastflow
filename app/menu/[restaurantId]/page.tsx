'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Search, ArrowLeft, Leaf, AlertTriangle } from 'lucide-react'

interface MenuItem {
  id: string
  name: string
  description?: string
  category: string
  price: string | number
  image_url?: string
  is_available: boolean
  is_vegetarian: boolean
  allergens?: string
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  restaurantId: string
}

export default function MenuPage() {
  const params = useParams()
  const restaurantId = params.restaurantId as string

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [restaurant, setRestaurant] = useState<any>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [addedId, setAddedId] = useState<string | null>(null)

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await fetch(`/api/restaurants/${restaurantId}`)
        if (!response.ok) throw new Error('Failed to fetch menu')
        const data = await response.json()
        setRestaurant(data.restaurant)
        setMenuItems(data.items)
        const uniqueCategories = [...new Set(data.items.map((item: MenuItem) => item.category))] as string[]
        setCategories(uniqueCategories)
        if (uniqueCategories.length > 0) setSelectedCategory(uniqueCategories[0])
        const savedCart = localStorage.getItem(`cart_${restaurantId}`)
        if (savedCart) {
          const cart = JSON.parse(savedCart)
          setCartCount(cart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0))
        }
      } catch (error) {
        console.error('[Menu] Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMenuData()
  }, [restaurantId])

  useEffect(() => {
    let filtered = menuItems
    if (selectedCategory) filtered = filtered.filter((item) => item.category === selectedCategory)
    if (searchTerm) filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredItems(filtered)
  }, [menuItems, selectedCategory, searchTerm])

  const addToCart = (item: MenuItem) => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem(`cart_${restaurantId}`) || '[]')
    const existingItem = cart.find((ci) => ci.id === item.id)
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({ id: item.id, name: item.name, price: parseFloat(item.price as string), quantity: 1, restaurantId })
    }
    localStorage.setItem(`cart_${restaurantId}`, JSON.stringify(cart))
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0))
    setAddedId(item.id)
    setTimeout(() => setAddedId(null), 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🍜</div>
          <p className="text-sm text-gray-400 font-medium">Carregando cardápio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/restaurants" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
            <div className="h-5 w-px bg-gray-200" />
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-base">🍜</div>
              <span className="text-lg font-extrabold tracking-tight text-gray-900" style={{fontFamily:'var(--font-syne)'}}>FastFlow</span>
            </Link>
            {restaurant && (
              <>
                <div className="h-5 w-px bg-gray-200" />
                <div>
                  <p className="text-sm font-semibold text-gray-800 leading-none">{restaurant.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{restaurant.address}</p>
                </div>
              </>
            )}
          </div>
          <Link href={`/cart?restaurantId=${restaurantId}`} className="relative flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <ShoppingCart className="h-4 w-4" />
            Carrinho
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* SEARCH */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar no cardápio..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <div className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-red-600 text-white'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MENU ITEMS */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {filteredItems.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-sm text-gray-400">Nenhum item encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`group rounded-2xl border bg-white overflow-hidden transition-all duration-200 ${
                  item.is_available
                    ? 'border-gray-100 hover:border-red-200 hover:shadow-sm'
                    : 'border-gray-100 opacity-60'
                }`}
              >
                {/* IMAGE */}
                <div className="relative flex h-44 w-full items-center justify-center bg-gray-50">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-5xl">🍱</span>
                  )}
                  {!item.is_available && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                      <span className="rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold text-white">
                        Indisponível
                      </span>
                    </div>
                  )}
                </div>

                {/* INFO */}
                <div className="p-4">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
                    {item.is_vegetarian && (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                        <Leaf className="h-3 w-3" /> Veg
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-gray-400">
                      {item.description}
                    </p>
                  )}

                  {item.allergens && (
                    <div className="mb-3 flex items-center gap-1 text-xs text-orange-500">
                      <AlertTriangle className="h-3 w-3" />
                      {item.allergens}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-gray-900">
                      MT {parseFloat(item.price as string).toFixed(2)}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      disabled={!item.is_available}
                      className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                        addedId === item.id
                          ? 'bg-green-600 text-white scale-95'
                          : item.is_available
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'cursor-not-allowed bg-gray-100 text-gray-400'
                      }`}
                    >
                      {addedId === item.id ? '✓ Adicionado' : 'Adicionar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

    </div>
  )
}

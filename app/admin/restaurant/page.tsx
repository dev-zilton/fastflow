'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, Loader2 } from 'lucide-react'

interface Restaurant {
  id: string
  name: string
  description: string
  address: string
  city: string
  phone: string
  email: string
  min_order_value: string
  delivery_fee: string
  estimated_delivery_minutes: number
}

export default function RestaurantPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changes, setChanges] = useState<Partial<Restaurant>>({})

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await fetch('/api/restaurants')
        if (response.ok) {
          const restaurants = await response.json()
          if (Array.isArray(restaurants) && restaurants.length > 0) {
            setRestaurant(restaurants[0])
          }
        }
      } catch (error) {
        console.error('[Restaurant] Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurant()
  }, [])

  const handleSave = async () => {
    if (!restaurant) return

    setSaving(true)
    try {
      const response = await fetch(`/api/restaurants/${restaurant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...restaurant, ...changes }),
      })

      if (response.ok) {
        const updated = await response.json()
        setRestaurant(updated)
        setChanges({})
        alert('Restaurante atualizado com sucesso!')
      }
    } catch (error) {
      console.error('[Restaurant] Error:', error)
      alert('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof Restaurant, value: any) => {
    setChanges({ ...changes, [field]: value })
  }

  if (loading) {
    return <div className="text-center py-12">Carregando...</div>
  }

  if (!restaurant) {
    return <div className="text-center py-12">Restaurante não encontrado</div>
  }

  const displayRestaurant = { ...restaurant, ...changes }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações do Restaurante</h1>
        <p className="text-gray-600 mt-2">Atualize as informações do seu restaurante</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={displayRestaurant.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Telefone</label>
              <Input
                value={displayRestaurant.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Descrição</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              value={displayRestaurant.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={displayRestaurant.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cidade</label>
              <Input
                value={displayRestaurant.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Endereço</label>
            <Input
              value={displayRestaurant.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações de Entrega</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Valor Mínimo (MT)</label>
              <Input
                type="number"
                value={displayRestaurant.min_order_value}
                onChange={(e) => handleChange('min_order_value', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Taxa de Entrega (MT)</label>
              <Input
                type="number"
                value={displayRestaurant.delivery_fee}
                onChange={(e) => handleChange('delivery_fee', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tempo Estimado (min)</label>
              <Input
                type="number"
                value={displayRestaurant.estimated_delivery_minutes}
                onChange={(e) => handleChange('estimated_delivery_minutes', parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-2">
        <Button
          onClick={handleSave}
          disabled={saving || Object.keys(changes).length === 0}
          className="bg-red-600 hover:bg-red-700"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Alterações
        </Button>
        {Object.keys(changes).length > 0 && (
          <Button
            variant="outline"
            onClick={() => setChanges({})}
          >
            Descartar
          </Button>
        )}
      </div>
    </div>
  )
}

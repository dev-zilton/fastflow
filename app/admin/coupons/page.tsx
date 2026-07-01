'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Edit2, Loader2, Copy } from 'lucide-react'

interface Coupon {
  id: string
  code: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  times_used: number
  usage_limit: number
  is_active: boolean
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as const,
    discount_value: 0,
    usage_limit: 0,
  })

  const handleAddCoupon = async () => {
    if (!newCoupon.code || !newCoupon.discount_value) {
      alert('Preencha todos os campos')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCoupon,
          start_date: new Date(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        }),
      })

      if (response.ok) {
        const added = await response.json()
        setCoupons([...coupons, added])
        setNewCoupon({
          code: '',
          description: '',
          discount_type: 'percentage',
          discount_value: 0,
          usage_limit: 0,
        })
        setShowForm(false)
      }
    } catch (error) {
      console.error('[Coupons] Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleCoupon = async (couponId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !active }),
      })

      if (response.ok) {
        const updated = await response.json()
        setCoupons(coupons.map((c) => (c.id === couponId ? updated : c)))
      }
    } catch (error) {
      console.error('[Coupons] Toggle error:', error)
    }
  }

  const deleteCoupon = async (couponId: string) => {
    if (!confirm('Tem certeza?')) return

    try {
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCoupons(coupons.filter((c) => c.id !== couponId))
      }
    } catch (error) {
      console.error('[Coupons] Delete error:', error)
    }
  }

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code)
    alert(`Código ${code} copiado!`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Cupons</h1>
          <p className="text-gray-600 mt-2">{coupons.length} cupons cadastrados</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cupom
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Cupom</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Código</label>
                <Input
                  placeholder="DESCONTO10"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tipo</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newCoupon.discount_type}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value as any })}
                >
                  <option value="percentage">Percentual (%)</option>
                  <option value="fixed">Valor Fixo (MT)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Desconto</label>
                <Input
                  type="number"
                  placeholder="10"
                  value={newCoupon.discount_value}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Limite de Uso (0 = ilimitado)</label>
                <Input
                  type="number"
                  placeholder="100"
                  value={newCoupon.usage_limit}
                  onChange={(e) => setNewCoupon({ ...newCoupon, usage_limit: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Input
                placeholder="Ex: 10% de desconto"
                value={newCoupon.description}
                onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
              />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleAddCoupon}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Criar Cupom
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cupons Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Nenhum cupom cadastrado</p>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <code className="bg-gray-200 px-3 py-1 rounded font-mono text-sm font-bold">
                          {coupon.code}
                        </code>
                        <p className="text-sm text-gray-600 mt-1">{coupon.description}</p>
                      </div>
                      <div>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700"
                        >
                          {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `MT ${coupon.discount_value}`}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Usado: {coupon.times_used}/{coupon.usage_limit || '∞'} vezes</span>
                      <span>{coupon.is_active ? '✓ Ativo' : '✗ Inativo'}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyCouponCode(coupon.code)}
                      className="text-blue-600"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={coupon.is_active ? 'default' : 'outline'}
                      onClick={() => toggleCoupon(coupon.id, coupon.is_active)}
                      className={coupon.is_active ? 'bg-green-600' : ''}
                    >
                      {coupon.is_active ? 'Ativo' : 'Inativo'}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteCoupon(coupon.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

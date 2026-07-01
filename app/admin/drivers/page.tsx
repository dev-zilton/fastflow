'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Edit2, Loader2 } from 'lucide-react'

interface Driver {
  id: string
  name: string
  phone: string
  email: string
  vehicle_type: string
  license_plate: string
  status: 'available' | 'on_delivery' | 'offline'
  rating: number
  total_deliveries: number
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    email: '',
    vehicle_type: 'motorcycle',
    license_plate: '',
  })

  const handleAddDriver = async () => {
    if (!newDriver.name || !newDriver.phone) {
      alert('Preencha os campos obrigatórios')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDriver),
      })

      if (response.ok) {
        const added = await response.json()
        setDrivers([...drivers, added])
        setNewDriver({ name: '', phone: '', email: '', vehicle_type: 'motorcycle', license_plate: '' })
        setShowForm(false)
      }
    } catch (error) {
      console.error('[Drivers] Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteDriver = async (driverId: string) => {
    if (!confirm('Tem certeza?')) return

    try {
      const response = await fetch(`/api/drivers/${driverId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDrivers(drivers.filter((d) => d.id !== driverId))
      }
    } catch (error) {
      console.error('[Drivers] Delete error:', error)
    }
  }

  const statusColor = {
    available: 'bg-green-100 text-green-800',
    on_delivery: 'bg-blue-100 text-blue-800',
    offline: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Entregadores</h1>
          <p className="text-gray-600 mt-2">{drivers.length} entregadores cadastrados</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Entregador
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Entregador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input
                  placeholder="João Silva"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  placeholder="(+258) 82 123 4567"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="joao@fastflow.mz"
                  value={newDriver.email}
                  onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Veículo</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newDriver.vehicle_type}
                  onChange={(e) => setNewDriver({ ...newDriver, vehicle_type: e.target.value })}
                >
                  <option value="motorcycle">Motocicleta</option>
                  <option value="bicycle">Bicicleta</option>
                  <option value="car">Carro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Placa do Veículo</label>
              <Input
                placeholder="ABC-1234"
                value={newDriver.license_plate}
                onChange={(e) => setNewDriver({ ...newDriver, license_plate: e.target.value })}
              />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleAddDriver}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Adicionar
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
          <CardTitle>Entregadores Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          {drivers.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Nenhum entregador cadastrado</p>
          ) : (
            <div className="space-y-3">
              {drivers.map((driver) => (
                <div key={driver.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{driver.name}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span>{driver.phone}</span>
                      <span>{driver.vehicle_type}</span>
                      <span>({driver.license_plate})</span>
                    </div>
                    <div className="flex items-center space-x-3 mt-2">
                      <Badge className={statusColor[driver.status]}>
                        {driver.status === 'available' ? 'Disponível' : 
                         driver.status === 'on_delivery' ? 'Em Entrega' : 'Offline'}
                      </Badge>
                      <span className="text-xs text-gray-500">⭐ {driver.rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">{driver.total_deliveries} entregas</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteDriver(driver.id)}
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

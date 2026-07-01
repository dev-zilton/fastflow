"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Plus, Loader2, Check } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  category: string;
  price: string;
  image_url: string;
  is_available: boolean;
}

export default function MenuPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    category: "sushi",
    price: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch("/api/restaurants");
        if (!response.ok) throw new Error("Failed to fetch restaurants");
        const data = await response.json();
        setRestaurants(data);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedRestaurantId(data[0].id);
        }
      } catch (error) {
        console.error("[Menu] Error loading restaurants:", error);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      if (!selectedRestaurantId) return;

      setLoading(true);
      try {
        const response = await fetch(
          `/api/menu-items?restaurantId=${selectedRestaurantId}`,
        );
        if (!response.ok) throw new Error("Failed to fetch menu items");
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("[Menu] Error loading items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [selectedRestaurantId]);

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price || !selectedRestaurantId) {
      alert("Preencha todos os campos obrigatórios e selecione um restaurante");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newItem,
          restaurantId: selectedRestaurantId,
        }),
      });

      if (response.ok) {
        const added = await response.json();
        setItems([...items, added]);
        setNewItem({ name: "", description: "", category: "sushi", price: "" });
        setShowForm(false);
      }
    } catch (error) {
      console.error("[Menu] Error adding item:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAvailability = async (itemId: string, available: boolean) => {
    try {
      const response = await fetch(`/api/menu-items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_available: !available }),
      });

      if (response.ok) {
        const updated = await response.json();
        setItems(items.map((i) => (i.id === itemId ? updated : i)));
      }
    } catch (error) {
      console.error("[Menu] Toggle error:", error);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm("Tem certeza que deseja deletar este item?")) return;

    try {
      const response = await fetch(`/api/menu-items/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItems(items.filter((i) => i.id !== itemId));
      }
    } catch (error) {
      console.error("[Menu] Delete error:", error);
    }
  };

  const categories = [
    "sushi",
    "sashimi",
    "rolls",
    "temaki",
    "bebidas",
    "sobremesas",
  ];
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(filter.toLowerCase()) ||
      item.description.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciar Cardápio
          </h1>
          <p className="text-gray-600 mt-2">{items.length} itens no cardápio</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Restaurante
            </label>
            <select
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md"
            >
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Item
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Novo Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome</label>
              <Input
                placeholder="Ex: Sushi de Salmão"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Input
                placeholder="Ex: Sushi fresco com salmão premium"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem({ ...newItem, category: e.target.value })
                  }
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Preço (MT)</label>
                <Input
                  type="number"
                  placeholder="Ex: 150"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleAddItem}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
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
          <CardTitle>Itens do Cardápio</CardTitle>
          <Input
            placeholder="Buscar item..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mt-4"
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            </div>
          ) : filteredItems.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              Nenhum item encontrado
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <Badge variant="outline" className="mt-1">
                        {item.category}
                      </Badge>
                    </div>
                    <p className="font-bold text-red-600">
                      MT{parseFloat(item.price).toFixed(2)}
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <Button
                      size="sm"
                      variant={item.is_available ? "default" : "outline"}
                      onClick={() =>
                        toggleAvailability(item.id, item.is_available)
                      }
                      className={item.is_available ? "bg-green-600" : ""}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      {item.is_available ? "Disponível" : "Indisponível"}
                    </Button>

                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

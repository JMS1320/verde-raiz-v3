"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, LogOut } from "lucide-react"

interface LoginFormProps {
  onLogin: (user: { name: string; pin: string }) => void
  currentUser: { name: string; pin: string } | null
  onLogout: () => void
}

const OPERARIOS = ["Juan Pérez", "María González", "Carlos Rodríguez", "Ana Martínez", "Luis Torres"]

export default function LoginForm({ onLogin, currentUser, onLogout }: LoginFormProps) {
  const [selectedName, setSelectedName] = useState("")
  const [pin, setPin] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedName || pin.length !== 4) return

    setLoading(true)

    // Simular validación
    setTimeout(() => {
      onLogin({ name: selectedName, pin })
      setLoading(false)
    }, 500)
  }

  if (currentUser) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <User className="h-5 w-5 text-green-600" />
            Usuario Activo
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="font-medium text-green-800">{currentUser.name}</p>
            <p className="text-sm text-green-600">Sesión iniciada</p>
          </div>
          <Button variant="outline" onClick={onLogout} className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Cambiar Usuario
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <User className="h-5 w-5 text-green-600" />
          Iniciar Sesión
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="operario">Operario</Label>
            <Select value={selectedName} onValueChange={setSelectedName} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu nombre" />
              </SelectTrigger>
              <SelectContent>
                {OPERARIOS.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin">PIN (4 dígitos)</Label>
            <Input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
              maxLength={4}
              className="text-center text-lg tracking-widest"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !selectedName || pin.length !== 4}>
            {loading ? "Validando..." : "Ingresar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  CalendarDays,
  Leaf,
  Droplets,
  Scissors,
  ArrowRightLeft,
  Sun,
  Moon,
  AlertCircle,
  Skull,
  Scale,
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { useData } from "@/lib/data-context"
import type { Lot, Activity } from "@/lib/mock-data"

interface LotDetailProps {
  lotId: string
  onBack: () => void
}

interface NivelesStats {
  ph: { min: number | null; avg: number | null; max: number | null }
  conductividad: { min: number | null; avg: number | null; max: number | null }
  temperatura: { min: number | null; avg: number | null; max: number | null }
}

export default function LotDetail({ lotId, onBack }: LotDetailProps) {
  const { lots, activities } = useData()
  const [lot, setLot] = useState<Lot | null>(null)
  const [lotActivities, setLotActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [nivelesStats, setNivelesStats] = useState<NivelesStats | null>(null)

  useEffect(() => {
    // Simulamos una carga de datos
    const timer = setTimeout(() => {
      // Buscar el lote por ID
      const foundLot = lots.find((l) => l.id === lotId) || null
      setLot(foundLot)

      // Filtrar actividades para este lote
      const filteredActivities = activities.filter((a) => a.lote_id === lotId)
      // Ordenar por fecha y hora más reciente primero
      const sortedActivities = filteredActivities.sort((a, b) => {
        const dateA = new Date(`${a.fecha}T${a.hora}`)
        const dateB = new Date(`${b.fecha}T${b.hora}`)
        return dateB.getTime() - dateA.getTime()
      })
      setLotActivities(sortedActivities)

      // Simular estadísticas de niveles
      setNivelesStats({
        ph: { min: 5.8, avg: 6.2, max: 6.5 },
        conductividad: { min: 1.5, avg: 1.8, max: 2.1 },
        temperatura: { min: 20.5, avg: 22.5, max: 24.8 },
      })

      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [lotId, lots, activities])

  // Format date as DD/MM/YYYY
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "dd/MM/yyyy", { locale: es })
  }

  // Get activity icon
  const getActivityIcon = (type: string) => {
    if (type.startsWith("trasplante")) {
      return <ArrowRightLeft className="h-4 w-4" />
    }

    switch (type) {
      case "siembra":
      case "plantines_comprados":
        return <Leaf className="h-4 w-4" />
      case "riego":
        return <Droplets className="h-4 w-4" />
      case "cosecha":
        return <Scissors className="h-4 w-4" />
      case "pesada":
        return <Scale className="h-4 w-4" />
      case "apertura":
        return <Sun className="h-4 w-4" />
      case "cierre":
        return <Moon className="h-4 w-4" />
      case "niveles":
        return <AlertCircle className="h-4 w-4" />
      case "mortandad":
        return <Skull className="h-4 w-4" />
      default:
        return <CalendarDays className="h-4 w-4" />
    }
  }

  // Get activity name in Spanish
  const getActivityName = (type: string) => {
    if (type.startsWith("trasplante")) {
      const parts = type.split(" ")
      if (parts.length > 1) {
        return `Trasplante a ${parts.slice(1).join(" ")}`
      }
      return "Trasplante"
    }

    switch (type) {
      case "siembra":
        return "Siembra"
      case "plantines_comprados":
        return "Plantines Comprados"
      case "riego":
        return "Riego"
      case "cosecha":
        return "Cosecha"
      case "pesada":
        return "Cosecha + Pesada"
      case "apertura":
        return "Apertura"
      case "cierre":
        return "Cierre de Lote"
      case "niveles":
        return "Niveles"
      case "mortandad":
        return "Mortandad"
      default:
        return type
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando detalles del lote...</div>
  }

  if (!lot) {
    return (
      <div className="text-center py-8">
        <p>No se encontró el lote</p>
        <Button onClick={onBack} className="mt-4">
          Volver
        </Button>
      </div>
    )
  }

  // Calculate days since planting
  const getDaysSincePlanting = () => {
    const today = new Date()
    const plantDate = new Date(lot.fechaSiembra)
    const diffTime = Math.abs(today.getTime() - plantDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Lote {lot.loteNum}</CardTitle>
            <div
              className="text-xs px-2 py-1 rounded-full text-white"
              style={{ backgroundColor: getLotSystemColor(lot.sistema) }}
            >
              {lot.sistema}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm text-muted-foreground">Fecha de siembra</p>
              <p>{formatDate(lot.fechaSiembra)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Días desde siembra</p>
              <p>{getDaysSincePlanting()} días</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cantidad sembrada</p>
              <p>{lot.cantidadInicial}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cantidad actual</p>
              <p>{lot.cantidadActual}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total cosechado</p>
              <p>{lot.totalCosechado}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mortandad</p>
              <p>{lot.totalMortandad}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Variedad</p>
              <p>{lot.variedad}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Estado</p>
              <p>{lot.estado === "Activo" ? "Activo" : "Cerrado"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Actividades</CardTitle>
        </CardHeader>
        <CardContent>
          {lotActivities.length === 0 ? (
            <p className="text-center py-4">No hay actividades registradas</p>
          ) : (
            <div className="space-y-4">
              {lotActivities.map((activity) => (
                <div key={activity.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-muted p-2 rounded-full mr-2">{getActivityIcon(activity.labor)}</div>
                      <div>
                        <p className="font-medium">{getActivityName(activity.labor)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(activity.fecha)} - {activity.hora.substring(0, 5)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {activity.cantidad && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Cantidad</p>
                      <p className="text-sm">{activity.cantidad}</p>
                    </div>
                  )}

                  {activity.pesoTestigoConRaiz && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Peso testigo con raíz</p>
                      <p className="text-sm">{activity.pesoTestigoConRaiz} g</p>
                    </div>
                  )}

                  {activity.pesoTestigoSinRaiz && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Peso testigo sin raíz</p>
                      <p className="text-sm">{activity.pesoTestigoSinRaiz} g</p>
                    </div>
                  )}

                  {activity.observaciones && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Observaciones</p>
                      <p className="text-sm">{activity.observaciones}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Función para obtener color según el sistema
function getLotSystemColor(sistema: string): string {
  switch (sistema) {
    case "Plantines Comprados":
      return "#3b82f6" // blue-500
    case "Germinacion":
      return "#10b981" // emerald-500
    case "Raiz Flotante":
      return "#06b6d4" // cyan-500
    case "Cama de Arena":
      return "#f59e0b" // amber-500
    default:
      return "#6b7280" // gray-500
  }
}

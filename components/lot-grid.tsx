"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, Scissors, Skull, ArrowRight } from "lucide-react"
import { differenceInDays, format } from "date-fns"
import { es } from "date-fns/locale"
import { useData } from "@/lib/data-context"
import type { Lot } from "@/lib/mock-data"

interface LotGridProps {
  onLotClick: (lotId: string) => void
  showClosed?: boolean
  filterBySystem?: string
}

export default function LotGrid({ onLotClick, showClosed = false, filterBySystem }: LotGridProps) {
  const { lots } = useData()
  const [filteredLots, setFilteredLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulamos una carga de datos
    const timer = setTimeout(() => {
      // Filtrar lotes según los criterios
      let filtered = lots.filter((lot) => {
        // Filtrar por estado (cerrado o activo)
        const stateMatch = showClosed ? lot.estado === "Cerrado" : lot.estado === "Activo"

        // Si hay filtro por sistema, aplicarlo
        const systemMatch = filterBySystem ? lot.sistema === filterBySystem : true

        return stateMatch && systemMatch
      })

      // Ordenar por fecha de siembra (más viejo primero)
      filtered = filtered.sort((a, b) => {
        const dateA = new Date(a.fechaSiembra)
        const dateB = new Date(b.fechaSiembra)
        return dateA.getTime() - dateB.getTime()
      })

      setFilteredLots(filtered)
      setLoading(false)
    }, 300) // Reducir tiempo de simulación

    return () => clearTimeout(timer)
  }, [lots, showClosed, filterBySystem])

  // Calculate days since planting
  const getDaysSincePlanting = (plantingDate: string) => {
    const today = new Date()
    const plantDate = new Date(plantingDate)
    return differenceInDays(today, plantDate)
  }

  // Format date as DD/MM/YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "dd/MM/yyyy", { locale: es })
  }

  // Obtener el historial de sistemas como string
  const getSystemHistory = (lot: Lot) => {
    if (lot.historialSistemas.length <= 1) return ""

    return lot.historialSistemas.map((h) => h.sistema).join(" → ")
  }

  if (loading) {
    return <div className="text-center py-8">Cargando lotes...</div>
  }

  if (filteredLots.length === 0) {
    return (
      <div className="text-center py-8">
        {showClosed
          ? "No hay lotes cerrados."
          : filterBySystem
            ? `No hay lotes activos en el sistema ${filterBySystem}.`
            : "No hay lotes activos. Registra un nuevo lote para comenzar."}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredLots.map((lot) => (
        <Card
          key={lot.id}
          className="cursor-pointer hover:bg-accent transition-colors border-l-4"
          style={{ borderLeftColor: getLotSystemColor(lot.sistema) }}
          onClick={() => onLotClick(lot.id)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="font-bold text-lg">{lot.loteNum}</div>
              <div
                className="text-xs px-2 py-1 rounded-full text-white"
                style={{ backgroundColor: getLotSystemColor(lot.sistema) }}
              >
                {lot.sistema}
              </div>
            </div>

            {/* Mostrar si es sub-lote */}
            {lot.loteOrigen && (
              <div className="text-xs text-blue-600 mb-2 flex items-center">
                <ArrowRight className="h-3 w-3 mr-1" />
                Sub-lote derivado
              </div>
            )}

            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <CalendarDays className="h-3 w-3 mr-1" />
              {formatDate(lot.fechaSiembra)} ({getDaysSincePlanting(lot.fechaSiembra)} días)
            </div>

            {/* Historial de sistemas */}
            {getSystemHistory(lot) && (
              <div className="text-xs text-muted-foreground mt-1">Recorrido: {getSystemHistory(lot)}</div>
            )}

            {/* Plantas en camas */}
            <div className="mt-3 text-sm">
              <div className="font-medium">Plantas:</div>
              <div className="flex justify-between">
                <span>Inicial: {lot.cantidadInicial}</span>
                <span>Actual: {lot.cantidadActual}</span>
              </div>
            </div>

            {/* Cosechado */}
            <div className="mt-2 text-sm flex items-start">
              <Scissors className="h-3 w-3 mr-1 mt-0.5" />
              <div>
                <span>Cosechado: {lot.totalCosechado}</span>
                {lot.pesoPromedio !== null && (
                  <div className="text-xs text-muted-foreground">
                    Peso promedio: {lot.pesoPromedio.toFixed(2)} g {lot.conRaiz ? "(con raíz)" : "(sin raíz)"}
                  </div>
                )}
              </div>
            </div>

            {/* Mortandad */}
            <div className="mt-1 text-sm flex items-center">
              <Skull className="h-3 w-3 mr-1" />
              <span>Mortandad: {lot.totalMortandad}</span>
            </div>

            {/* Variedad */}
            <div className="text-xs text-muted-foreground mt-2">{lot.variedad}</div>
          </CardContent>
        </Card>
      ))}
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

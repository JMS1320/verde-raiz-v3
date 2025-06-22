"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Battery, Droplets, ThermometerSun } from "lucide-react"
import { useData } from "@/lib/data-context"
import type { Nivel } from "@/lib/mock-data"

export default function NivelesView() {
  const { niveles } = useData()
  const [sortedNiveles, setSortedNiveles] = useState<Nivel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulamos una carga de datos
    const timer = setTimeout(() => {
      // Ordenar por fecha y hora más reciente primero
      const sorted = [...niveles].sort((a, b) => {
        const dateA = new Date(`${a.fecha}T${a.hora}`)
        const dateB = new Date(`${b.fecha}T${b.hora}`)
        return dateB.getTime() - dateA.getTime()
      })
      setSortedNiveles(sorted)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [niveles])

  // Format date as DD/MM/YYYY
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "dd/MM/yyyy", { locale: es })
  }

  if (loading) {
    return <div className="text-center py-8">Cargando datos de niveles...</div>
  }

  if (sortedNiveles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No hay registros de niveles disponibles.</p>
        <p className="text-sm text-muted-foreground">
          Ve a la pestaña "Registro" para agregar datos de niveles por sistema.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Últimos Registros de Niveles</h2>

      {sortedNiveles.map((nivel) => (
        <Card key={nivel.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex justify-between">
              <span>Niveles - {nivel.sistema}</span>
              <span className="text-sm text-muted-foreground">
                {formatDate(nivel.fecha)} - {nivel.hora.substring(0, 5)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center">
                <div className="bg-blue-100 p-1.5 rounded-full mr-2">
                  <Droplets className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">pH Promedio</p>
                  <p className="font-medium">{nivel.ph_promedio?.toFixed(2) || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-purple-100 p-1.5 rounded-full mr-2">
                  <Droplets className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Conductividad</p>
                  <p className="font-medium">{nivel.conductividad_promedio?.toFixed(2) || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-orange-100 p-1.5 rounded-full mr-2">
                  <ThermometerSun className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Temperatura</p>
                  <p className="font-medium">{nivel.temperatura_promedio?.toFixed(2) || "N/A"}°C</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-green-100 p-1.5 rounded-full mr-2">
                  <Battery className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Batería</p>
                  <p className="font-medium">{nivel.bateria?.toFixed(2) || "N/A"}</p>
                </div>
              </div>
            </div>

            {nivel.observaciones && (
              <div className="mt-2 text-sm">
                <p className="text-xs text-muted-foreground">Observaciones</p>
                <p>{nivel.observaciones}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

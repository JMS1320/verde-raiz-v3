"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import LotGrid from "@/components/lot-grid"
import { SISTEMAS } from "@/lib/mock-data"
import { useData } from "@/lib/data-context"

interface SystemTabsProps {
  onLotClick: (lotId: string) => void
}

export default function SystemTabs({ onLotClick }: SystemTabsProps) {
  const { lots } = useData()
  const [activeSystem, setActiveSystem] = useState(SISTEMAS[0])

  // Contar lotes por sistema
  const getSystemCount = (sistema: string) => {
    return lots.filter((lot) => lot.sistema === sistema && lot.estado === "Activo").length
  }

  // Iconos para cada sistema
  const getSystemIcon = (sistema: string) => {
    switch (sistema) {
      case "Plantines Comprados":
        return "🛒"
      case "Germinacion":
        return "🌱"
      case "Raiz Flotante":
        return "💧"
      case "Cama de Arena":
        return "🏖️"
      default:
        return "📦"
    }
  }

  // Descripción de cada sistema
  const getSystemDescription = (sistema: string) => {
    switch (sistema) {
      case "Plantines Comprados":
        return "Plantines adquiridos listos para trasplante"
      case "Germinacion":
        return "Semillas en proceso de germinación"
      case "Raiz Flotante":
        return "Sistema hidropónico de raíz flotante"
      case "Cama de Arena":
        return "Cultivo en sustrato de arena"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-green-700 mb-2">Lotes Activos por Sistema</h2>
        <p className="text-sm text-muted-foreground">
          Flujo: Plantines Comprados/Germinación → Raíz Flotante/Cama de Arena
        </p>
      </div>

      <Tabs value={activeSystem} onValueChange={setActiveSystem} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-1 h-auto p-1">
          {SISTEMAS.map((sistema) => (
            <TabsTrigger
              key={sistema}
              value={sistema}
              className="flex flex-col items-center p-3 h-auto data-[state=active]:bg-green-100 data-[state=active]:text-green-800"
            >
              <span className="text-lg mb-1">{getSystemIcon(sistema)}</span>
              <span className="text-xs font-medium text-center leading-tight">{sistema}</span>
              <Badge variant="secondary" className="mt-1 text-xs">
                {getSystemCount(sistema)}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {SISTEMAS.map((sistema) => (
          <TabsContent key={sistema} value={sistema} className="mt-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{getSystemIcon(sistema)}</span>
                <h3 className="text-lg font-medium">Sistema: {sistema}</h3>
                <Badge variant="outline" className="ml-2">
                  {getSystemCount(sistema)} lotes activos
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{getSystemDescription(sistema)}</p>
            </div>

            <LotGrid onLotClick={onLotClick} showClosed={false} filterBySystem={sistema} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

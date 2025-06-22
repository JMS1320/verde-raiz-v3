"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import LotGrid from "@/components/lot-grid"
import InputForm from "@/components/input-form"
import LotDetail from "@/components/lot-detail"
import NivelesView from "@/components/niveles-view"
import SystemTabs from "@/components/system-tabs"
import LoginForm from "@/components/login-form"
import SyncStatus from "@/components/sync-status"
import { useData } from "@/lib/data-context"
import ReportGenerator from "@/components/report-generator"

export default function Home() {
  const { clearAllData, currentUser, login, logout } = useData()
  const [activeTab, setActiveTab] = useState("produccion")
  const [selectedLot, setSelectedLot] = useState<string | null>(null)

  const handleLotClick = (lotId: string) => {
    setSelectedLot(lotId)
  }

  const handleBackToLots = () => {
    setSelectedLot(null)
  }

  const handleClearData = () => {
    if (confirm("¿Estás seguro de que quieres borrar todos los datos? Esta acción no se puede deshacer.")) {
      clearAllData()
      setSelectedLot(null)
    }
  }

  // Si no hay usuario logueado, mostrar login
  if (!currentUser) {
    return (
      <main className="container max-w-4xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Verde Raíz v3.0</h1>
          <p className="text-muted-foreground">Control de Producción Hidropónica</p>
        </div>
        <LoginForm onLogin={login} currentUser={currentUser} onLogout={logout} />
      </main>
    )
  }

  return (
    <main className="container max-w-4xl mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <LoginForm onLogin={login} currentUser={currentUser} onLogout={logout} />
          </div>
          <div className="flex items-center gap-2 ml-2">
            <SyncStatus />
            <Button variant="outline" size="sm" onClick={handleClearData} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-2">Verde Raíz v3.0</h1>
        <p className="text-muted-foreground">Control de Producción Hidropónica</p>
      </div>

      {selectedLot ? (
        <LotDetail lotId={selectedLot} onBack={handleBackToLots} />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 h-auto p-1">
            <TabsTrigger value="produccion" className="text-xs py-3 px-2">
              <div className="flex flex-col items-center gap-1">
                <span>🌱</span>
                <span>Activos</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="cerrados" className="text-xs py-3 px-2">
              <div className="flex flex-col items-center gap-1">
                <span>📦</span>
                <span>Cerrados</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="niveles" className="text-xs py-3 px-2">
              <div className="flex flex-col items-center gap-1">
                <span>📊</span>
                <span>Niveles</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="reportes" className="text-xs py-3 px-2">
              <div className="flex flex-col items-center gap-1">
                <span>📄</span>
                <span>Reportes</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="input" className="text-xs py-3 px-2">
              <div className="flex flex-col items-center gap-1">
                <span>✏️</span>
                <span>Registro</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="produccion" className="mt-4">
            <SystemTabs onLotClick={handleLotClick} />
          </TabsContent>

          <TabsContent value="cerrados" className="mt-4">
            <LotGrid onLotClick={handleLotClick} showClosed={true} />
          </TabsContent>

          <TabsContent value="niveles" className="mt-4">
            <NivelesView />
          </TabsContent>

          <TabsContent value="reportes" className="mt-4">
            <ReportGenerator />
          </TabsContent>

          <TabsContent value="input" className="mt-4">
            <InputForm />
          </TabsContent>
        </Tabs>
      )}
    </main>
  )
}

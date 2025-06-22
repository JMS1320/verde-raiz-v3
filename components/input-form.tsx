"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Upload, X } from "lucide-react"
import { SISTEMAS, generateNextLotNumber, calculatePlantingDate, generateSubLotNumber } from "@/lib/mock-data"
import { useData } from "@/lib/data-context"
import type { Lot, Activity, Nivel } from "@/lib/mock-data"

export default function InputForm() {
  const { lots, addLot, addActivity, addNivel, updateLot } = useData()
  const [formType, setFormType] = useState("nuevo-lote")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [newLotNumber, setNewLotNumber] = useState("")
  const [plantineAge, setPlantineAge] = useState(25)
  const [calculatedPlantingDate, setCalculatedPlantingDate] = useState("")
  const [selectedLotType, setSelectedLotType] = useState("")
  const [selectedLot, setSelectedLot] = useState("")
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Calcular fecha de siembra cuando cambia la edad de plantines
  useEffect(() => {
    if (selectedLotType === "plantines-comprados") {
      const plantingDate = calculatePlantingDate(plantineAge)
      setCalculatedPlantingDate(plantingDate)
      const lotNumber = generateNextLotNumber(plantingDate, lots)
      setNewLotNumber(lotNumber)
    }
  }, [plantineAge, selectedLotType, lots])

  // Generar número de lote cuando se selecciona germinación
  const handleLotTypeChange = (value: string) => {
    setSelectedLotType(value)
    if (value === "siembra") {
      const today = new Date().toISOString().split("T")[0]
      const lotNumber = generateNextLotNumber(today, lots)
      setNewLotNumber(lotNumber)
      setCalculatedPlantingDate(today)
    } else if (value === "plantines-comprados") {
      const plantingDate = calculatePlantingDate(plantineAge)
      setCalculatedPlantingDate(plantingDate)
      const lotNumber = generateNextLotNumber(plantingDate, lots)
      setNewLotNumber(lotNumber)
    }
  }

  // Manejar captura/selección de imágenes - Optimizado para Android
  const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        // Validar tamaño de archivo (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert("La imagen es muy grande. Máximo 5MB.")
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            setCapturedImages((prev) => [...prev, e.target!.result as string])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  // Eliminar imagen
  const removeImage = (index: number) => {
    setCapturedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.target as HTMLFormElement)
    const now = new Date()
    const currentDate = now.toISOString().split("T")[0]
    const currentTime = now.toTimeString().split(" ")[0]

    setTimeout(() => {
      try {
        if (formType === "nuevo-lote") {
          const cantidad = Number(formData.get("cantidad"))
          const variedad = formData.get("variedad") as string
          const observaciones = formData.get("observaciones") as string

          // Generar número de lote con datos actualizados justo antes de crear
          const finalLotNumber = generateNextLotNumber(calculatedPlantingDate, lots)

          const newLot: Lot = {
            id: `lot_${Date.now()}`,
            loteNum: finalLotNumber,
            fechaSiembra: calculatedPlantingDate,
            cantidadInicial: cantidad,
            cantidadActual: cantidad,
            estado: "Activo",
            variedad,
            sistema: selectedLotType === "plantines-comprados" ? "Plantines Comprados" : "Germinacion",
            totalCosechado: 0,
            totalMortandad: 0,
            pesoPromedio: null,
            conRaiz: false,
            historialSistemas: [
              {
                sistema: selectedLotType === "plantines-comprados" ? "Plantines Comprados" : "Germinacion",
                fechaIngreso: calculatedPlantingDate,
              },
            ],
          }

          addLot(newLot)

          // Agregar actividad de creación
          const newActivity: Activity = {
            id: `activity_${Date.now()}`,
            lote_id: newLot.id,
            fecha: currentDate,
            hora: currentTime,
            labor: selectedLotType === "plantines-comprados" ? "plantines_comprados" : "siembra",
            cantidad,
            variedad,
            observaciones,
            pesoTestigoConRaiz: null,
            pesoTestigoSinRaiz: null,
            pesoLoteConRaiz: null,
            pesoLoteSinRaiz: null,
            pesoPlantaConRaiz: null,
            pesoPlantaSinRaiz: null,
          }

          addActivity(newActivity)
        } else if (formType === "trasplante") {
          const cantidadTrasplante = Number(formData.get("cantidadTrasplante"))
          const sistemaDestino = formData.get("sistemaDestino") as string
          const observaciones = formData.get("observaciones") as string

          const lotToTransplant = lots.find((l) => l.id === selectedLot)
          if (!lotToTransplant) throw new Error("Lote no encontrado")

          // Si es trasplante parcial, crear sub-lote
          if (cantidadTrasplante < lotToTransplant.cantidadActual) {
            const subLotNumber = generateSubLotNumber(lotToTransplant.loteNum, lots)

            const subLot: Lot = {
              ...lotToTransplant,
              id: `lot_${Date.now()}`,
              loteNum: subLotNumber,
              cantidadInicial: cantidadTrasplante,
              cantidadActual: cantidadTrasplante,
              sistema: sistemaDestino,
              loteOrigen: lotToTransplant.id,
              historialSistemas: [
                ...lotToTransplant.historialSistemas,
                {
                  sistema: sistemaDestino,
                  fechaIngreso: currentDate,
                },
              ],
            }

            addLot(subLot)

            // Actualizar lote original
            updateLot(lotToTransplant.id, {
              cantidadActual: lotToTransplant.cantidadActual - cantidadTrasplante,
            })
          } else {
            // Trasplante total
            updateLot(lotToTransplant.id, {
              sistema: sistemaDestino,
              historialSistemas: [
                ...lotToTransplant.historialSistemas.map((h) =>
                  h.fechaSalida ? h : { ...h, fechaSalida: currentDate },
                ),
                {
                  sistema: sistemaDestino,
                  fechaIngreso: currentDate,
                },
              ],
            })
          }

          // Agregar actividad de trasplante
          const transplantActivity: Activity = {
            id: `activity_${Date.now()}`,
            lote_id: selectedLot,
            fecha: currentDate,
            hora: currentTime,
            labor: `trasplante ${sistemaDestino}`,
            cantidad: cantidadTrasplante,
            variedad: null,
            observaciones,
            pesoTestigoConRaiz: null,
            pesoTestigoSinRaiz: null,
            pesoLoteConRaiz: null,
            pesoLoteSinRaiz: null,
            pesoPlantaConRaiz: null,
            pesoPlantaSinRaiz: null,
            sistemaOrigen: lotToTransplant.sistema,
            sistemaDestino,
          }

          addActivity(transplantActivity)
        } else if (formType === "cosecha") {
          const loteId = formData.get("lote") as string
          const cantidad = Number(formData.get("cantidad"))
          const pesoConRaiz = formData.get("pesoConRaiz") ? Number(formData.get("pesoConRaiz")) : null
          const pesoSinRaiz = formData.get("pesoSinRaiz") ? Number(formData.get("pesoSinRaiz")) : null
          const observaciones = formData.get("observaciones") as string

          const lot = lots.find((l) => l.id === loteId)
          if (!lot) throw new Error("Lote no encontrado")

          // Actualizar lote
          const newTotalCosechado = lot.totalCosechado + cantidad
          const newCantidadActual = lot.cantidadActual - cantidad

          updateLot(loteId, {
            cantidadActual: newCantidadActual,
            totalCosechado: newTotalCosechado,
            pesoPromedio: pesoSinRaiz || pesoConRaiz,
            conRaiz: pesoConRaiz !== null && pesoSinRaiz === null,
          })

          // Agregar actividad
          const harvestActivity: Activity = {
            id: `activity_${Date.now()}`,
            lote_id: loteId,
            fecha: currentDate,
            hora: currentTime,
            labor: "cosecha",
            cantidad,
            variedad: null,
            observaciones,
            pesoTestigoConRaiz: pesoConRaiz,
            pesoTestigoSinRaiz: pesoSinRaiz,
            pesoLoteConRaiz: null,
            pesoLoteSinRaiz: null,
            pesoPlantaConRaiz: null,
            pesoPlantaSinRaiz: null,
          }

          addActivity(harvestActivity)
        } else if (formType === "mortandad") {
          const loteId = formData.get("lote") as string
          const cantidad = Number(formData.get("cantidad"))
          const observaciones = formData.get("observaciones") as string

          const lot = lots.find((l) => l.id === loteId)
          if (!lot) throw new Error("Lote no encontrado")

          // Actualizar lote
          const newTotalMortandad = lot.totalMortandad + cantidad
          const newCantidadActual = lot.cantidadActual - cantidad

          updateLot(loteId, {
            cantidadActual: newCantidadActual,
            totalMortandad: newTotalMortandad,
          })

          // Agregar actividad
          const mortalityActivity: Activity = {
            id: `activity_${Date.now()}`,
            lote_id: loteId,
            fecha: currentDate,
            hora: currentTime,
            labor: "mortandad",
            cantidad,
            variedad: null,
            observaciones,
            pesoTestigoConRaiz: null,
            pesoTestigoSinRaiz: null,
            pesoLoteConRaiz: null,
            pesoLoteSinRaiz: null,
            pesoPlantaConRaiz: null,
            pesoPlantaSinRaiz: null,
          }

          addActivity(mortalityActivity)
        } else if (formType === "evolucion") {
          const loteId = formData.get("lote") as string
          const observaciones = formData.get("observaciones") as string

          // Agregar actividad de evolución con imágenes
          const evolutionActivity: Activity = {
            id: `activity_${Date.now()}`,
            lote_id: loteId,
            fecha: currentDate,
            hora: currentTime,
            labor: "evolucion",
            cantidad: null,
            variedad: null,
            observaciones,
            pesoTestigoConRaiz: null,
            pesoTestigoSinRaiz: null,
            pesoLoteConRaiz: null,
            pesoLoteSinRaiz: null,
            pesoPlantaConRaiz: null,
            pesoPlantaSinRaiz: null,
            imagenes: capturedImages, // Guardar las imágenes en base64
          }

          addActivity(evolutionActivity)
        } else if (formType === "niveles") {
          const sistema = formData.get("sistemaNiveles") as string
          const ph = Number(formData.get("ph"))
          const conductividad = Number(formData.get("conductividad"))
          const temperatura = Number(formData.get("temperatura"))
          const bateria = formData.get("bateria") ? Number(formData.get("bateria")) : null
          const observaciones = formData.get("observaciones") as string

          const newNivel: Nivel = {
            id: `nivel_${Date.now()}`,
            fecha: currentDate,
            hora: currentTime,
            sistema,
            ph_promedio: ph,
            conductividad_promedio: conductividad,
            temperatura_promedio: temperatura,
            bateria,
            observaciones,
          }

          addNivel(newNivel)
        }

        setLoading(false)
        setSuccess(true)

        // Resetear formulario
        ;(e.target as HTMLFormElement).reset()
        setSelectedLotType("")
        setSelectedLot("")
        setNewLotNumber("")
        setCapturedImages([])

        // Resetear mensaje de éxito después de 3 segundos
        setTimeout(() => setSuccess(false), 3000)
      } catch (error) {
        console.error("Error al guardar:", error)
        setLoading(false)
      }
    }, 1000)
  }

  // Obtener lotes activos para trasplantes
  const getActiveLots = () => {
    return lots.filter((lot) => lot.estado === "Activo")
  }

  // Obtener sistema del lote seleccionado
  const getSelectedLotSystem = () => {
    const lot = lots.find((l) => l.id === selectedLot)
    return lot?.sistema || ""
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Registro de Actividad</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            defaultValue="nuevo-lote"
            value={formType}
            onValueChange={setFormType}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            <div>
              <RadioGroupItem value="nuevo-lote" id="nuevo-lote" className="peer sr-only" />
              <Label
                htmlFor="nuevo-lote"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer min-h-[100px] touch-manipulation"
              >
                <span className="text-3xl mb-2">🌱</span>
                <span className="text-sm font-medium text-center">Nuevo Lote</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="trasplante" id="trasplante" className="peer sr-only" />
              <Label
                htmlFor="trasplante"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer min-h-[100px] touch-manipulation"
              >
                <span className="text-3xl mb-2">🔄</span>
                <span className="text-sm font-medium text-center">Trasplante</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="cosecha" id="cosecha" className="peer sr-only" />
              <Label
                htmlFor="cosecha"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer min-h-[100px] touch-manipulation"
              >
                <span className="text-3xl mb-2">✂️</span>
                <span className="text-sm font-medium text-center">Cosecha</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="mortandad" id="mortandad" className="peer sr-only" />
              <Label
                htmlFor="mortandad"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer min-h-[100px] touch-manipulation"
              >
                <span className="text-3xl mb-2">💀</span>
                <span className="text-sm font-medium text-center">Mortandad</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="evolucion" id="evolucion" className="peer sr-only" />
              <Label
                htmlFor="evolucion"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer min-h-[100px] touch-manipulation"
              >
                <span className="text-3xl mb-2">📸</span>
                <span className="text-sm font-medium text-center">Evolución</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="niveles" id="niveles" className="peer sr-only" />
              <Label
                htmlFor="niveles"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer min-h-[100px] touch-manipulation"
              >
                <span className="text-3xl mb-2">📊</span>
                <span className="text-sm font-medium text-center">Niveles</span>
              </Label>
            </div>
          </RadioGroup>

          <form onSubmit={handleSubmit} className="space-y-6">
            {formType === "nuevo-lote" && (
              <>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-green-800">Nuevo Lote</h3>
                    <span className="text-lg font-bold text-green-700">{newLotNumber}</span>
                  </div>
                  {calculatedPlantingDate && (
                    <p className="text-sm text-green-600">
                      Fecha de siembra: <strong>{calculatedPlantingDate}</strong>
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="tipoLote" className="text-base">
                    Tipo de Lote
                  </Label>
                  <Select required onValueChange={handleLotTypeChange}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plantines-comprados" className="py-3">
                        🛒 Plantines Comprados → Sistema: Plantines Comprados
                      </SelectItem>
                      <SelectItem value="siembra" className="py-3">
                        🌱 Siembra → Sistema: Germinación
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedLotType === "plantines-comprados" && (
                  <div className="space-y-3">
                    <Label htmlFor="edad" className="text-base">
                      Edad de Plantines (días)
                    </Label>
                    <Input
                      id="edad"
                      type="number"
                      value={plantineAge}
                      onChange={(e) => setPlantineAge(Number(e.target.value))}
                      placeholder="25"
                      className="h-12 text-base"
                    />
                    <p className="text-sm text-muted-foreground">
                      La fecha de siembra se calculará restando estos días a la fecha actual
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="cantidad" className="text-base">
                    Cantidad
                  </Label>
                  <Input
                    id="cantidad"
                    name="cantidad"
                    type="number"
                    required
                    placeholder="Ej: 200"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="variedad" className="text-base">
                    Variedad
                  </Label>
                  <Input
                    id="variedad"
                    name="variedad"
                    required
                    key={selectedLotType}
                    defaultValue={
                      selectedLotType === "plantines-comprados"
                        ? "Pachi"
                        : selectedLotType === "siembra"
                          ? "Isabela"
                          : ""
                    }
                    placeholder={
                      selectedLotType === "plantines-comprados"
                        ? "Pachi"
                        : selectedLotType === "siembra"
                          ? "Isabela"
                          : "Variedad"
                    }
                    className="h-12 text-base"
                  />
                  <p className="text-sm text-muted-foreground">
                    Variedad por defecto:{" "}
                    {selectedLotType === "plantines-comprados"
                      ? "Pachi (plantines)"
                      : selectedLotType === "siembra"
                        ? "Isabela (germinación)"
                        : "Selecciona tipo primero"}
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="observaciones" className="text-base">
                    Observaciones
                  </Label>
                  <Textarea
                    id="observaciones"
                    name="observaciones"
                    placeholder="Observaciones opcionales..."
                    className="min-h-[100px] text-base"
                  />
                </div>
              </>
            )}

            {formType === "trasplante" && (
              <>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-800 mb-2">Trasplante entre Sistemas</h3>
                  <p className="text-sm text-blue-600">
                    Mueve plantas de un sistema a otro. Si es trasplante parcial, se creará un sub-lote automáticamente.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="loteOrigen" className="text-base">
                    Lote a Trasplantar
                  </Label>
                  <Select required onValueChange={setSelectedLot}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Selecciona un lote" />
                    </SelectTrigger>
                    <SelectContent>
                      {getActiveLots().map((lot) => (
                        <SelectItem key={lot.id} value={lot.id} className="py-3">
                          {lot.loteNum} - {lot.variedad} ({lot.cantidadActual} plantas) - {lot.sistema}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedLot && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-base">
                      <strong>Sistema actual:</strong> {getSelectedLotSystem()}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="sistemaDestino" className="text-base">
                    Sistema Destino
                  </Label>
                  <Select name="sistemaDestino" required>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Hacia..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SISTEMAS.filter((sistema) => sistema !== getSelectedLotSystem()).map((sistema) => (
                        <SelectItem key={sistema} value={sistema} className="py-3">
                          {sistema}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="cantidadTrasplante" className="text-base">
                    Cantidad a Trasplantar
                  </Label>
                  <Input
                    id="cantidadTrasplante"
                    name="cantidadTrasplante"
                    type="number"
                    required
                    placeholder="Ej: 50 (parcial) o 200 (total)"
                    className="h-12 text-base"
                  />
                  <p className="text-sm text-muted-foreground">
                    Si es menor a la cantidad total, se creará un sub-lote automáticamente
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="observaciones" className="text-base">
                    Observaciones
                  </Label>
                  <Textarea
                    id="observaciones"
                    name="observaciones"
                    placeholder="Detalles del trasplante..."
                    className="min-h-[100px] text-base"
                  />
                </div>
              </>
            )}

            {formType === "cosecha" && (
              <>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h3 className="font-medium text-amber-800 mb-2">Registro de Cosecha</h3>
                  <p className="text-sm text-amber-600">Registra la cosecha de plantas y sus pesos correspondientes.</p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="lote" className="text-base">
                    Lote
                  </Label>
                  <Select name="lote" required>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Selecciona un lote" />
                    </SelectTrigger>
                    <SelectContent>
                      {getActiveLots().map((lot) => (
                        <SelectItem key={lot.id} value={lot.id} className="py-3">
                          {lot.loteNum} - {lot.variedad} ({lot.cantidadActual} plantas)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="cantidad" className="text-base">
                    Cantidad Cosechada
                  </Label>
                  <Input
                    id="cantidad"
                    name="cantidad"
                    type="number"
                    required
                    placeholder="Ej: 25"
                    className="h-12 text-base"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="pesoConRaiz" className="text-base">
                      Peso con Raíz (g)
                    </Label>
                    <Input
                      id="pesoConRaiz"
                      name="pesoConRaiz"
                      type="number"
                      step="0.01"
                      placeholder="Ej: 95.5"
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="pesoSinRaiz" className="text-base">
                      Peso sin Raíz (g)
                    </Label>
                    <Input
                      id="pesoSinRaiz"
                      name="pesoSinRaiz"
                      type="number"
                      step="0.01"
                      placeholder="Ej: 85.2"
                      className="h-12 text-base"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="observaciones" className="text-base">
                    Observaciones
                  </Label>
                  <Textarea
                    id="observaciones"
                    name="observaciones"
                    placeholder="Calidad, estado de las plantas..."
                    className="min-h-[100px] text-base"
                  />
                </div>
              </>
            )}

            {formType === "mortandad" && (
              <>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="font-medium text-red-800 mb-2">Registro de Mortandad</h3>
                  <p className="text-sm text-red-600">Registra plantas muertas que deben ser retiradas del lote.</p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="lote" className="text-base">
                    Lote
                  </Label>
                  <Select name="lote" required>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Selecciona un lote" />
                    </SelectTrigger>
                    <SelectContent>
                      {getActiveLots().map((lot) => (
                        <SelectItem key={lot.id} value={lot.id} className="py-3">
                          {lot.loteNum} - {lot.variedad} ({lot.cantidadActual} plantas)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="cantidad" className="text-base">
                    Cantidad de Plantas Muertas
                  </Label>
                  <Input
                    id="cantidad"
                    name="cantidad"
                    type="number"
                    required
                    placeholder="Ej: 5"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="observaciones" className="text-base">
                    Observaciones
                  </Label>
                  <Textarea
                    id="observaciones"
                    name="observaciones"
                    placeholder="Causa de la mortandad, estado de las plantas..."
                    className="min-h-[100px] text-base"
                  />
                </div>
              </>
            )}

            {formType === "evolucion" && (
              <>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h3 className="font-medium text-indigo-800 mb-2">Evolución del Cultivo</h3>
                  <p className="text-sm text-indigo-600">Documenta el progreso del cultivo con fotos y anotaciones.</p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="lote" className="text-base">
                    Lote
                  </Label>
                  <Select name="lote" required>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Selecciona un lote" />
                    </SelectTrigger>
                    <SelectContent>
                      {getActiveLots().map((lot) => (
                        <SelectItem key={lot.id} value={lot.id} className="py-3">
                          {lot.loteNum} - {lot.variedad} ({lot.cantidadActual} plantas)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base">Fotos del Cultivo</Label>
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      capture="environment"
                      onChange={handleImageCapture}
                      className="hidden"
                    />
                    <div className="grid grid-cols-1 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 h-14 text-base"
                      >
                        <Camera className="h-5 w-5" />
                        Tomar Foto con Cámara
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.removeAttribute("capture")
                            fileInputRef.current.click()
                          }
                        }}
                        className="flex items-center gap-2 h-14 text-base"
                      >
                        <Upload className="h-5 w-5" />
                        Subir desde Galería
                      </Button>
                    </div>
                  </div>

                  {capturedImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {capturedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Captura ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 h-8 w-8 p-0"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="observaciones" className="text-base">
                    Anotaciones
                  </Label>
                  <Textarea
                    id="observaciones"
                    name="observaciones"
                    placeholder="Describe el estado del cultivo, cambios observados, condiciones ambientales..."
                    rows={4}
                    className="min-h-[120px] text-base"
                  />
                </div>
              </>
            )}

            {formType === "niveles" && (
              <>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-medium text-purple-800 mb-2">Registro de Niveles por Sistema</h3>
                  <p className="text-sm text-purple-600">
                    Cada sistema tiene sus propios niveles. Especifica para qué sistema son estos datos.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="sistemaNiveles" className="text-base">
                    Sistema
                  </Label>
                  <Select name="sistemaNiveles" required>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Selecciona el sistema" />
                    </SelectTrigger>
                    <SelectContent>
                      {SISTEMAS.map((sistema) => (
                        <SelectItem key={sistema} value={sistema} className="py-3">
                          {sistema}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="ph" className="text-base">
                      pH Promedio
                    </Label>
                    <Input
                      id="ph"
                      name="ph"
                      type="number"
                      step="0.1"
                      required
                      placeholder="Ej: 6.2"
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="conductividad" className="text-base">
                      Conductividad
                    </Label>
                    <Input
                      id="conductividad"
                      name="conductividad"
                      type="number"
                      step="0.1"
                      required
                      placeholder="Ej: 1.8"
                      className="h-12 text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="temperatura" className="text-base">
                      Temperatura (°C)
                    </Label>
                    <Input
                      id="temperatura"
                      name="temperatura"
                      type="number"
                      step="0.1"
                      required
                      placeholder="Ej: 22.5"
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="bateria" className="text-base">
                      Batería (%)
                    </Label>
                    <Input
                      id="bateria"
                      name="bateria"
                      type="number"
                      step="0.1"
                      placeholder="Ej: 85.2"
                      className="h-12 text-base"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="observaciones" className="text-base">
                    Observaciones
                  </Label>
                  <Textarea
                    id="observaciones"
                    name="observaciones"
                    placeholder="Estado del sistema, anomalías..."
                    className="min-h-[100px] text-base"
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full h-14 text-lg" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Registro"}
            </Button>

            {success && (
              <div className="bg-green-100 text-green-800 p-4 rounded text-center">
                ✅ Registro guardado correctamente
                {formType === "nuevo-lote" && (
                  <div className="text-sm mt-1">
                    Lote <strong>{newLotNumber}</strong> creado exitosamente
                  </div>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

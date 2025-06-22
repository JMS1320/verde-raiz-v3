export interface Lot {
  id: string
  loteNum: string // "Ene-01", "Jun-01-A"
  fechaSiembra: string
  cantidadInicial: number
  cantidadActual: number
  estado: string
  variedad: string
  sistema: string
  totalCosechado: number
  totalMortandad: number
  pesoPromedio: number | null
  conRaiz: boolean
  // Nuevos campos para el flujo mejorado
  loteOrigen?: string // ID del lote del cual proviene (para sub-lotes)
  historialSistemas: Array<{
    sistema: string
    fechaIngreso: string
    fechaSalida?: string
  }>
  creadoPor?: string // Nombre del usuario que creó el lote
}

export interface Activity {
  id: string
  lote_id: string
  fecha: string
  hora: string
  labor: string
  cantidad: number | null
  variedad: string | null
  observaciones: string | null
  pesoTestigoConRaiz: number | null
  pesoTestigoSinRaiz: number | null
  pesoLoteConRaiz: number | null
  pesoLoteSinRaiz: number | null
  pesoPlantaConRaiz: number | null
  pesoPlantaSinRaiz: number | null
  // Nuevos campos para trasplantes
  sistemaOrigen?: string
  sistemaDestino?: string
  // Nuevo campo para imágenes (evolución del cultivo)
  imagenes?: string[] // Array de imágenes en base64
  creadoPor?: string // Nombre del usuario que registró la actividad
}

export interface Nivel {
  id: string
  fecha: string
  hora: string
  sistema: string // Especifica para qué sistema son los niveles
  ph_promedio: number | null
  conductividad_promedio: number | null
  temperatura_promedio: number | null
  bateria: number | null
  observaciones: string | null
  creadoPor?: string // Nombre del usuario que registró el nivel
}

// Sistemas disponibles
export const SISTEMAS = ["Plantines Comprados", "Germinacion", "Raiz Flotante", "Cama de Arena"] as const

export type Sistema = (typeof SISTEMAS)[number]

// Función para generar el próximo número de lote basado en fecha de siembra
export function generateNextLotNumber(fechaSiembra: string, existingLots: Lot[]): string {
  const siembraDate = new Date(fechaSiembra)
  const monthNames = ["Ene", "Feb", "Mzo", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const monthPrefix = monthNames[siembraDate.getMonth()]

  // Buscar lotes activos del mismo mes y año (incluyendo sub-lotes)
  const samePeriodLots = existingLots.filter((lot) => {
    const lotDate = new Date(lot.fechaSiembra)
    return (
      lot.estado === "Activo" &&
      lotDate.getMonth() === siembraDate.getMonth() &&
      lotDate.getFullYear() === siembraDate.getFullYear() &&
      lot.loteNum.startsWith(monthPrefix) && // Buscar por prefijo
      !lot.loteNum.includes("-", lot.loteNum.indexOf("-") + 1) // Solo lotes principales, no sub-lotes (que tienen doble guión)
    )
  })

  // Extraer números existentes y encontrar el próximo
  const existingNumbers = samePeriodLots
    .map((lot) => {
      const match = lot.loteNum.match(new RegExp(`${monthPrefix}-(\\d+)`))
      return match ? Number.parseInt(match[1], 10) : 0
    })
    .filter((num) => num > 0)

  // Encontrar el próximo número disponible
  let nextNumber = 1
  while (existingNumbers.includes(nextNumber)) {
    nextNumber++
  }

  return `${monthPrefix}-${nextNumber.toString().padStart(2, "0")}`
}

// Función para generar sub-lote
export function generateSubLotNumber(originalLotNumber: string, existingLots: Lot[]): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let letterIndex = 0

  // Buscar la próxima letra disponible
  while (existingLots.some((lot) => lot.loteNum === `${originalLotNumber}-${letters[letterIndex]}`)) {
    letterIndex++
  }

  return `${originalLotNumber}-${letters[letterIndex]}`
}

// Función para calcular fecha de siembra basada en edad de plantines
export function calculatePlantingDate(ageInDays: number): string {
  const today = new Date()
  const plantingDate = new Date(today.getTime() - ageInDays * 24 * 60 * 60 * 1000)
  return plantingDate.toISOString().split("T")[0]
}

// Datos iniciales vacíos - para que puedas llenar con datos reales
export const mockLots: Lot[] = []

export const mockNiveles: Nivel[] = []

export const mockActivities: Activity[] = []

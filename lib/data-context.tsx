"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Lot, Activity, Nivel } from "./mock-data"

interface User {
  name: string
  pin: string
}

interface SyncStatus {
  status: "idle" | "saving" | "syncing" | "synced" | "error" | "offline"
  message: string
  lastSync?: string
}

interface DataContextType {
  // Datos
  lots: Lot[]
  activities: Activity[]
  niveles: Nivel[]

  // Acciones de datos
  addLot: (lot: Lot) => Promise<void>
  addActivity: (activity: Activity) => Promise<void>
  addNivel: (nivel: Nivel) => Promise<void>
  updateLot: (lotId: string, updates: Partial<Lot>) => Promise<void>
  clearAllData: () => void

  // Usuario
  currentUser: User | null
  login: (user: User) => void
  logout: () => void

  // Estado de sincronización
  syncStatus: SyncStatus
  isOnline: boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Claves para LocalStorage
const STORAGE_KEYS = {
  lots: "verde-raiz-lots",
  activities: "verde-raiz-activities",
  niveles: "verde-raiz-niveles",
  user: "verde-raiz-user",
  pendingSync: "verde-raiz-pending-sync",
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [lots, setLots] = useState<Lot[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [niveles, setNiveles] = useState<Nivel[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: "idle",
    message: "Listo",
  })

  // Detectar conexión
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
      if (navigator.onLine) {
        setSyncStatus({ status: "syncing", message: "Sincronizando..." })
        // Aquí iría la lógica de sincronización
        setTimeout(() => {
          setSyncStatus({
            status: "synced",
            message: "Sincronizado",
            lastSync: new Date().toLocaleTimeString(),
          })
        }, 2000)
      } else {
        setSyncStatus({ status: "offline", message: "Sin conexión" })
      }
    }

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)
    updateOnlineStatus()

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  // Cargar datos desde LocalStorage al inicializar
  useEffect(() => {
    try {
      const savedLots = localStorage.getItem(STORAGE_KEYS.lots)
      const savedActivities = localStorage.getItem(STORAGE_KEYS.activities)
      const savedNiveles = localStorage.getItem(STORAGE_KEYS.niveles)
      const savedUser = localStorage.getItem(STORAGE_KEYS.user)

      if (savedLots) setLots(JSON.parse(savedLots))
      if (savedActivities) setActivities(JSON.parse(savedActivities))
      if (savedNiveles) setNiveles(JSON.parse(savedNiveles))
      if (savedUser) setCurrentUser(JSON.parse(savedUser))
    } catch (error) {
      console.error("Error cargando datos desde LocalStorage:", error)
    }
    setIsLoaded(true)
  }, [])

  // Guardar datos en LocalStorage cuando cambien
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.lots, JSON.stringify(lots))
    }
  }, [lots, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(activities))
    }
  }, [activities, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.niveles, JSON.stringify(niveles))
    }
  }, [niveles, isLoaded])

  // Función para simular guardado con estados visuales
  const simulateSaveWithSync = async (saveAction: () => void, itemType: string) => {
    setSyncStatus({ status: "saving", message: `Guardando ${itemType}...` })

    // Guardar localmente primero
    saveAction()

    await new Promise((resolve) => setTimeout(resolve, 800))

    if (isOnline) {
      setSyncStatus({ status: "syncing", message: "Sincronizando..." })
      await new Promise((resolve) => setTimeout(resolve, 1200))
      setSyncStatus({
        status: "synced",
        message: "Guardado y sincronizado",
        lastSync: new Date().toLocaleTimeString(),
      })
    } else {
      setSyncStatus({ status: "offline", message: "Guardado localmente - Sin conexión" })
    }

    // Volver a idle después de 3 segundos
    setTimeout(() => {
      setSyncStatus({ status: "idle", message: "Listo" })
    }, 3000)
  }

  const addLot = async (lot: Lot) => {
    const lotWithUser = { ...lot, creadoPor: currentUser?.name || "Usuario desconocido" }
    await simulateSaveWithSync(() => {
      setLots((prev) => [...prev, lotWithUser])
    }, "lote")
  }

  const addActivity = async (activity: Activity) => {
    const activityWithUser = { ...activity, creadoPor: currentUser?.name || "Usuario desconocido" }
    await simulateSaveWithSync(() => {
      setActivities((prev) => [...prev, activityWithUser])
    }, "actividad")
  }

  const addNivel = async (nivel: Nivel) => {
    const nivelWithUser = { ...nivel, creadoPor: currentUser?.name || "Usuario desconocido" }
    await simulateSaveWithSync(() => {
      setNiveles((prev) => [...prev, nivelWithUser])
    }, "nivel")
  }

  const updateLot = async (lotId: string, updates: Partial<Lot>) => {
    await simulateSaveWithSync(() => {
      setLots((prev) => prev.map((lot) => (lot.id === lotId ? { ...lot, ...updates } : lot)))
    }, "lote")
  }

  const login = (user: User) => {
    setCurrentUser(user)
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem(STORAGE_KEYS.user)
  }

  const clearAllData = () => {
    setLots([])
    setActivities([])
    setNiveles([])
    Object.values(STORAGE_KEYS).forEach((key) => {
      if (key !== STORAGE_KEYS.user) {
        localStorage.removeItem(key)
      }
    })
  }

  return (
    <DataContext.Provider
      value={{
        lots,
        activities,
        niveles,
        addLot,
        addActivity,
        addNivel,
        updateLot,
        clearAllData,
        currentUser,
        login,
        logout,
        syncStatus,
        isOnline,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

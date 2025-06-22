"use client"

import { Wifi, WifiOff, Check, Loader2, AlertCircle, Clock } from "lucide-react"
import { useData } from "@/lib/data-context"

export default function SyncStatus() {
  const { syncStatus, isOnline } = useData()

  const getStatusIcon = () => {
    switch (syncStatus.status) {
      case "saving":
      case "syncing":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "synced":
        return <Check className="h-4 w-4" />
      case "error":
        return <AlertCircle className="h-4 w-4" />
      case "offline":
        return <WifiOff className="h-4 w-4" />
      default:
        return isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />
    }
  }

  const getStatusColor = () => {
    switch (syncStatus.status) {
      case "saving":
      case "syncing":
        return "text-blue-600 bg-blue-50"
      case "synced":
        return "text-green-600 bg-green-50"
      case "error":
        return "text-red-600 bg-red-50"
      case "offline":
        return "text-orange-600 bg-orange-50"
      default:
        return isOnline ? "text-green-600 bg-green-50" : "text-gray-600 bg-gray-50"
    }
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm ${getStatusColor()}`}>
      {getStatusIcon()}
      <span className="font-medium">{syncStatus.message}</span>
      {syncStatus.lastSync && (
        <span className="text-xs opacity-75 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {syncStatus.lastSync}
        </span>
      )}
    </div>
  )
}

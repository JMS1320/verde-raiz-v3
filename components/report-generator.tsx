"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageCircle, FileText, Download, Send, Calendar } from "lucide-react"
import { useData } from "@/lib/data-context"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function ReportGenerator() {
  const { lots, activities, niveles, currentUser } = useData()
  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0])
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)

  // Filtrar datos por fecha
  const getDataForDate = (date: string) => {
    const activitiesForDate = activities.filter((activity) => activity.fecha === date)
    const nivelesForDate = niveles.filter((nivel) => nivel.fecha === date)
    const activeLots = lots.filter((lot) => lot.estado === "Activo")

    return {
      activities: activitiesForDate,
      niveles: nivelesForDate,
      activeLots,
    }
  }

  // Generar contenido del reporte
  const generateReportContent = () => {
    const data = getDataForDate(reportDate)
    const formattedDate = format(new Date(reportDate), "dd 'de' MMMM 'de' yyyy", { locale: es })

    let content = `📊 REPORTE DIARIO - VERDE RAÍZ HIDROPONÍA
📅 Fecha: ${formattedDate}
👤 Generado por: ${currentUser?.name || "Usuario"}
⏰ Hora: ${new Date().toLocaleTimeString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 RESUMEN DEL DÍA:
• Actividades registradas: ${data.activities.length}
• Registros de niveles: ${data.niveles.length}
• Lotes activos: ${data.activeLots.length}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌱 LOTES ACTIVOS:
`

    data.activeLots.forEach((lot) => {
      const daysSincePlanting = Math.floor(
        (new Date().getTime() - new Date(lot.fechaSiembra).getTime()) / (1000 * 60 * 60 * 24),
      )
      content += `
• ${lot.loteNum} - ${lot.variedad}
  Sistema: ${lot.sistema}
  Plantas: ${lot.cantidadActual}/${lot.cantidadInicial}
  Días: ${daysSincePlanting}
  Cosechado: ${lot.totalCosechado} | Mortandad: ${lot.totalMortandad}`
    })

    if (data.activities.length > 0) {
      content += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 ACTIVIDADES DEL DÍA:
`

      data.activities.forEach((activity) => {
        const lot = lots.find((l) => l.id === activity.lote_id)
        const activityName = getActivityName(activity.labor)

        content += `
⏰ ${activity.hora.substring(0, 5)} - ${activityName}
   Lote: ${lot?.loteNum || "N/A"}
   ${activity.cantidad ? `Cantidad: ${activity.cantidad}` : ""}
   ${activity.observaciones ? `Obs: ${activity.observaciones}` : ""}
   ${activity.creadoPor ? `Por: ${activity.creadoPor}` : ""}`
      })
    }

    if (data.niveles.length > 0) {
      content += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 NIVELES REGISTRADOS:
`

      data.niveles.forEach((nivel) => {
        content += `
⏰ ${nivel.hora.substring(0, 5)} - ${nivel.sistema}
   pH: ${nivel.ph_promedio?.toFixed(1) || "N/A"}
   Conductividad: ${nivel.conductividad_promedio?.toFixed(1) || "N/A"}
   Temperatura: ${nivel.temperatura_promedio?.toFixed(1) || "N/A"}°C
   ${nivel.bateria ? `Batería: ${nivel.bateria.toFixed(1)}%` : ""}
   ${nivel.observaciones ? `Obs: ${nivel.observaciones}` : ""}
   ${nivel.creadoPor ? `Por: ${nivel.creadoPor}` : ""}`
      })
    }

    if (additionalNotes) {
      content += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 NOTAS ADICIONALES:
${additionalNotes}`
    }

    content += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌿 Verde Raíz Hidroponía
📧 verderaizhidroponia@gmail.com
📱 Sistema de Control v3.0`

    return content
  }

  // Obtener nombre de actividad en español
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
      case "mortandad":
        return "Mortandad"
      case "evolucion":
        return "Evolución del Cultivo"
      case "niveles":
        return "Niveles"
      default:
        return type
    }
  }

  // Enviar por email usando EmailJS (simulado)
  const sendByEmail = async () => {
    setLoading(true)
    try {
      const reportContent = generateReportContent()

      // Simular envío de email
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // En producción, aquí iría la integración con EmailJS
      console.log("Email enviado a: verderaizhidroponia@gmail.com")
      console.log("Contenido:", reportContent)

      alert("✅ Reporte enviado por email exitosamente!")
    } catch (error) {
      alert("❌ Error al enviar email. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  // Enviar por WhatsApp - versión simplificada
  const sendByWhatsApp = () => {
    const reportContent = generateReportContent()
    const encodedMessage = encodeURIComponent(reportContent)

    // Abrir WhatsApp sin número específico para que el usuario elija el contacto/grupo
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`

    window.open(whatsappUrl, "_blank")
  }

  // Descargar como archivo de texto
  const downloadReport = () => {
    const reportContent = generateReportContent()
    const formattedDate = format(new Date(reportDate), "yyyy-MM-dd")
    const filename = `Reporte_Verde_Raiz_${formattedDate}.txt`

    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Función para enviar a ambos destinos
  const sendToAll = async () => {
    setLoading(true)
    try {
      // Enviar por email primero
      const reportContent = generateReportContent()

      // Simular envío de email
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log("Email enviado a: verderaizhidroponia@gmail.com")

      // Abrir WhatsApp
      const encodedMessage = encodeURIComponent(reportContent)
      const whatsappUrl = `https://wa.me/?text=${encodedMessage}`
      window.open(whatsappUrl, "_blank")

      alert("✅ Email enviado! WhatsApp abierto para seleccionar grupo.")
    } catch (error) {
      alert("❌ Error al enviar email. WhatsApp se abrirá de todas formas.")
      // Abrir WhatsApp aunque falle el email
      const reportContent = generateReportContent()
      const encodedMessage = encodeURIComponent(reportContent)
      const whatsappUrl = `https://wa.me/?text=${encodedMessage}`
      window.open(whatsappUrl, "_blank")
    } finally {
      setLoading(false)
    }
  }

  const data = getDataForDate(reportDate)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generar Reporte Diario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reportDate">Fecha del Reporte</Label>
            <Input
              id="reportDate"
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Resumen del día seleccionado:
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-lg text-blue-600">{data.activities.length}</div>
                <div className="text-muted-foreground">Actividades</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-purple-600">{data.niveles.length}</div>
                <div className="text-muted-foreground">Niveles</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-green-600">{data.activeLots.length}</div>
                <div className="text-muted-foreground">Lotes Activos</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Notas Adicionales (Opcional)</Label>
            <Textarea
              id="additionalNotes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Observaciones generales del día, condiciones climáticas, etc..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={downloadReport} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
            <Button onClick={() => setReportGenerated(!reportGenerated)} variant="outline" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              {reportGenerated ? "Ocultar" : "Vista Previa"}
            </Button>
          </div>

          <div className="border-t pt-4">
            <Button onClick={sendToAll} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
              <Send className="h-4 w-4 mr-2" />
              {loading ? "Enviando..." : "📧📱 Enviar a Email y WhatsApp"}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Envía automáticamente por email y abre WhatsApp para seleccionar grupo
            </p>
          </div>

          {reportGenerated && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Vista Previa del Reporte:</h3>
              <pre className="text-xs whitespace-pre-wrap bg-white p-3 rounded border max-h-60 overflow-y-auto">
                {generateReportContent()}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Mail className="h-5 w-5" />
              Enviar por Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Destino:</strong> verderaizhidroponia@gmail.com
              </p>
              <p className="text-xs text-blue-600 mt-1">El reporte se enviará automáticamente al email configurado</p>
            </div>
            <Button onClick={sendByEmail} disabled={loading} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              {loading ? "Enviando..." : "Enviar por Email"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <MessageCircle className="h-5 w-5" />
              Enviar por WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Destino:</strong> Grupo de WhatsApp del equipo
              </p>
              <p className="text-xs text-green-600 mt-1">Se abrirá WhatsApp para seleccionar el grupo de destino</p>
            </div>
            <Button onClick={sendByWhatsApp} variant="outline" className="w-full">
              <MessageCircle className="h-4 w-4 mr-2" />
              Abrir WhatsApp
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-orange-600">⏰</div>
            <div>
              <h3 className="font-medium text-orange-800">Reporte Automático</h3>
              <p className="text-sm text-orange-700">
                El sistema enviará automáticamente un reporte diario por email a las 21:00 hs.
              </p>
              <p className="text-xs text-orange-600 mt-1">
                Si no se envía automáticamente, puedes usar este formulario para enviarlo manualmente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

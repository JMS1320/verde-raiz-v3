import './globals.css'

export const metadata = {
  title: 'Verde Raíz v3.0',
  description: 'Control de Producción Hidropónica',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}

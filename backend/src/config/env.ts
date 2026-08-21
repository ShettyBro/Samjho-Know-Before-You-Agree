import 'dotenv/config'

function readCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS
  if (!raw) return ['http://localhost:5173']
  return raw.split(',').map((origin) => origin.trim()).filter(Boolean)
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  corsOrigins: readCorsOrigins(),
}

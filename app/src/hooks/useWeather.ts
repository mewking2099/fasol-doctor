import { useState, useEffect } from 'react'

export interface WeatherData {
  tempC: number
  humidity: number
  windKmh: number
  code: number
  conditionBn: string
  riskLevel: 'high' | 'medium' | 'low'
  riskLabelBn: string
}

const CACHE_KEY = 'weather_cache'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

function wmoToBn(code: number): string {
  if (code === 0) return 'পরিষ্কার আকাশ'
  if (code <= 2) return 'আংশিক মেঘলা'
  if (code === 3) return 'মেঘাচ্ছন্ন'
  if (code <= 48) return 'কুয়াশা'
  if (code <= 57) return 'হালকা গুঁড়ি বৃষ্টি'
  if (code <= 67) return 'বৃষ্টি'
  if (code <= 77) return 'তুষারপাত'
  if (code <= 82) return 'বৃষ্টিপাত'
  return 'বজ্রবৃষ্টি'
}

function diseaseRisk(tempC: number, humidity: number): WeatherData['riskLevel'] {
  // Leaf blast thrives: humid (>80%) + warm (20-30°C)
  if (humidity >= 80 && tempC >= 20 && tempC <= 32) return 'high'
  if (humidity >= 65 && tempC >= 18 && tempC <= 35) return 'medium'
  return 'low'
}

function riskLabelBn(level: WeatherData['riskLevel']): string {
  if (level === 'high') return 'রোগের ঝুঁকি'
  if (level === 'medium') return 'মাঝারি ঝুঁকি'
  return 'কম ঝুঁকি'
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&wind_speed_unit=kmh&timezone=auto`
  const res = await fetch(url)
  if (!res.ok) throw new Error('weather fetch failed')
  const json = await res.json()
  const c = json.current
  const tempC = Math.round(c.temperature_2m)
  const humidity = Math.round(c.relative_humidity_2m)
  const windKmh = Math.round(c.wind_speed_10m)
  const code = c.weather_code
  const level = diseaseRisk(tempC, humidity)
  return {
    tempC,
    humidity,
    windKmh,
    code,
    conditionBn: wmoToBn(code),
    riskLevel: level,
    riskLabelBn: riskLabelBn(level),
  }
}

function readCache(): WeatherData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL_MS) return null
    return data as WeatherData
  } catch {
    return null
  }
}

function writeCache(data: WeatherData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }))
  } catch { /* storage full */ }
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(readCache)
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const onOnline = () => setOffline(false)
    const onOffline = () => setOffline(true)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    if (!navigator.onLine) return

    const cached = readCache()
    if (cached) { setWeather(cached); return }

    // Try geolocation; fallback to Dhaka if denied
    const doFetch = (lat: number, lon: number) => {
      fetchWeather(lat, lon).then(w => {
        setWeather(w)
        writeCache(w)
      }).catch(() => { /* stay hidden */ })
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => doFetch(pos.coords.latitude, pos.coords.longitude),
        () => doFetch(23.81, 90.41), // Dhaka fallback
        { timeout: 5000 }
      )
    } else {
      doFetch(23.81, 90.41)
    }
  }, [offline])

  return { weather, offline }
}

"use client"

import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { Train } from "lucide-react"
import type { TrainPosition } from "@/lib/train-utils"

interface TrainMapProps {
  trainPositions: TrainPosition[]
  onStationClick: (station: string) => void
  selectedStation: string | null
}

// Ajustar a função generateCircularStations para melhor distribuição das estações
const generateCircularStations = () => {
  const stations = [
    "C. Benevides",
    "Jereissati",
    "Maracanaú",
    "V. Távora",
    "R. Queiroz",
    "A. Alegre",
    "Aracapé",
    "Esperança",
    "Mondubim",
    "M. Sátiro",
    "V. Pery",
    "Parangaba",
    "J. kubitschek",
    "C. Fernandes",
    "Porangabussu",
    "Pe. Cícero",
    "Benfica",
    "S. Benedito",
    "J. Alencar",
    "C. da Silva",
  ]

  const positions = []
  const centerX = 50
  const centerY = 50

  // Usar uma elipse em vez de círculo para melhor distribuição
  const radiusX = 42
  const radiusY = 38

  // Distribuir as estações em uma elipse completa
  for (let i = 0; i < stations.length; i++) {
    // Calcular ângulo para distribuição uniforme (sentido horário)
    const angle = 2 * Math.PI * (i / stations.length)
    // Ajustar para começar do topo e ir no sentido horário
    const x = centerX + radiusX * Math.sin(angle)
    const y = centerY - radiusY * Math.cos(angle)
    positions.push({ name: stations[i], x, y })
  }

  return positions
}

const stationPositions = generateCircularStations()

// Define colors for each train
const trainColors = [
  { bg: "bg-green-600", border: "border-green-700", shadow: "shadow-green-300" },
  { bg: "bg-blue-500", border: "border-blue-600", shadow: "shadow-blue-300" },
  { bg: "bg-yellow-500", border: "border-yellow-600", shadow: "shadow-yellow-300" },
  { bg: "bg-purple-500", border: "border-purple-600", shadow: "shadow-purple-300" },
  { bg: "bg-red-500", border: "border-red-600", shadow: "shadow-red-300" },
]

export default function TrainMap({ trainPositions, onStationClick, selectedStation }: TrainMapProps) {
  const [mapWidth, setMapWidth] = useState(1000)
  const [mapHeight, setMapHeight] = useState(600)
  const [isMobile, setIsMobile] = useState(false)
  const [scale, setScale] = useState(1)
  const [lastPinchDistance, setLastPinchDistance] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Update map dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      const width = Math.min(window.innerWidth - 24, 1000)
      setMapWidth(width)
      setMapHeight(width * 0.7) // Increased height ratio for better mobile view
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Scale station positions to map dimensions
  const scaleX = (x: number) => (x / 100) * mapWidth
  const scaleY = (y: number) => (y / 100) * mapHeight

  // Gestos de pinça para zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      setLastPinchDistance(distance)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastPinchDistance !== null) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      
      const newScale = scale * (currentDistance / lastPinchDistance)
      setScale(Math.min(Math.max(newScale, 0.5), 3)) // Limitar zoom entre 0.5x e 3x
      setLastPinchDistance(currentDistance)
    }
  }

  const handleTouchEnd = () => {
    setLastPinchDistance(null)
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-lg md:text-xl font-semibold text-green-800 mb-2 text-center">Mapa da Linha Sul</h2>

      <div
        ref={containerRef}
        className="relative bg-gradient-to-br from-green-100 to-green-50 rounded-xl border-2 border-green-300 overflow-hidden shadow-lg"
        style={{ width: "100%", height: mapHeight }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.1s ease-out',
            width: '100%',
            height: '100%'
          }}
        >
          {/* Draw track lines */}
          <svg className="absolute inset-0 w-full h-full">
            <path
              d={stationPositions
                .map((station, i) => `${i === 0 ? "M" : "L"} ${scaleX(station.x)} ${scaleY(station.y)}`)
                .join(" ")}
              stroke="#10b981"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              className="opacity-50"
            />
            <path
              d={stationPositions
                .map((station, i) => `${i === 0 ? "M" : "L"} ${scaleX(station.x)} ${scaleY(station.y)}`)
                .join(" ")}
              stroke="#34d399"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>

          {/* Render stations */}
          {stationPositions.map((station, index) => {
            // Determine station size based on device
            const stationSize = isMobile ? 18 : 24
            const selectedStationSize = isMobile ? 22 : 28

            // Calcular a posição do rótulo em relação ao centro do mapa
            const centerX = 50
            const centerY = 50

            // Calcular o ângulo da estação em relação ao centro
            const dx = station.x - centerX
            const dy = station.y - centerY
            const angle = Math.atan2(dy, dx)

            // Determinar a posição do rótulo com base no ângulo
            const labelDistance = selectedStation === station.name ? 14 : 12
            const labelX = Math.cos(angle) * labelDistance
            const labelY = Math.sin(angle) * labelDistance

            // Determinar o alinhamento do texto com base no quadrante
            const isRight = Math.abs(angle) < Math.PI / 2
            const textAlign = isRight ? "left" : "right"
            const translateX = isRight ? "0" : "-100%"

            return (
              <motion.div
                key={station.name}
                className={`absolute rounded-full border-2 cursor-pointer transition-all duration-300 ${
                  selectedStation === station.name
                    ? "bg-green-200 border-green-600 z-20 shadow-lg"
                    : "bg-white border-green-400 hover:bg-green-100 shadow-md"
                }`}
                style={{
                  left:
                    scaleX(station.x) - (selectedStation === station.name ? selectedStationSize / 2 : stationSize / 2),
                  top: scaleY(station.y) - (selectedStation === station.name ? selectedStationSize / 2 : stationSize / 2),
                  width: selectedStation === station.name ? selectedStationSize : stationSize,
                  height: selectedStation === station.name ? selectedStationSize : stationSize,
                }}
                onClick={() => onStationClick(station.name)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className={`absolute whitespace-nowrap text-xs font-bold bg-white px-1.5 py-0.5 rounded-full shadow-sm border border-green-200 text-green-800 ${
                    isMobile ? "text-[10px]" : "text-xs"
                  }`}
                  style={{
                    left: `calc(50% + ${labelX}px)`,
                    top: `calc(50% + ${labelY}px)`,
                    transform: `translate(${translateX}, -50%)`,
                    textAlign: textAlign,
                  }}
                  initial={{ opacity: 0.7 }}
                  whileHover={{ opacity: 1 }}
                >
                  {station.name}
                </motion.div>
              </motion.div>
            )
          })}

          {/* Render trains */}
          {trainPositions.map((train, index) => {
            // Find the station positions for current and next station
            const currentStationIndex = stationPositions.findIndex((s) => s.name === train.currentStation)

            if (currentStationIndex === -1) return null

            const nextStationIndex =
              train.direction === "forward"
                ? (currentStationIndex + 1) % stationPositions.length
                : (currentStationIndex - 1 + stationPositions.length) % stationPositions.length

            const currentStation = stationPositions[currentStationIndex]
            const nextStation = stationPositions[nextStationIndex]

            // Calculate position along the path based on progress
            const x = currentStation.x + (nextStation.x - currentStation.x) * train.progress
            const y = currentStation.y + (nextStation.y - currentStation.y) * train.progress

            const trainColor = trainColors[index % trainColors.length]
            const trainSize = isMobile ? 28 : 36

            // Determine destination station based on direction
            const destination = train.direction === "forward" ? "C. da Silva" : "C. Benevides"

            return (
              <motion.div
                key={`train-${index}`}
                className={`absolute z-10 flex items-center justify-center rounded-lg ${trainColor.bg} ${trainColor.border} border-2 shadow-lg ${trainColor.shadow}`}
                style={{
                  left: scaleX(x) - trainSize / 2,
                  top: scaleY(y) - trainSize / 2,
                  width: trainSize,
                  height: trainSize,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
              >
                <Train className="text-white h-4 w-4 md:h-5 md:w-5 drop-shadow-md" />

                {/* Direction indicator - apenas a seta e o destino */}
                <div className={`absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center`}>
                  <div
                    className={`
                    w-0 h-0 
                    border-l-[6px] border-l-transparent 
                    border-r-[6px] border-r-transparent 
                    ${train.direction === "forward" ? "border-t-[8px] border-t-white" : "border-b-[8px] border-b-white"}
                  `}
                  ></div>
                  <span
                    className={`
                    text-[9px] md:text-[10px] font-bold bg-white px-1.5 py-0.5 rounded-full 
                    shadow-sm border border-green-200 text-green-800 mt-1 whitespace-nowrap
                  `}
                  >
                    → {destination}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
      <div className="mt-4 text-center text-sm text-gray-600 space-y-2">
        <p>
          Desenvolvido por{" "}
          <a
            href="https://github.com/viktormendes"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            @viktormendes
          </a>
        </p>
        <p>
          <a
            href="https://www.metrofor.ce.gov.br/horarios/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Confira os horários oficiais do metrô
          </a>
        </p>
      </div>
    </div>
  )
}


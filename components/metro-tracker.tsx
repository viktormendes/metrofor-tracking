"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, Calendar, RotateCcw } from "lucide-react"
import TrainMap from "./train-map"
import { formatTime, getTrainPositions } from "@/lib/train-utils"
import { scheduleData } from "@/lib/schedule-data"

export default function MetroTracker() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedStation, setSelectedStation] = useState<string | null>(null)
  const [trainPositions, setTrainPositions] = useState(getTrainPositions(new Date(), scheduleData))
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulatedHour, setSimulatedHour] = useState(new Date().getHours())
  const [simulatedMinute, setSimulatedMinute] = useState(new Date().getMinutes())

  // Update current time every second when not simulating
  useEffect(() => {
    if (!isSimulating) {
      const interval = setInterval(() => {
        const now = new Date()
        setCurrentTime(now)
        setTrainPositions(getTrainPositions(now, scheduleData))
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isSimulating])

  // Update train positions when simulated time changes
  useEffect(() => {
    if (isSimulating) {
      const simulatedDate = new Date()
      simulatedDate.setHours(simulatedHour)
      simulatedDate.setMinutes(simulatedMinute)
      setCurrentTime(simulatedDate)
      setTrainPositions(getTrainPositions(simulatedDate, scheduleData))
    }
  }, [isSimulating, simulatedHour, simulatedMinute])

  // Mover a legenda para cima do mapa e modificar a função getNextArrival para mostrar trens em ambos os sentidos

  // Modificar a função getNextArrival para retornar os próximos trens em ambos os sentidos
  const getNextArrivals = (stationName: string) => {
    if (!stationName) return { forward: null, backward: null }

    const currentHours = currentTime.getHours()
    const currentMinutes = currentTime.getMinutes()
    const currentTimeValue = currentHours * 60 + currentMinutes

    // Find next arrival for this station in both directions
    let nextForward = null
    let nextBackward = null
    let minForwardTimeDiff = Number.POSITIVE_INFINITY
    let minBackwardTimeDiff = Number.POSITIVE_INFINITY

    trainPositions.forEach((train) => {
      const schedule = train.schedule
      const direction = train.direction

      schedule.forEach((stop) => {
        if (stop.station === stationName) {
          const [hours, minutes] = stop.time.split(":").map(Number)
          const stopTimeValue = hours * 60 + minutes

          // Calculate time difference (considering wrap around at midnight)
          let timeDiff = stopTimeValue - currentTimeValue
          if (timeDiff < 0) timeDiff += 24 * 60

          if (timeDiff > 0) {
            if (direction === "forward" && timeDiff < minForwardTimeDiff) {
              minForwardTimeDiff = timeDiff
              nextForward = {
                time: stop.time,
                trainId: train.id,
                destination: "C. da Silva",
              }
            } else if (direction === "backward" && timeDiff < minBackwardTimeDiff) {
              minBackwardTimeDiff = timeDiff
              nextBackward = {
                time: stop.time,
                trainId: train.id,
                destination: "C. Benevides",
              }
            }
          }
        }
      })
    })

    return { forward: nextForward, backward: nextBackward }
  }

  // Reset to current time
  const resetToCurrentTime = () => {
    const now = new Date()
    setIsSimulating(false)
    setCurrentTime(now)
    setSimulatedHour(now.getHours())
    setSimulatedMinute(now.getMinutes())
    setTrainPositions(getTrainPositions(now, scheduleData))
  }

  // Apply simulated time
  const applySimulatedTime = () => {
    setIsSimulating(true)
    const simulatedDate = new Date()
    simulatedDate.setHours(simulatedHour)
    simulatedDate.setMinutes(simulatedMinute)
    setCurrentTime(simulatedDate)
    setTrainPositions(getTrainPositions(simulatedDate, scheduleData))
  }

  // Substituir o conteúdo do return para incluir a legenda acima do mapa e mostrar os próximos trens em ambos os sentidos
  return (
    <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-green-300">
      {/* Header with clock and time controls */}
      <div className="bg-gradient-to-r from-green-400 to-green-500 text-white p-3 md:p-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div className="flex items-center space-x-3">
            <Clock className="h-6 w-6 md:h-8 md:w-8 text-white drop-shadow-md" />
            <span className="text-xl md:text-2xl font-bold">{formatTime(currentTime)}</span>
            {isSimulating && (
              <span className="text-xs md:text-sm bg-yellow-400 text-yellow-800 px-2 py-1 rounded-full font-medium">
                Simulação
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <div className="flex items-center bg-white/20 rounded-lg p-2 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-center gap-2">
                <div className="flex items-center gap-1">
                  <label htmlFor="hour" className="text-xs md:text-sm font-medium">
                    Hora:
                  </label>
                  <select
                    id="hour"
                    value={simulatedHour}
                    onChange={(e) => setSimulatedHour(Number(e.target.value))}
                    className="bg-white text-green-800 rounded px-2 py-1 text-sm"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <label htmlFor="minute" className="text-xs md:text-sm font-medium">
                    Min:
                  </label>
                  <select
                    id="minute"
                    value={simulatedMinute}
                    onChange={(e) => setSimulatedMinute(Number(e.target.value))}
                    className="bg-white text-green-800 rounded px-2 py-1 text-sm"
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={applySimulatedTime}
                className="px-2 py-1 md:px-3 md:py-1 bg-white text-green-600 rounded-md font-medium text-sm md:text-base hover:bg-green-50 transition-colors flex items-center gap-1"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden md:inline">Simular</span>
              </button>

              <button
                onClick={resetToCurrentTime}
                className="px-2 py-1 md:px-3 md:py-1 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-md font-medium text-sm md:text-base hover:bg-white/20 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden md:inline">Atual</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-3 md:p-6 bg-gradient-to-b from-green-50 to-white">
        {/* Legenda acima do mapa */}
        <div className="mb-4 flex justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-lg">
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-green-600"></div>
            <span className="text-xs text-green-800 font-medium">Sentido C. da Silva</span>
          </div>
          <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-lg">
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-green-600"></div>
            <span className="text-xs text-green-800 font-medium">Sentido C. Benevides</span>
          </div>
        </div>

        {/* Train map visualization */}
        <TrainMap
          trainPositions={trainPositions}
          onStationClick={setSelectedStation}
          selectedStation={selectedStation}
        />

        {/* Station info panel */}
        {selectedStation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 md:mt-6 p-3 md:p-5 bg-green-100 rounded-xl border-2 border-green-300 shadow-md"
          >
            <h3 className="font-bold text-lg md:text-xl text-green-800 mb-3">Estação {selectedStation}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Próximo trem sentido C. da Silva */}
              <div className="bg-white p-3 rounded-lg shadow-sm border border-green-200">
                <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-green-600"></div>
                  Sentido C. da Silva
                </h4>

                {getNextArrivals(selectedStation).forward ? (
                  <p className="text-green-700 text-sm md:text-base">
                    Próximo trem: <span className="font-bold">{getNextArrivals(selectedStation).forward?.time}</span>
                  </p>
                ) : (
                  <p className="text-green-700 text-sm md:text-base">
                    Não há trens programados neste sentido no momento.
                  </p>
                )}
              </div>

              {/* Próximo trem sentido C. Benevides */}
              <div className="bg-white p-3 rounded-lg shadow-sm border border-green-200">
                <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-green-600"></div>
                  Sentido C. Benevides
                </h4>

                {getNextArrivals(selectedStation).backward ? (
                  <p className="text-green-700 text-sm md:text-base">
                    Próximo trem: <span className="font-bold">{getNextArrivals(selectedStation).backward?.time}</span>
                  </p>
                ) : (
                  <p className="text-green-700 text-sm md:text-base">
                    Não há trens programados neste sentido no momento.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}


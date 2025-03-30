export interface TrainPosition {
  id: number
  currentStation: string
  nextStation: string
  progress: number // 0 to 1, representing position between stations
  direction: "forward" | "backward"
  schedule: Array<{ station: string; time: string }>
}

export interface ScheduleEntry {
  station: string
  times: string[]
}

// Format time as HH:MM
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Calculate train positions based on current time and schedule
export function getTrainPositions(
  currentTime: Date,
  scheduleData: {
    forward: ScheduleEntry[]
    backward: ScheduleEntry[]
  },
): TrainPosition[] {
  const trainPositions: TrainPosition[] = []
  const currentHour = currentTime.getHours()
  const currentMinute = currentTime.getMinutes()
  const currentTimeValue = currentHour * 60 + currentMinute

  // Create 5 trains with different starting positions
  for (let i = 0; i < 5; i++) {
    // Determine direction and schedule for this train
    const direction = i % 2 === 0 ? "forward" : "backward"
    const schedule = direction === "forward" ? scheduleData.forward : scheduleData.backward

    // Create a full day schedule for this train
    const trainSchedule: Array<{ station: string; time: string }> = []

    // Start at different times for each train
    const startOffset = i * 20 // minutes

    schedule.forEach((entry) => {
      // Use multiple time entries to create a more realistic schedule
      const timeEntries = entry.times.slice(0, 10) // Use first 10 time entries

      timeEntries.forEach((time, timeIndex) => {
        // Add offset based on train ID and time index
        const [baseHour, baseMinute] = time.split(":").map(Number)
        let timeValue = baseHour * 60 + baseMinute + startOffset + timeIndex * 60

        // Wrap around 24 hours
        while (timeValue >= 24 * 60) {
          timeValue -= 24 * 60
        }

        const hour = Math.floor(timeValue / 60)
        const minute = timeValue % 60

        trainSchedule.push({
          station: entry.station,
          time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
        })
      })
    })

    // Sort the schedule by time
    trainSchedule.sort((a, b) => {
      const [aHour, aMinute] = a.time.split(":").map(Number)
      const [bHour, bMinute] = b.time.split(":").map(Number)

      const aValue = aHour * 60 + aMinute
      const bValue = bHour * 60 + bMinute

      return aValue - bValue
    })

    // Find current and next station based on time
    let currentStation = schedule[0].station
    let nextStation = schedule[1].station
    let progress = 0

    for (let j = 0; j < trainSchedule.length - 1; j++) {
      const currentStop = trainSchedule[j]
      const nextStop = trainSchedule[j + 1]

      const [currentHour, currentMinute] = currentStop.time.split(":").map(Number)
      const [nextHour, nextMinute] = nextStop.time.split(":").map(Number)

      const currentStopTime = currentHour * 60 + currentMinute
      let nextStopTime = nextHour * 60 + nextMinute

      // Handle midnight crossing
      if (nextStopTime < currentStopTime) {
        nextStopTime += 24 * 60
      }

      // If current time is between these stops
      if (currentTimeValue >= currentStopTime && currentTimeValue <= nextStopTime) {
        currentStation = currentStop.station
        nextStation = nextStop.station

        // Calculate progress between stations (0 to 1)
        const totalTime = nextStopTime - currentStopTime
        const elapsedTime = currentTimeValue - currentStopTime
        progress = totalTime > 0 ? elapsedTime / totalTime : 0

        break
      }
    }

    trainPositions.push({
      id: i + 1,
      currentStation,
      nextStation,
      progress,
      direction: direction as "forward" | "backward",
      schedule: trainSchedule,
    })
  }

  return trainPositions
}


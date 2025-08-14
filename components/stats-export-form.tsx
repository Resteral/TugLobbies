"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Download, FileText, BarChart } from "lucide-react"
import { exportGameStats, exportPlayerStats, exportTournamentStats } from "@/lib/actions"

interface StatsExportFormProps {
  recentGames: any[]
  playerStats: any[]
}

export default function StatsExportForm({ recentGames, playerStats }: StatsExportFormProps) {
  const [exportType, setExportType] = useState<string>("")
  const [dateRange, setDateRange] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleExport = async () => {
    if (!exportType) return

    setIsLoading(true)
    try {
      let csvData = ""
      let filename = ""

      switch (exportType) {
        case "games":
          csvData = await exportGameStats(dateRange)
          filename = `game_stats_${new Date().toISOString().split("T")[0]}.csv`
          break
        case "players":
          csvData = await exportPlayerStats()
          filename = `player_stats_${new Date().toISOString().split("T")[0]}.csv`
          break
        case "tournaments":
          csvData = await exportTournamentStats(dateRange)
          filename = `tournament_stats_${new Date().toISOString().split("T")[0]}.csv`
          break
        default:
          return
      }

      // Create and download CSV file
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Export failed:", error)
    }
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Export Type Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Export Type</label>
        <Select value={exportType} onValueChange={setExportType}>
          <SelectTrigger>
            <SelectValue placeholder="Select data to export" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="games">
              <div className="flex items-center space-x-2">
                <BarChart className="h-4 w-4" />
                <span>Game Statistics</span>
              </div>
            </SelectItem>
            <SelectItem value="players">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Player Rankings</span>
              </div>
            </SelectItem>
            <SelectItem value="tournaments">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Tournament Results</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Selection */}
      {(exportType === "games" || exportType === "tournaments") && (
        <div>
          <label className="block text-sm font-medium mb-2">Date Range (Optional)</label>
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        </div>
      )}

      {/* Export Preview */}
      {exportType && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Export Preview</h3>
          <div className="text-sm text-gray-300">
            {exportType === "games" && (
              <div>
                <p>• Game ID, Date, Type, Teams, Winner, Duration</p>
                <p>• Player performance metrics</p>
                <p>• ELO changes and statistics</p>
                <p className="text-blue-400 mt-2">~{recentGames.length} games available</p>
              </div>
            )}
            {exportType === "players" && (
              <div>
                <p>• Player name, ELO rating, Games played</p>
                <p>• Win/Loss records and percentages</p>
                <p>• Account IDs and verification status</p>
                <p className="text-blue-400 mt-2">~{playerStats.length} players available</p>
              </div>
            )}
            {exportType === "tournaments" && (
              <div>
                <p>• Tournament name, type, participants</p>
                <p>• Match results and bracket progression</p>
                <p>• Prize pools and winner information</p>
                <p className="text-blue-400 mt-2">All tournament data</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Button */}
      <Button onClick={handleExport} disabled={!exportType || isLoading} size="lg" className="w-full">
        <Download className="h-4 w-4 mr-2" />
        {isLoading ? "Exporting..." : "Export to CSV"}
      </Button>

      {/* Quick Export Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          onClick={() => {
            setExportType("games")
            handleExport()
          }}
          disabled={isLoading}
        >
          <BarChart className="h-4 w-4 mr-2" />
          Quick Export Games
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setExportType("players")
            handleExport()
          }}
          disabled={isLoading}
        >
          <FileText className="h-4 w-4 mr-2" />
          Quick Export Players
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setExportType("tournaments")
            handleExport()
          }}
          disabled={isLoading}
        >
          <FileText className="h-4 w-4 mr-2" />
          Quick Export Tournaments
        </Button>
      </div>
    </div>
  )
}

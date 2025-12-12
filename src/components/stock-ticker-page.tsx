"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "./header"
import { WatchlistTable } from "./watchlist-table"
import { OverviewPanels } from "./overview-panels"
import type { Stock } from "@/lib/stock-types"
import { generateInitialStocks, simulateStockUpdate } from "@/lib/stock-data"

export function StockTickerPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [stocks, setStocks] = useState<Stock[]>([])

  useEffect(() => {
    setStocks(generateInitialStocks())
  }, [])

  // Simulate live updates every 3-5 seconds
  useEffect(() => {
    const interval = setInterval(
      () => {
        setStocks((prevStocks) => {
          const updatedStocks = [...prevStocks]
          const numToUpdate = Math.floor(Math.random() * 5) + 2
          const indicesToUpdate = new Set<number>()

          while (indicesToUpdate.size < Math.min(numToUpdate, updatedStocks.length)) {
            indicesToUpdate.add(Math.floor(Math.random() * updatedStocks.length))
          }

          indicesToUpdate.forEach((index) => {
            updatedStocks[index] = simulateStockUpdate(updatedStocks[index])
          })

          return updatedStocks
        })
      },
      3000 + Math.random() * 2000,
    )

    return () => clearInterval(interval)
  }, [])

  const addStock = useCallback((symbol: string, name: string) => {
    const newStock: Stock = {
      id: crypto.randomUUID(),
      symbol: symbol.toUpperCase(),
      name: name || symbol.toUpperCase(),
      price: Math.random() * 500 + 10,
      prevClose: 0,
      change: 0,
      changePercent: 0,
      direction: "flat",
    }
    newStock.prevClose = newStock.price
    setStocks((prev) => [...prev, newStock])
  }, [])

  const removeStock = useCallback((id: string) => {
    setStocks((prev) => prev.filter((stock) => stock.id !== id))
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }, [])

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev)
  }, [])

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="bg-background text-foreground transition-colors duration-300 pb-8">
        <Header theme={theme} soundEnabled={soundEnabled} onToggleTheme={toggleTheme} onToggleSound={toggleSound} />
        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <WatchlistTable
                stocks={stocks}
                onAddStock={addStock}
                onRemoveStock={removeStock}
                soundEnabled={soundEnabled}
              />
            </div>
            <div className="lg:col-span-1">
              <OverviewPanels stocks={stocks} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

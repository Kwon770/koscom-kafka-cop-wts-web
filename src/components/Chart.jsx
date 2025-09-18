import React, {useEffect, useRef, useState} from 'react'
import {createChart, CrosshairMode, CandlestickSeries} from 'lightweight-charts'

const generateMockData = () => {
    const data = []
    let basePrice = 95000000
    let currentTime = Math.floor(Date.now() / 1000) - 3600

    for (let i = 0; i < 200; i++) {
        const trend = Math.sin(i * 0.1) * 0.003
        const volatility = (Math.random() - 0.5) * 0.002
        const priceChange = trend + volatility

        basePrice = basePrice * (1 + priceChange)

        const spreadPercent = 0.0005
        const spread = basePrice * spreadPercent

        const open = basePrice + (Math.random() - 0.5) * spread * 0.5
        const close = basePrice + (Math.random() - 0.5) * spread * 0.5

        const minPrice = Math.min(open, close)
        const maxPrice = Math.max(open, close)

        const high = maxPrice + Math.random() * spread * 0.3
        const low = minPrice - Math.random() * spread * 0.3

        data.push({
            time: currentTime,
            open: Math.round(open),
            high: Math.round(high),
            low: Math.round(low),
            close: Math.round(close)
        })

        currentTime += 60
    }

    return data
}

const Chart = () => {
    const chartContainerRef = useRef(null)
    const chartRef = useRef(null)
    const [selectedTimeframe, setSelectedTimeframe] = useState('1초')
    useEffect(() => {
        if (!chartContainerRef.current) return

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.offsetWidth,
            height: 400,
            layout: {
                background: {color: '#ffffff'},
                textColor: '#333',
            },
            grid: {
                vertLines: {color: '#e5e7eb'},
                horzLines: {color: '#e5e7eb'},
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            rightPriceScale: {
                borderColor: '#cccccc',
            },
            timeScale: {
                borderColor: '#cccccc',
                timeVisible: true,
                secondsVisible: true,
            },
        })

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderDownColor: '#ef4444',
            borderUpColor: '#22c55e',
            wickDownColor: '#ef4444',
            wickUpColor: '#22c55e',
        })

        const mockData = generateMockData()
        candlestickSeries.setData(mockData)

        chartRef.current = chart

        const handleResize = () => {
            chart.applyOptions({width: chartContainerRef.current.offsetWidth})
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            chart.remove()
        }
    }, [])

    return (
        <div className="h-full bg-white flex flex-col">
            {/* Chart Tools */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                    {['1초', '5초', '10초', '30초', '1분', '5분', '15분', '30분', '1시간', '1일'].map((period) => (
                        <button
                            key={period}
                            onClick={() => setSelectedTimeframe(period)}
                            className={`text-xs px-2 py-1 rounded ${
                                period === selectedTimeframe
                                    ? 'text-white bg-blue-600'
                                    : 'text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300'
                            }`}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart Content */}
            <div className="flex-1 relative overflow-hidden">
                <div ref={chartContainerRef} className="w-full h-full"/>
            </div>
        </div>
    )
}

export default Chart
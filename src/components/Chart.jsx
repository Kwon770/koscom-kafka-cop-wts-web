import React from 'react'

const Chart = () => {
  return (
    <div className="h-full bg-white flex flex-col">
      {/* Chart Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Mock Chart Area */}
        <div className="h-full flex items-center justify-center bg-gray-50">
          <div className="text-center">
            {/* SVG Chart Placeholder */}
            <div className="w-full h-96 relative">
              {/* Grid */}
              <svg className="absolute inset-0 w-full h-full">
                {/* Horizontal grid lines */}
                {[...Array(8)].map((_, i) => (
                  <line
                    key={`h-${i}`}
                    x1="0"
                    y1={i * 48}
                    x2="100%"
                    y2={i * 48}
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                  />
                ))}
                {/* Vertical grid lines */}
                {[...Array(12)].map((_, i) => (
                  <line
                    key={`v-${i}`}
                    x1={`${i * 8.33}%`}
                    y1="0"
                    x2={`${i * 8.33}%`}
                    y2="100%"
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                  />
                ))}

                {/* Mock candlestick chart */}
                {[...Array(50)].map((_, i) => {
                  const x = i * 12 + 20
                  const high = Math.random() * 200 + 100
                  const low = high - Math.random() * 80
                  const open = low + Math.random() * (high - low)
                  const close = low + Math.random() * (high - low)
                  const isGreen = close > open

                  return (
                    <g key={i}>
                      {/* High-Low line */}
                      <line
                        x1={x + 3}
                        y1={high}
                        x2={x + 3}
                        y2={low}
                        stroke={isGreen ? '#22c55e' : '#ef4444'}
                        strokeWidth="1"
                      />
                      {/* Body */}
                      <rect
                        x={x}
                        y={Math.min(open, close)}
                        width="6"
                        height={Math.abs(close - open) || 1}
                        fill={isGreen ? '#22c55e' : '#ef4444'}
                      />
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* Price indicators on the right */}
            <div className="absolute right-0 top-0 h-full w-20 flex flex-col justify-between py-4">
              {[96000000, 95500000, 95000000, 94500000, 94000000, 93500000, 93000000].map((price, index) => (
                <div key={price} className="text-xs text-gray-600 text-right pr-2">
                  {(price / 1000000).toFixed(1)}M
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Tools */}
        <div className="absolute top-4 left-4 flex items-center space-x-2">
            {['1분', '3분', '5분', '10분', '15분', '30분', '1시간', '4시간', '1일', '1주'].map((period, index) => (
              <button
                key={period}
                className={`text-xs px-2 py-1 rounded ${
                  period === '1일' 
                    ? 'text-white bg-blue-600' 
                    : 'text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {period}
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}

export default Chart
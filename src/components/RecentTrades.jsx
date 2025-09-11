import React from 'react'

const RecentTrades = () => {
  // Mock recent trades data
  const recentTrades = [
    { time: '14:23:45', price: 95123000, amount: 0.125, side: 'buy' },
    { time: '14:23:44', price: 95120000, amount: 0.234, side: 'sell' },
    { time: '14:23:43', price: 95125000, amount: 0.089, side: 'buy' },
    { time: '14:23:42', price: 95118000, amount: 0.456, side: 'sell' },
    { time: '14:23:41', price: 95122000, amount: 0.123, side: 'buy' },
    { time: '14:23:40', price: 95115000, amount: 0.678, side: 'sell' },
    { time: '14:23:39', price: 95120000, amount: 0.234, side: 'buy' },
    { time: '14:23:38', price: 95117000, amount: 0.567, side: 'sell' },
    { time: '14:23:37', price: 95119000, amount: 0.345, side: 'buy' },
    { time: '14:23:36', price: 95114000, amount: 0.789, side: 'sell' },
    { time: '14:23:35', price: 95121000, amount: 0.234, side: 'buy' },
    { time: '14:23:34', price: 95116000, amount: 0.456, side: 'sell' },
    { time: '14:23:33', price: 95118000, amount: 0.123, side: 'buy' },
    { time: '14:23:32', price: 95113000, amount: 0.678, side: 'sell' },
    { time: '14:23:31', price: 95120000, amount: 0.345, side: 'buy' },
  ]

  const formatPrice = (price) => {
    return price.toLocaleString()
  }

  const formatAmount = (amount) => {
    return amount.toFixed(3)
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-300">
        <h3 className="text-gray-900 font-medium">체결내역</h3>
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>시간</span>
          <span>가격(KRW)</span>
          <span>수량(BTC)</span>
        </div>
      </div>
      
      {/* Trades List */}
      <div className="flex-1 overflow-y-auto">
        {recentTrades.map((trade, index) => (
          <div 
            key={index} 
            className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer border-b border-gray-200 border-opacity-50"
          >
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600 font-mono w-16">
                {trade.time}
              </span>
              <span 
                className={`font-mono font-medium flex-1 text-right ${
                  trade.side === 'buy' ? 'text-red-500' : 'text-blue-500'
                }`}
              >
                {formatPrice(trade.price)}
              </span>
              <span className="text-gray-900 font-mono w-20 text-right">
                {formatAmount(trade.amount)}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary */}
      <div className="p-3 border-t border-gray-300 bg-gray-100">
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">24시간 누적거래량</span>
            <span className="text-gray-900">15,234.23 BTC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">24시간 누적거래대금</span>
            <span className="text-gray-900">1,432억 KRW</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecentTrades
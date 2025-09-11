import React from 'react'

const OrderBook = () => {
  // Mock order book data
  const sellOrders = [
    { price: 95500000, amount: 0.125, total: 11937500 },
    { price: 95400000, amount: 0.342, total: 32636800 },
    { price: 95300000, amount: 0.089, total: 8481700 },
    { price: 95200000, amount: 0.234, total: 22296800 },
    { price: 95150000, amount: 0.456, total: 43388400 },
    { price: 95130000, amount: 0.123, total: 11700990 },
    { price: 95125000, amount: 0.678, total: 64494750 },
  ]

  const buyOrders = [
    { price: 95100000, amount: 0.234, total: 22253400 },
    { price: 95000000, amount: 0.567, total: 53865000 },
    { price: 94950000, amount: 0.123, total: 11678850 },
    { price: 94900000, amount: 0.789, total: 74896100 },
    { price: 94850000, amount: 0.345, total: 32723250 },
    { price: 94800000, amount: 0.234, total: 22183200 },
    { price: 94750000, amount: 0.456, total: 43206000 },
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
        <div className="flex items-center justify-between">
          <h3 className="text-gray-900 font-medium">호가</h3>
          <div className="flex items-center space-x-2">
            <button className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded">
              0.1
            </button>
            <button className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded">
              1
            </button>
            <button className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded">
              10
            </button>
          </div>
        </div>
        
        {/* Column Headers */}
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>가격(KRW)</span>
          <span>수량(BTC)</span>
          <span>총액</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {/* Sell Orders */}
        <div className="h-1/2 overflow-y-auto">
          {sellOrders.reverse().map((order, index) => (
            <div key={index} className="relative px-3 py-1 hover:bg-gray-100 cursor-pointer">
              {/* Background bar for amount visualization */}
              <div 
                className="absolute right-0 top-0 h-full bg-red-500 bg-opacity-10"
                style={{ width: `${Math.min(order.amount * 200, 100)}%` }}
              />
              <div className="relative flex justify-between text-xs">
                <span className="text-red-400 font-mono">{formatPrice(order.price)}</span>
                <span className="text-gray-900 font-mono">{formatAmount(order.amount)}</span>
                <span className="text-gray-600 font-mono">{(order.total / 10000).toFixed(0)}만</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Current Price */}
        <div className="px-3 py-2 bg-gray-100 border-y border-gray-300">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-red-500">95,123,000</span>
            <div className="flex items-center space-x-1 text-red-500 text-sm">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd"></path>
              </svg>
              <span>+2.31%</span>
            </div>
          </div>
        </div>
        
        {/* Buy Orders */}
        <div className="h-1/2 overflow-y-auto">
          {buyOrders.map((order, index) => (
            <div key={index} className="relative px-3 py-1 hover:bg-gray-100 cursor-pointer">
              {/* Background bar for amount visualization */}
              <div 
                className="absolute right-0 top-0 h-full bg-blue-500 bg-opacity-10"
                style={{ width: `${Math.min(order.amount * 200, 100)}%` }}
              />
              <div className="relative flex justify-between text-xs">
                <span className="text-blue-400 font-mono">{formatPrice(order.price)}</span>
                <span className="text-gray-900 font-mono">{formatAmount(order.amount)}</span>
                <span className="text-gray-600 font-mono">{(order.total / 10000).toFixed(0)}만</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OrderBook
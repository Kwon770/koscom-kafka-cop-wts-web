import React from 'react'
import Header from './components/Header'
import TradingPair from './components/TradingPair'
import OrderBook from './components/OrderBook'
import Chart from './components/Chart'
import TradingPanel from './components/TradingPanel'
import RecentTrades from './components/RecentTrades'
import MarketList from './components/MarketList'

function App() {
  return (
    <div className="min-h-screen bg-[#E9ECF1] text-gray-900">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex h-[calc(100vh-60px)] max-w-screen-2xl mx-auto">
        {/* Left Panel - 80% */}
        <div className="w-4/5 flex flex-col">
          {/* Trading Pair Info */}
          <div className="h-32 border-b border-gray-300">
            <TradingPair />
          </div>
          
          {/* Chart Area */}
          <div className="flex-1 border-b border-gray-300">
            <Chart />
          </div>
          
          {/* Order Book and Trading Panel Row */}
          <div className="flex h-96 border-b border-gray-300">
            {/* Order Book - Left */}
            <div className="flex-1 border-r border-gray-300">
              <OrderBook />
            </div>
            
            {/* Trading Panel - Right */}
            <div className="flex-1">
              <TradingPanel />
            </div>
          </div>
          
          {/* Recent Trades */}
          <div className="h-64">
            <RecentTrades />
          </div>
        </div>
        
        {/* Right Panel - 20% - Market List */}
        <div className="w-1/5 ml-2">
          <MarketList />
        </div>
      </div>
    </div>
  )
}

export default App
import React from "react";
import Header from "./components/Header";
import TradingPair from "./components/TradingPair";
import OrderBook from "./components/OrderBook";
import Chart from "./components/Chart";
import TradingPanel from "./components/TradingPanel";
import RecentTrades from "./components/RecentTrades";
import MarketList from "./components/MarketList";

function App() {
  return (
    <div className="min-h-screen bg-[#E9ECF1] text-gray-900">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="overflow-x-auto">
        <div className="flex min-w-[1200px] max-w-screen-2xl mx-auto">
          {/* Left Panel - Main Content (minimum width maintained) */}
          <div className="flex-1 min-w-[840px] flex flex-col">
            {/* Trading Pair Info */}
            <div className="border-b border-gray-300 mb-2">
              <TradingPair />
            </div>

            {/* Chart Area */}
            <div className="flex-1 border-b border-gray-300 mb-2">
              <Chart />
            </div>

            {/* Order Book and Trading Panel Row */}
            <div className="flex border-b border-gray-300 mb-2">
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
            <div className="h-64 mb-5">
              <RecentTrades />
            </div>
          </div>

          {/* Right Panel - Market List (fixed width) */}
          <div className="w-[360px] flex-shrink-0 pb-5 ml-2">
            <MarketList />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

import React, { useState } from "react";

const MarketList = () => {
  // Mock market data
  const markets = [
    {
      symbol: "BTC",
      name: "비트코인",
      price: 95123000,
      change: 2.31,
      changeAmount: 2153000,
      volume: 15234.23,
    },
    {
      symbol: "ETH",
      name: "이더리움",
      price: 3420000,
      change: -1.45,
      changeAmount: -50000,
      volume: 45678.12,
    },
    {
      symbol: "XRP",
      name: "리플",
      price: 890,
      change: 5.23,
      changeAmount: 44,
      volume: 123456.78,
    },
    {
      symbol: "ADA",
      name: "에이다",
      price: 567,
      change: -2.11,
      changeAmount: -12,
      volume: 98765.43,
    },
    {
      symbol: "DOT",
      name: "폴카닷",
      price: 12340,
      change: 3.78,
      changeAmount: 450,
      volume: 34567.89,
    },
    {
      symbol: "LINK",
      name: "체인링크",
      price: 23450,
      change: -0.89,
      changeAmount: -210,
      volume: 23456.78,
    },
    {
      symbol: "LTC",
      name: "라이트코인",
      price: 156000,
      change: 1.23,
      changeAmount: 1900,
      volume: 12345.67,
    },
    {
      symbol: "BCH",
      name: "비트코인캐시",
      price: 234000,
      change: -3.45,
      changeAmount: -8345,
      volume: 8765.43,
    },
  ];

  const formatVolume = (volume) => {
    if (volume > 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume > 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toFixed(0);
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header with Tabs */}
      <div className="p-3 border-b border-gray-300">
        {/* Column Headers */}
        <div className="flex justify-between items-center text-xs text-gray-600 px-1">
          <span className="w-16">코인</span>
          <span className="flex-1 text-right">현재가</span>
          <span className="w-16 text-right">등락률</span>
        </div>
      </div>

      {/* Market List */}
      <div className="flex-1 overflow-y-auto">
        {markets.map((market, index) => (
          <div
            key={market.symbol}
            className={`px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 border-opacity-30 }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 w-16">
                <div className="flex flex-col">
                  <span className="text-gray-900 text-sm font-medium">
                    {market.symbol}
                  </span>
                  <span className="text-gray-600 text-xs">{market.name}</span>
                </div>
              </div>

              <div className="flex-1 text-right">
                <div
                  className={`text-sm font-medium ${
                    market.change > 0
                      ? "text-red-500"
                      : market.change < 0
                      ? "text-blue-500"
                      : "text-gray-900"
                  }`}
                >
                  {market.price}
                </div>
                <div className="text-xs text-gray-600">
                  {formatVolume(market.volume)}
                </div>
              </div>

              <div className="w-16 text-right">
                <div
                  className={`text-xs font-medium ${
                    market.change > 0
                      ? "text-red-500"
                      : market.change < 0
                      ? "text-blue-500"
                      : "text-gray-900"
                  }`}
                >
                  {market.change > 0 ? "+" : ""}
                  {market.change.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketList;

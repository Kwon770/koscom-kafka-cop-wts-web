import React, { useState, useEffect } from "react";

const MarketList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("KRW");
  const [priceAnimations, setPriceAnimations] = useState({});

  // Mock market data - now as state
  const [markets, setMarkets] = useState([
    {
      ticker: "BTC/KRW",
      name: "비트코인",
      price: 95123000,
      change: 2.31,
      changeAmount: 2153000,
      volume: 125000000000,
    },
    {
      ticker: "ETH/KRW",
      name: "이더리움",
      price: 3420000,
      change: -1.45,
      changeAmount: -50000,
      volume: 45000000000,
    },
    {
      ticker: "XRP/KRW",
      name: "리플",
      price: 890,
      change: 5.23,
      changeAmount: 44,
      volume: 8500000000,
    },
    {
      ticker: "ADA/KRW",
      name: "에이다",
      price: 567,
      change: -2.11,
      changeAmount: -12,
      volume: 2300000000,
    },
    {
      ticker: "DOT/KRW",
      name: "폴카닷",
      price: 12340,
      change: 3.78,
      changeAmount: 450,
      volume: 5600000000,
    },
    {
      ticker: "LINK/KRW",
      name: "체인링크",
      price: 23450,
      change: -0.89,
      changeAmount: -210,
      volume: 3200000000,
    },
    {
      ticker: "LTC/KRW",
      name: "라이트코인",
      price: 156000,
      change: 1.23,
      changeAmount: 1900,
      volume: 12000000000,
    },
    {
      ticker: "BCH/KRW",
      name: "비트코인캐시",
      price: 234000,
      change: -3.45,
      changeAmount: -8345,
      volume: 7800000000,
    },
  ]);

  const formatPrice = (price) => {
    return price.toLocaleString();
  };

  const formatVolume = (volume) => {
    if (volume >= 1000000000000) {
      return `${(volume / 1000000000000).toFixed(1)}조`;
    } else if (volume >= 100000000) {
      return `${(volume / 100000000).toFixed(0)}억`;
    } else if (volume >= 10000) {
      return `${(volume / 10000).toFixed(0)}만`;
    }
    return volume.toLocaleString();
  };

  // Price animation handler
  const triggerPriceAnimation = (ticker) => {
    setPriceAnimations((prev) => ({ ...prev, [ticker]: true }));
    setTimeout(() => {
      setPriceAnimations((prev) => ({ ...prev, [ticker]: false }));
    }, 100); // 0.1초 후 border 제거
  };

  // Random market data updater
  const updateRandomMarket = () => {
    setMarkets((prevMarkets) => {
      // Random chance to update (30% probability)
      if (Math.random() > 0.4) return prevMarkets;

      const updatedMarkets = [...prevMarkets];
      const randomIndex = Math.floor(Math.random() * updatedMarkets.length);
      const market = { ...updatedMarkets[randomIndex] };

      // Random price change (-5% to +5%)
      const priceChangePercent = (Math.random() - 0.5) * 0.1; // -5% to +5%
      const oldPrice = market.price;
      const newPrice = Math.max(
        1,
        Math.round(oldPrice * (1 + priceChangePercent)),
      );

      // Only update if price actually changed
      if (newPrice !== oldPrice) {
        // Calculate change amount and percentage
        const changeAmount = newPrice - oldPrice;
        const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;

        // Update volume randomly (-10% to +10%)
        const volumeChange = (Math.random() - 0.5) * 0.2;
        const newVolume = Math.max(
          1000000,
          Math.round(market.volume * (1 + volumeChange)),
        );

        market.price = newPrice;
        market.change = changePercent;
        market.changeAmount = changeAmount;
        market.volume = newVolume;

        // Trigger price animation
        triggerPriceAnimation(market.ticker);
      }

      updatedMarkets[randomIndex] = market;
      return updatedMarkets;
    });
  };

  // Start random updates
  useEffect(() => {
    const startRandomUpdates = () => {
      const randomDelay = 100; // 0.1초 ~ 3초
      setTimeout(() => {
        updateRandomMarket();
        startRandomUpdates(); // 재귀적으로 다음 업데이트 스케줄링
      }, randomDelay);
    };

    startRandomUpdates();
  }, []);

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="코인 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Token Pair Tabs */}
      <div className="px-3 py-2 border-b border-gray-200">
        <div className="flex space-x-1">
          {["KRW", "BTC", "USDT"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                if (tab === "KRW") {
                  setActiveTab(tab);
                }
              }}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                activeTab === tab
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Column Headers */}
      <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center text-xs text-gray-600">
          <span className="w-20">코인</span>
          <span className="flex-1 text-right pr-4">현재가</span>
          <span className="w-16 text-right">등락률</span>
          <span className="w-16 text-right">거래대금</span>
        </div>
      </div>

      {/* Market List */}
      <div className="flex-1 overflow-y-auto">
        {markets
          .filter(
            (market) =>
              market.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
              market.name.includes(searchTerm),
          )
          .map((market) => (
            <div
              key={market.ticker}
              className="px-3 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
            >
              <div className="flex items-start">
                <div className="flex items-center space-x-3 w-20">
                  <div className="flex flex-col">
                    <span className="text-gray-900 text-sm font-semibold">
                      {market.name}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {market.ticker}
                    </span>
                  </div>
                </div>

                <div className="flex-1 text-right pr-4 pt-0.5">
                  <div className="inline-block">
                    <div
                      className={`px-2 py-1 rounded border-[1px] transition-all duration-230 text-sm font-semibold
                      ${
                        priceAnimations[market.ticker]
                          ? "border-[#262626]"
                          : "border-transparent"
                      }
                      ${
                        market.change > 0
                          ? "text-red-500"
                          : market.change < 0
                          ? "text-blue-500"
                          : "text-gray-900"
                      }`}
                    >
                      {formatPrice(market.price)}
                    </div>
                  </div>
                </div>

                <div className="w-16 text-right">
                  <div
                    className={`text-xs ${
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
                  <div
                    className={`text-xs mt-1 ${
                      market.change > 0
                        ? "text-red-500"
                        : market.change < 0
                        ? "text-blue-500"
                        : "text-gray-600"
                    }`}
                  >
                    {market.changeAmount > 0 ? "+" : ""}
                    {market.changeAmount.toLocaleString()}
                  </div>
                </div>

                <div className="w-16 text-right pt-0.5">
                  <div className="text-xs font-medium text-gray-700">
                    {formatVolume(market.volume)}
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

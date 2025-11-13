import React, { useState, useEffect, useCallback, useRef } from "react";
import { fetchMarketList, connectTickerSSE, transformTickerData } from "../services/marketService";

const MarketList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("KRW");
  const [priceAnimations, setPriceAnimations] = useState({});
  const [markets, setMarkets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const eventSourceRef = useRef(null);
  const exchange = import.meta.env.VITE_EXCHANGE || "UPBIT";

  // 티커 코드를 한국어 이름으로 매핑
  const tickerNameMap = {
    "KRW/XRP": "리플",
    "KRW/BTC": "비트코인",
    "KRW/ETH": "이더리움",
    "KRW/SOL": "솔라나",
    "KRW/DOGE": "도지코인",
    "KRW/ADA": "에이다",
    "KRW/SUI": "수이",
    "KRW/LINK": "체인링크",
    "KRW/ZKC": "바운드리스",
  };

  const getTickerName = (ticker) => {
    return tickerNameMap[ticker] || ticker;
  };

  const formatPrice = (price) => {
    return price.toLocaleString();
  };

  const formatVolume = (volume) => {
    // 백만 단위로 변환 (1,000,000 = 1백만)
    const volumeInMillions = volume / 1000000;
    return `${volumeInMillions.toLocaleString(undefined, { maximumFractionDigits: 0 })}백만`;
  };

  // 초기 데이터 로드
  const loadMarketList = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const results = await fetchMarketList(exchange);

      // API 응답을 UI 형식으로 변환
      const transformedMarkets = results.map((item) => ({
        ticker: item.tickerCode,
        name: item.tickerName,
        price: item.tradePrice,
        change: item.changeRate,
        changeAmount: item.changePrice,
        volume: item.accTradePrice,
      }));

      // 거래대금 내림차순 정렬
      transformedMarkets.sort((a, b) => b.volume - a.volume);

      setMarkets(transformedMarkets);
    } catch (err) {
      setError(err);
      console.error("Failed to load market list:", err);
    } finally {
      setIsLoading(false);
    }
  }, [exchange]);

  // Price animation handler
  const triggerPriceAnimation = useCallback((ticker) => {
    setPriceAnimations((prev) => ({ ...prev, [ticker]: true }));
    setTimeout(() => {
      setPriceAnimations((prev) => ({ ...prev, [ticker]: false }));
    }, 100);
  }, []);

  // SSE 데이터 업데이트
  const updateMarketFromSSE = useCallback(
    (sseData) => {
      if (!sseData) return;

      // exchange 필터링
      const sseExchange = sseData.exchange?.toUpperCase();
      const currentExchange = exchange.toUpperCase();

      if (sseExchange !== currentExchange) {
        return;
      }

      const transformed = transformTickerData(sseData);
      if (!transformed) return;

      setMarkets((prevMarkets) => {
        const index = prevMarkets.findIndex((m) => m.ticker === transformed.ticker);
        if (index === -1) return prevMarkets;

        const updatedMarkets = [...prevMarkets];
        const oldPrice = updatedMarkets[index].price;

        updatedMarkets[index] = {
          ...updatedMarkets[index],
          price: transformed.price,
          change: transformed.change,
          changeAmount: transformed.changeAmount,
          volume: transformed.volume,
        };

        // 가격이 변경되었으면 애니메이션 트리거
        if (oldPrice !== transformed.price) {
          triggerPriceAnimation(transformed.ticker);
        }

        return updatedMarkets;
      });
    },
    [exchange, triggerPriceAnimation],
  );

  // SSE 연결
  const connectSSEStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = connectTickerSSE(
      "ticker-basic",
      (data) => {
        updateMarketFromSSE(data);
      },
      (error) => {
        console.error("SSE connection error:", error);
        setIsConnected(false);
        window.dispatchEvent(new CustomEvent("sse-status-update", {
          detail: { topic: "ticker-basic", connected: false }
        }));
        setTimeout(() => {
          connectSSEStream();
        }, 5000);
      },
      () => {
        setIsConnected(true);
        window.dispatchEvent(new CustomEvent("sse-status-update", {
          detail: { topic: "ticker-basic", connected: true }
        }));
      },
    );

    eventSourceRef.current = eventSource;
  }, [updateMarketFromSSE]);

  useEffect(() => {
    loadMarketList().then(() => {
      connectSSEStream();
    });

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [loadMarketList, connectSSEStream]);

  if (isLoading) {
    return (
      <div className="h-full bg-white flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input type="text" placeholder="코인 검색" value="" disabled className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 bg-gray-50" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
          마켓 목록을 불러오는 중입니다...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-white flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input type="text" placeholder="코인 검색" value="" disabled className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 bg-gray-50" />
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-sm text-red-600 space-y-2 px-4">
          <span>마켓 목록을 불러오지 못했습니다.</span>
          {error?.message && (
            <span className="text-xs text-gray-500 text-center">{error.message}</span>
          )}
          <button
            type="button"
            onClick={loadMarketList}
            className="px-3 py-1 border border-red-300 rounded hover:bg-red-50 text-red-600 text-xs"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

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
          <span className="w-16">코인</span>
          <span className="flex-1 text-right pr-4">현재가</span>
          <span className="w-16 text-right">등락률</span>
          <span className="w-24 text-right">거래대금</span>
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
                <div className="flex items-center space-x-3 w-16">
                  <div className="flex flex-col">
                    <span className="text-gray-900 text-xs font-semibold">
                      {getTickerName(market.ticker)}
                    </span>
                    <span className="text-gray-500 text-[10px]">
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

                <div className="w-24 text-right pt-0.5">
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

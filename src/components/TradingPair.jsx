import React, { useState, useEffect, useCallback, useRef } from "react";
import BitcoinIcon from "../assets/BTC.png";
import { fetchTicker } from "../services/orderbookService";
import { connectTickerSSE, transformTickerData } from "../services/marketService";

const TradingPair = () => {
  const [tickerData, setTickerData] = useState({
    name: "비트코인",
    tradePrice: 0,
    changeRate: 0,
    changePrice: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const eventSourceRef = useRef(null);
  const exchange = import.meta.env.VITE_EXCHANGE || "UPBIT";
  const marketCode = import.meta.env.VITE_CODE || "KRW/BTC";

  // 초기 데이터 로드
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchTicker(exchange, marketCode);

      setTickerData({
        name: data.tickerName,
        tradePrice: data.tradePrice,
        changeRate: data.changeRate,
        changePrice: data.changePrice,
      });
    } catch (error) {
      console.error("Failed to load ticker data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [exchange, marketCode]);

  // SSE 데이터 업데이트
  const updateTickerFromSSE = useCallback(
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

      // marketCode 매칭
      if (transformed.ticker !== marketCode) {
        return;
      }

      setTickerData((prev) => ({
        ...prev,
        tradePrice: transformed.price,
        changeRate: transformed.change,
        changePrice: transformed.changeAmount,
      }));
    },
    [exchange, marketCode],
  );

  // SSE 연결
  const connectSSEStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = connectTickerSSE(
      "ticker-basic",
      (data) => {
        updateTickerFromSSE(data);
      },
      (error) => {
        console.error("SSE connection error:", error);
        setTimeout(() => {
          connectSSEStream();
        }, 5000);
      },
      () => {
        console.log("SSE connected");
      },
    );

    eventSourceRef.current = eventSource;
  }, [updateTickerFromSSE]);

  useEffect(() => {
    loadInitialData().then(() => {
      connectSSEStream();
    });

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [loadInitialData, connectSSEStream]);

  const formatPrice = (price) => {
    return price.toLocaleString();
  };

  const getPriceColor = () => {
    if (tickerData.changeRate > 0) return "text-red-500";
    if (tickerData.changeRate < 0) return "text-blue-500";
    return "text-gray-900";
  };

  const priceColor = getPriceColor();

  return (
    <div className="h-20 bg-white px-4 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        {/* Trading Pair and Price */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <img src={BitcoinIcon} alt="비트코인 아이콘" className="w-6 h-6" />
            <span className="text-gray-900 font-bold text-lg">{marketCode}</span>
          </div>
        </div>

        {/* Current Price */}
        <div className="flex items-baseline space-x-2">
          <span className={`text-2xl font-bold ${priceColor}`}>
            {isLoading ? "-" : formatPrice(tickerData.tradePrice)}
          </span>
          <span className={priceColor}>KRW</span>
        </div>


        {/* Price Change */}
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 ${priceColor}`}>
            <span className="font-medium">
              {isLoading ? "-" : `${tickerData.changeRate > 0 ? "+" : ""}${tickerData.changeRate.toFixed(2)}%`}
            </span>
          </div>
          <div className={`flex items-center space-x-1 ${priceColor}`}>
            {tickerData.changeRate > 0 ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            ) : tickerData.changeRate < 0 ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            ) : null}
            <span className="font-medium">
              {isLoading ? "-" : `${tickerData.changePrice > 0 ? "+" : ""}${formatPrice(tickerData.changePrice)}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingPair;

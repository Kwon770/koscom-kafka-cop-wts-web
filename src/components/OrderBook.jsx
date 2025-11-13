import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  fetchInitialOrderbook,
  fetchTicker,
  connectOrderbookSSE,
  transformApiOrderbook,
  transformSseOrderbook,
} from "../services/orderbookService";

// 애니메이션을 위한 컴포넌트
const OrderRow = React.memo(({ order, isSell, maxAmount, openingPrice }) => {
  const [animationClass, setAnimationClass] = useState("");
  const prevOrderRef = useRef(order);

  useEffect(() => {
    if (!prevOrderRef.current) {
      prevOrderRef.current = order;
      return;
    }

    if (order.price !== prevOrderRef.current.price) {
      setAnimationClass("bg-yellow-200");
      setTimeout(() => setAnimationClass(""), 300);
    } else if (order.amount !== prevOrderRef.current.amount) {
      setAnimationClass("bg-blue-100");
      setTimeout(() => setAnimationClass(""), 300);
    }

    prevOrderRef.current = order;
  }, [order]);

  const formatPrice = (price) => {
    return price.toLocaleString();
  };

  const formatAmount = (amount) => {
    return amount.toFixed(3);
  };

  // 시가 대비 등락률 계산
  const calculateChangeRate = (price) => {
    if (!openingPrice || openingPrice === 0) return 0;
    return ((price - openingPrice) / openingPrice) * 100;
  };

  // 등락률에 따른 색상 결정
  const getPriceColor = (price) => {
    const changeRate = calculateChangeRate(price);
    if (changeRate > 0) return "text-red-500";
    if (changeRate < 0) return "text-blue-500";
    return "text-gray-900";
  };

  const changeRate = calculateChangeRate(order.price);
  const priceColor = getPriceColor(order.price);
  const changeRateText = changeRate > 0 ? `+${changeRate.toFixed(2)}%` : `${changeRate.toFixed(2)}%`;

  if (isSell) {
    return (
      <div
        className={`relative pb-px h-10 hover:bg-gray-100 cursor-pointer transition-colors ${animationClass}`}
      >
        <div className="relative flex text-xs h-full">
          <span className="bg-blue-500 bg-opacity-10 pr-3 text-gray-600 font-mono w-[27.8%] text-right flex items-center justify-end relative">
            {/* Amount background bar */}
            <div
              className="absolute right-0 top-1/2 transform -translate-y-1/2 h-8 bg-blue-300 bg-opacity-30"
              style={{ width: `${(order.amount / maxAmount) * 100}%` }}
            />
            <span className="relative z-10">{formatAmount(order.amount)}</span>
          </span>
          <span className="w-[0.2%] flex items-center"></span>
          <span className={`bg-blue-500 bg-opacity-10 ${priceColor} font-mono font-bold w-[24%] text-right flex items-center justify-end`}>
            {formatPrice(order.price)}
          </span>
          <span
            className={`bg-blue-500 bg-opacity-10 ${priceColor} font-mono w-[20%] text-center flex items-center justify-center`}
            style={{ fontSize: "11px" }}
          >
            {changeRateText}
          </span>
          <span className="w-[28%] flex items-center"></span>
        </div>
      </div>
    );
  } else {
    return (
      <div
        className={`relative pb-px h-10 hover:bg-gray-100 cursor-pointer transition-colors ${animationClass}`}
      >
        <div className="relative flex text-xs h-full">
          <span className="w-[28%] flex items-center"></span>
          <span className={`bg-red-500 bg-opacity-10 ${priceColor} font-mono font-bold w-[24%] text-right flex items-center justify-end`}>
            {formatPrice(order.price)}
          </span>
          <span
            className={`bg-red-500 bg-opacity-10 ${priceColor} font-mono w-[20%] text-center flex items-center justify-center`}
            style={{ fontSize: "11px" }}
          >
            {changeRateText}
          </span>
          <span className="w-[0.2%] flex items-center"></span>
          <span className="bg-red-500 bg-opacity-10 pl-3 text-gray-600 font-mono w-[27.8%] text-left flex items-center justify-start relative">
            {/* Amount background bar */}
            <div
              className="absolute left-0 top-1/2 transform -translate-y-1/2 h-8 bg-red-300 bg-opacity-30"
              style={{ width: `${(order.amount / maxAmount) * 100}%` }}
            />
            <span className="relative z-10">{formatAmount(order.amount)}</span>
          </span>
        </div>
      </div>
    );
  }
});

const OrderBook = () => {
  const [sellOrders, setSellOrders] = useState([]);
  const [buyOrders, setBuyOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [openingPrice, setOpeningPrice] = useState(null);

  const eventSourceRef = useRef(null);
  const exchange = import.meta.env.VITE_EXCHANGE || "UPBIT";
  const marketCode = import.meta.env.VITE_CODE || "KRW/BTC";

  // 초기 데이터 로드
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Ticker 데이터로 시가 계산
      const tickerData = await fetchTicker(exchange, marketCode);
      const opening = tickerData.tradePrice - tickerData.changePrice;
      setOpeningPrice(opening);

      const orderbookResults = await fetchInitialOrderbook(exchange, marketCode);
      
      if (!Array.isArray(orderbookResults)) {
        throw new Error(`호가 데이터 형식이 올바르지 않습니다. (받은 데이터: ${JSON.stringify(orderbookResults)})`);
      }

      if (orderbookResults.length === 0) {
        throw new Error("호가 데이터가 비어있습니다.");
      }

      const transformed = transformApiOrderbook(orderbookResults);

      if (!transformed) {
        throw new Error("호가 데이터 변환에 실패했습니다.");
      }

      if ((!transformed.asks || transformed.asks.length === 0) && (!transformed.bids || transformed.bids.length === 0)) {
        throw new Error("매수/매도 호가 데이터가 모두 비어있습니다.");
      }

      // 기존 UI 구조에 맞게 변환
      // API: Ask1(낮음) -> Ask5(높음) => UI: 아래(낮음) -> 위(높음)이므로 reverse 필요
      const sells = (transformed.asks || [])
        .slice(0, 7)
        .reverse()
        .map((item) => ({
          price: item.price,
          amount: item.quantity,
        }));

      const buys = (transformed.bids || [])
        .slice(0, 7)
        .map((item) => ({
          price: item.price,
          amount: item.quantity,
        }));

      setSellOrders(sells);
      setBuyOrders(buys);
    } catch (err) {
      setError(err);
      console.error("Failed to load initial orderbook:", err);
    } finally {
      setIsLoading(false);
    }
  }, [exchange, marketCode]);

  // SSE 데이터 업데이트
  const updateOrderbookFromSSE = useCallback(
    (sseData) => {
      if (!sseData) return;

      const sseExchange = sseData.exchange;
      const sseCode = Array.isArray(sseData.mkt_code)
        ? sseData.mkt_code.join("/")
        : null;

      if (sseExchange !== exchange || sseCode !== marketCode) {
        return;
      }

      const transformed = transformSseOrderbook(sseData);

      // 기존 UI 구조에 맞게 변환
      // API: Ask1(낮음) -> Ask5(높음) => UI: 아래(낮음) -> 위(높음)이므로 reverse 필요
      const sells = transformed.asks
        .slice(0, 7)
        .reverse()
        .map((item) => ({
          price: item.price,
          amount: item.quantity,
        }));

      const buys = transformed.bids
        .slice(0, 7)
        .map((item) => ({
          price: item.price,
          amount: item.quantity,
        }));

      setSellOrders(sells);
      setBuyOrders(buys);
    },
    [exchange, marketCode],
  );

  // SSE 연결
  const connectSSEStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = connectOrderbookSSE(
      "orderbook-5",
      (data) => {
        updateOrderbookFromSSE(data);
      },
      (error) => {
        console.error("SSE connection error:", error);
        setIsConnected(false);
        setTimeout(() => {
          connectSSEStream();
        }, 5000);
      },
      () => {
        setIsConnected(true);
      },
    );

    eventSourceRef.current = eventSource;
  }, [updateOrderbookFromSSE]);

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

  // Calculate max amount for bar visualization
  // 가장 큰 잔량의 1.5배를 기준으로 설정하여 막대가 적절한 길이로 표시되도록 함
  const actualMaxAmount = Math.max(
    ...sellOrders.map((order) => order.amount),
    ...buyOrders.map((order) => order.amount),
    0,
  );
  const maxAmount = actualMaxAmount * 2.5;

  if (isLoading) {
    return (
      <div className="h-full bg-white flex flex-col">
        <div className="p-3 border-b border-gray-300">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-900 font-medium">호가</h3>
          </div>
          <div className="flex text-xs text-gray-600 mt-2">
            <span className="w-[30%] text-left">수량(BTC)</span>
            <span className="w-[40%] text-center">가격(KRW)</span>
            <span className="w-[30%] text-right">총액</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
          호가 데이터를 불러오는 중입니다...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-white flex flex-col">
        <div className="p-3 border-b border-gray-300">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-900 font-medium">호가</h3>
          </div>
          <div className="flex text-xs text-gray-600 mt-2">
            <span className="w-[30%] text-left">수량(BTC)</span>
            <span className="w-[40%] text-center">가격(KRW)</span>
            <span className="w-[30%] text-right">총액</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-sm text-red-600 space-y-2 px-4">
          <span>호가 데이터를 불러오지 못했습니다.</span>
          {error?.message && (
            <span className="text-xs text-gray-500 text-center">
              {error.message}
            </span>
          )}
          <button
            type="button"
            onClick={loadInitialData}
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
      {/* Header */}
      <div className="p-3 border-b border-gray-300">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-900 font-medium">호가</h3>
          <span
            className={`text-xs ${
              isConnected ? "text-green-600" : "text-red-500"
            }`}
          >
            {isConnected ? "연결됨" : "연결 끊김"}
          </span>
        </div>

        {/* Column Headers */}
        <div className="flex text-xs text-gray-600 mt-2">
          <span className="w-[30%] text-left">수량(BTC)</span>
          <span className="w-[40%] text-center">가격(KRW)</span>
          <span className="w-[30%] text-right">총액</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {/* Sell Orders */}
        <div className="overflow-y-auto">
          {sellOrders.map((order, index) => (
            <OrderRow key={`sell-${order.price}-${index}`} order={order} isSell={true} maxAmount={maxAmount} openingPrice={openingPrice} />
          ))}
        </div>

        {/* Buy Orders */}
        <div className="overflow-y-auto">
          {buyOrders.map((order, index) => (
            <OrderRow key={`buy-${order.price}-${index}`} order={order} isSell={false} maxAmount={maxAmount} openingPrice={openingPrice} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;

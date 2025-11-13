import React from "react";
import OrderRow from "./OrderBook/OrderRow";
import OrderBookHeader from "./OrderBook/OrderBookHeader";
import { useOrderBookData } from "./OrderBook/useOrderBookData";

const OrderBook = () => {
  const exchange = import.meta.env.VITE_EXCHANGE || "UPBIT";
  const marketCode = import.meta.env.VITE_CODE || "KRW/BTC";

  const {
    sellOrders,
    buyOrders,
    isLoading,
    error,
    openingPrice,
    currentPrice,
    loadInitialData,
  } = useOrderBookData(exchange, marketCode);

  // Calculate max amount for bar visualization
  // 가장 큰 잔량의 1.5배를 기준으로 설정하여 막대가 적절한 길이로 표시되도록 함
  const actualMaxAmount = Math.max(
    ...sellOrders.map((order) => order.amount),
    ...buyOrders.map((order) => order.amount),
    0,
  );
  const maxAmount = actualMaxAmount * 3;

  if (isLoading) {
    return (
      <div className="h-full bg-white flex flex-col">
        <OrderBookHeader />
        <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
          호가 데이터를 불러오는 중입니다...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-white flex flex-col">
        <OrderBookHeader />
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
      <OrderBookHeader />

      <div className="flex-1 overflow-hidden">
        {/* Sell Orders */}
        <div className="overflow-y-auto">
          {sellOrders.map((order, index) => (
            <OrderRow
              key={`sell-${order.price}-${index}`}
              order={order}
              isSell={true}
              maxAmount={maxAmount}
              openingPrice={openingPrice}
              currentPrice={currentPrice}
            />
          ))}
        </div>

        {/* Buy Orders */}
        <div className="overflow-y-auto">
          {buyOrders.map((order, index) => (
            <OrderRow
              key={`buy-${order.price}-${index}`}
              order={order}
              isSell={false}
              maxAmount={maxAmount}
              openingPrice={openingPrice}
              currentPrice={currentPrice}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;

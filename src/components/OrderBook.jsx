import React from "react";

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
  ];

  const buyOrders = [
    { price: 95100000, amount: 0.234, total: 22253400 },
    { price: 95000000, amount: 0.567, total: 53865000 },
    { price: 94950000, amount: 0.123, total: 11678850 },
    { price: 94900000, amount: 0.789, total: 74896100 },
    { price: 94850000, amount: 0.345, total: 32723250 },
    { price: 94800000, amount: 0.234, total: 22183200 },
    { price: 94750000, amount: 0.456, total: 43206000 },
  ];

  const formatPrice = (price) => {
    return price.toLocaleString();
  };

  const formatAmount = (amount) => {
    return amount.toFixed(3);
  };

  // Calculate max amount for bar visualization
  const maxAmount = Math.max(
    ...sellOrders.map((order) => order.amount),
    ...buyOrders.map((order) => order.amount),
  );

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-300">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-900 font-medium">호가</h3>
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
          {sellOrders.reverse().map((order, index) => (
            <div
              key={index}
              className="relative pb-px h-10 hover:bg-gray-100 cursor-pointer"
            >
              <div className="relative flex text-xs h-full">
                <span className="bg-blue-500 bg-opacity-10 pr-3 text-gray-600 font-mono w-[27.8%] text-right flex items-center justify-end relative">
                  {/* Amount background bar */}
                  <div
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 h-8 bg-blue-300 bg-opacity-30"
                    style={{ width: `${(order.amount / maxAmount) * 100}%` }}
                  />
                  <span className="relative z-10">
                    {formatAmount(order.amount)}
                  </span>
                </span>
                <span className="w-[0.2%] flex items-center"></span>
                <span className="bg-blue-500 bg-opacity-10 text-red-500 font-mono font-bold w-[24%] text-right flex items-center justify-end">
                  {formatPrice(order.price)}
                </span>
                <span
                  className="bg-blue-500 bg-opacity-10 text-red-500 font-mono w-[20%] text-center flex items-center justify-center"
                  style={{ fontSize: "11px" }}
                >
                  +0.64%
                </span>
                <span className="w-[28%] flex items-center"></span>
              </div>
            </div>
          ))}
        </div>

        {/* Buy Orders */}
        <div className="overflow-y-auto">
          {buyOrders.reverse().map((order, index) => (
            <div
              key={index}
              className="relative pb-px h-10 hover:bg-gray-100 cursor-pointer"
            >
              <div className="relative flex text-xs h-full">
                <span className="w-[28%] flex items-center"></span>
                <span className="bg-red-500 bg-opacity-10 text-blue-500 font-mono font-bold w-[24%] text-right flex items-center justify-end">
                  {formatPrice(order.price)}
                </span>
                <span
                  className="bg-red-500 bg-opacity-10 text-blue-500 font-mono w-[20%] text-center flex items-center justify-center"
                  style={{ fontSize: "11px" }}
                >
                  +0.64%
                </span>
                <span className="w-[0.2%] flex items-center"></span>
                <span className="bg-red-500 bg-opacity-10 pl-3 text-gray-600 font-mono w-[27.8%] text-left flex items-center justify-start relative">
                  {/* Amount background bar */}
                  <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-8 bg-red-300 bg-opacity-30"
                    style={{ width: `${(order.amount / maxAmount) * 100}%` }}
                  />
                  <span className="relative z-10">
                    {formatAmount(order.amount)}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;

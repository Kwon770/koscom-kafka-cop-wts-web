import React from "react";

const OrderBookHeader = () => {
  return (
    <div className="p-3 border-b border-gray-300">
      <h3 className="text-gray-900 font-medium">호가</h3>

      {/* Column Headers */}
      <div className="flex text-xs text-gray-600 mt-2">
        <span className="w-[30%] text-left">수량(BTC)</span>
        <span className="w-[40%] text-center">가격(KRW)</span>
        <span className="w-[30%] text-right">총액</span>
      </div>
    </div>
  );
};

export default OrderBookHeader;

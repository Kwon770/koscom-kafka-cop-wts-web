import React from "react";

const OrderRow = React.memo(({ order, isSell, maxAmount, openingPrice, currentPrice }) => {

  const formatPrice = (price) => {
    return price.toLocaleString();
  };

  const formatAmount = (amount) => {
    return amount.toFixed(3);
  };

  // 현재가 대비 등락률 계산
  const calculateChangeRate = (price) => {
    if (!currentPrice || currentPrice === 0) return 0;
    return ((price - currentPrice) / currentPrice) * 100;
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

  // 현재가와 일치하는지 확인
  const isCurrentPrice = currentPrice && order.price === currentPrice;
  const priceBorderClass = isCurrentPrice ? "border border-gray-900 rounded-none" : "";

  if (isSell) {
    return (
      <div
        className="relative pb-px h-12 hover:bg-gray-100 cursor-pointer transition-colors"
      >
        <div className="relative flex text-xs h-full">
          <span className="bg-blue-500 bg-opacity-10 pr-3 text-gray-600 font-mono w-[27.8%] text-right flex items-center justify-end relative">
            {/* Amount background bar */}
            <div
              className="absolute right-0 top-1/2 transform -translate-y-1/2 h-10 bg-blue-300 bg-opacity-30"
              style={{ width: `${(order.amount / maxAmount) * 100}%` }}
            />
            <span className="relative z-10">{formatAmount(order.amount)}</span>
          </span>
          <span className="w-[0.2%] flex items-center"></span>
          <div className={`bg-blue-500 bg-opacity-10 flex w-[44%] ${priceBorderClass} rounded`}>
            <span className={`${priceColor} font-mono font-bold w-[54.5%] text-right flex items-center justify-end`}>
              {formatPrice(order.price)}
            </span>
            <span
              className={`${priceColor} font-mono w-[45.5%] text-center flex items-center justify-center`}
              style={{ fontSize: "11px" }}
            >
              {changeRateText}
            </span>
          </div>
          <span className="w-[28%] flex items-center"></span>
        </div>
      </div>
    );
  } else {
    return (
      <div
        className="relative pb-px h-12 hover:bg-gray-100 cursor-pointer transition-colors"
      >
        <div className="relative flex text-xs h-full">
          <span className="w-[28%] flex items-center"></span>
          <div className={`bg-red-500 bg-opacity-10 flex w-[44%] ${priceBorderClass} rounded`}>
            <span className={`${priceColor} font-mono font-bold w-[54.5%] text-right flex items-center justify-end`}>
              {formatPrice(order.price)}
            </span>
            <span
              className={`${priceColor} font-mono w-[45.5%] text-center flex items-center justify-center`}
              style={{ fontSize: "11px" }}
            >
              {changeRateText}
            </span>
          </div>
          <span className="w-[0.2%] flex items-center"></span>
          <span className="bg-red-500 bg-opacity-10 pl-3 text-gray-600 font-mono w-[27.8%] text-left flex items-center justify-start relative">
            {/* Amount background bar */}
            <div
              className="absolute left-0 top-1/2 transform -translate-y-1/2 h-10 bg-red-300 bg-opacity-30"
              style={{ width: `${(order.amount / maxAmount) * 100}%` }}
            />
            <span className="relative z-10">{formatAmount(order.amount)}</span>
          </span>
        </div>
      </div>
    );
  }
});

export default OrderRow;

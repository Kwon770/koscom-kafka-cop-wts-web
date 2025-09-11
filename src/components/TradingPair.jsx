import React from "react";
import BitcoinIcon from "../assets/BTC.png";

const TradingPair = () => {
  return (
    <div className="h-20 bg-white px-4 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        {/* Trading Pair and Price */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <img src={BitcoinIcon} alt="비트코인 아이콘" className="w-6 h-6" />
            <span className="text-gray-900 font-bold text-lg">BTC/KRW</span>
          </div>
        </div>

        {/* Current Price */}
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-red-500">95,123,000</span>
          <span className="text-red-500">KRW</span>
        </div>
        

        {/* Price Change */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-red-500">
            <span className="font-medium">+2.31%</span>
          </div>
          <div className="flex items-center space-x-1 text-red-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span className="text-red-500 font-medium">2,153,000</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingPair;

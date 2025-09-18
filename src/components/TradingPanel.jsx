import React, { useState } from 'react'

const TradingPanel = () => {
  const [activeTab, setActiveTab] = useState('buy')
  const [orderType, setOrderType] = useState('limit')
  const [price, setPrice] = useState('95,123,000')
  const [amount, setAmount] = useState('')

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Tab Headers */}
      <div className="flex">
        <button
          onClick={() => setActiveTab('buy')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'buy'
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-gray-600 hover:text-gray-900'
          }`}
        >
          매수
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'sell'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-600 hover:text-gray-900'
          }`}
        >
          매도
        </button>
      </div>
      
      {/* Trading Form */}
      <div className="flex-1 p-4 space-y-4">
        {/* Order Type */}
        <div className="flex space-x-2">
          <button
            onClick={() => setOrderType('limit')}
            className={`flex-1 py-2 text-xs rounded ${
              orderType === 'limit'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600 hover:text-gray-900'
            }`}
          >
            지정가
          </button>
          <button
            onClick={() => setOrderType('market')}
            className={`flex-1 py-2 text-xs rounded ${
              orderType === 'market'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600 hover:text-gray-900'
            }`}
          >
            시장가
          </button>
        </div>
        
        {/* Price Input */}
        {orderType === 'limit' && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              {activeTab === 'buy' ? '매수가격' : '매도가격'} (KRW)
            </label>
            <div className="relative">
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded text-gray-900 text-right text-sm focus:outline-none focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <button className="text-blue-500 hover:text-blue-400">-1%</button>
              <button className="text-blue-500 hover:text-blue-400">-0.5%</button>
              <button className="text-blue-500 hover:text-blue-400">-0.1%</button>
              <button className="text-red-500 hover:text-red-400">+0.1%</button>
              <button className="text-red-500 hover:text-red-400">+0.5%</button>
              <button className="text-red-500 hover:text-red-400">+1%</button>
            </div>
          </div>
        )}
        
        {/* Amount Input */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            주문수량 (BTC)
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded text-gray-900 text-right text-sm focus:outline-none focus:border-blue-500"
            placeholder="0"
          />
          <div className="flex justify-between mt-2">
            {['10%', '25%', '50%', '100%'].map((percent) => (
              <button
                key={percent}
                className="flex-1 mx-0.5 py-1 text-xs text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 rounded"
              >
                {percent}
              </button>
            ))}
          </div>
        </div>
        
        {/* Total Amount */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            주문총액 (KRW)
          </label>
          <div className="p-3 bg-gray-50 border border-gray-300 rounded text-gray-900 text-right text-sm">
            0
          </div>
        </div>
        
        {/* Available Balance */}
        <div className="bg-gray-100 rounded p-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">
              {activeTab === 'buy' ? '주문가능' : '매도가능'}
            </span>
            <span className="text-gray-900">
              {activeTab === 'buy' ? '0 KRW' : '0 BTC'}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs mt-1">
            <span className="text-gray-600">수수료</span>
            <span className="text-gray-900">0.05%</span>
          </div>
        </div>
        
        {/* Order Button */}
        <button
          className={`w-full py-3 rounded font-medium text-white transition-colors ${
            activeTab === 'buy'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {activeTab === 'buy' ? '매수' : '매도'}
        </button>
      </div>
    </div>
  )
}

export default TradingPanel
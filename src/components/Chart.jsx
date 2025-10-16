import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  CrosshairMode,
  CandlestickSeries,
} from "lightweight-charts";

const generateMockData = () => {
  const data = [];
  let basePrice = 95000000;
  // 현재 시간에서 200분(200개 캔들) 전부터 시작
  let currentTime = Math.floor(Date.now() / 1000) - (200 * 60);

  for (let i = 0; i < 200; i++) {
    const trend = Math.sin(i * 0.1) * 0.008; // 트렌드 강화
    const volatility = (Math.random() - 0.5) * 0.015; // 변동성 증가
    const priceChange = trend + volatility;

    basePrice = basePrice * (1 + priceChange);

    // 스프레드 증가로 캔들 길이 늘리기
    const spreadPercent = 0.008; // 0.3% -> 0.8%로 증가
    const spread = basePrice * spreadPercent;

    const open = basePrice + (Math.random() - 0.5) * spread * 1.2;
    const close = basePrice + (Math.random() - 0.5) * spread * 1.2;

    const minPrice = Math.min(open, close);
    const maxPrice = Math.max(open, close);

    // High/Low 범위 확대
    const high = maxPrice + Math.random() * spread;
    const low = minPrice - Math.random() * spread;

    data.push({
      time: currentTime,
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close),
    });

    currentTime += 60;
  }

  return data;
};

const Chart = () => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1초");
  const [lastPrice, setLastPrice] = useState(95000000);

  // Generate new candle data
  const generateNewCandle = () => {
    const currentTime = Math.floor(Date.now() / 1000);

    // Random price movement (-2% to +2%)
    const priceChange = (Math.random() - 0.5) * 0.04;
    const newBasePrice = lastPrice * (1 + priceChange);

    // Generate OHLC data - 캔들 길이 증가
    const spread = newBasePrice * 0.008; // 0.3% -> 0.8% spread 증가
    const open = newBasePrice + (Math.random() - 0.5) * spread * 1.2;
    const close = newBasePrice + (Math.random() - 0.5) * spread * 1.2;

    const minPrice = Math.min(open, close);
    const maxPrice = Math.max(open, close);

    // High/Low 범위 확대
    const high = maxPrice + Math.random() * spread;
    const low = minPrice - Math.random() * spread;

    const newCandle = {
      time: currentTime,
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close),
    };

    setLastPrice(newCandle.close);
    return newCandle;
  };

  // Add new candle to chart
  const addNewCandle = () => {
    if (candlestickSeriesRef.current) {
      const newCandle = generateNewCandle();
      candlestickSeriesRef.current.update(newCandle);
    }
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.offsetWidth,
      height: 400,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#333",
      },
      grid: {
        vertLines: { color: "#e5e7eb" },
        horzLines: { color: "#e5e7eb" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: "#cccccc",
      },
      timeScale: {
        borderColor: "#cccccc",
        timeVisible: true,
        secondsVisible: true,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderDownColor: "#ef4444",
      borderUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      wickUpColor: "#22c55e",
    });

    const mockData = generateMockData();
    candlestickSeries.setData(mockData);

    // Set last price from the last data point
    if (mockData.length > 0) {
      setLastPrice(mockData[mockData.length - 1].close);
    }

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.offsetWidth });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // Start real-time data updates
  useEffect(() => {
    const startRealTimeUpdates = () => {
      setTimeout(() => {
        addNewCandle();
        startRealTimeUpdates(); // 재귀적으로 다음 업데이트 스케줄링
      }, 1000);
    };

    // 차트가 준비된 후 업데이트 시작
    const timer = setTimeout(() => {
      if (candlestickSeriesRef.current) {
        startRealTimeUpdates();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Chart Tools */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          {[
            "1초",
            "5초",
            "10초",
            "30초",
            "1분",
            "5분",
            "15분",
            "30분",
            "1시간",
            "1일",
          ].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedTimeframe(period)}
              className={`text-xs px-2 py-1 rounded ${
                period === selectedTimeframe
                  ? "text-white bg-blue-600"
                  : "text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Content */}
      <div className="flex-1 relative overflow-hidden">
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default Chart;

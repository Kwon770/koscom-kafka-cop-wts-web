import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  CrosshairMode,
  CandlestickSeries,
} from "lightweight-charts";
import {
  fetchInitialCandles,
  convertApiToChartData,
  convertSseToChartData,
  connectSSE,
} from "../services/candleService";
import { toKSTISOString, getCurrentKstTimestamp } from "../utils/dateUtils";

const Chart = () => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const eventSourceRef = useRef(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1초");
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const candlesDataRef = useRef([]);
  const MAX_DATA_POINTS = 1000;

  // 거래소 및 마켓 코드 설정 (환경 변수에서 가져오기)
  const exchange = import.meta.env.VITE_EXCHANGE || "UPBIT";
  const code = import.meta.env.VITE_CODE || "KRW/BTC";

  const appendCandle = useCallback(
    (candle) => {
      const nextData = [...candlesDataRef.current, candle];
      const truncated =
        nextData.length > MAX_DATA_POINTS
          ? nextData.slice(-MAX_DATA_POINTS)
          : nextData;

      candlesDataRef.current = truncated;

      if (!candlestickSeriesRef.current) return;

      const didTruncate = truncated.length !== nextData.length;
      if (truncated.length === 1 || didTruncate) {
        candlestickSeriesRef.current.setData(truncated);
      } else {
        candlestickSeriesRef.current.update(candle);
      }
    },
    [MAX_DATA_POINTS]
  );

  const replaceCandle = useCallback((index, candle) => {
    if (index < 0 || index >= candlesDataRef.current.length) return;

    const nextData = [...candlesDataRef.current];
    nextData[index] = candle;
    candlesDataRef.current = nextData;

    if (!candlestickSeriesRef.current) return;

    if (index === nextData.length - 1) {
      candlestickSeriesRef.current.update(candle);
    } else {
      candlestickSeriesRef.current.setData(nextData);
    }
  }, []);

  const insertCandleSorted = useCallback(
    (candle) => {
      const nextData = [...candlesDataRef.current, candle].sort(
        (a, b) => a.time - b.time
      );
      const truncated =
        nextData.length > MAX_DATA_POINTS
          ? nextData.slice(-MAX_DATA_POINTS)
          : nextData;

      candlesDataRef.current = truncated;

      if (candlestickSeriesRef.current) {
        candlestickSeriesRef.current.setData(truncated);
      }
    },
    [MAX_DATA_POINTS]
  );

  const fillMissingCandlesUntil = useCallback(
    (targetTimeExclusive) => {
      if (
        !candlestickSeriesRef.current ||
        candlesDataRef.current.length === 0
      ) {
        return;
      }

      let lastCandle =
        candlesDataRef.current[candlesDataRef.current.length - 1];
      const syntheticCandles = [];

      while (lastCandle.time < targetTimeExclusive - 1) {
        const nextTime = lastCandle.time + 1;
        const syntheticCandle = {
          time: nextTime,
          open: lastCandle.close,
          high: lastCandle.close,
          low: lastCandle.close,
          close: lastCandle.close,
        };

        syntheticCandles.push(syntheticCandle);
        lastCandle = syntheticCandle;
      }

      if (syntheticCandles.length === 0) return;

      let nextData = [...candlesDataRef.current, ...syntheticCandles];
      if (nextData.length > MAX_DATA_POINTS) {
        nextData = nextData.slice(-MAX_DATA_POINTS);
      }

      candlesDataRef.current = nextData;

      if (candlestickSeriesRef.current) {
        candlestickSeriesRef.current.setData(nextData);
      }
    },
    [MAX_DATA_POINTS]
  );

  // 초기 데이터 로드
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 최근 1시간 데이터 로드 (KST 기준)
      const to = new Date();
      const from = new Date(to.getTime() - 60 * 60 * 1000); // 1시간 전

      const apiData = await fetchInitialCandles(
        exchange,
        code,
        "1s",
        toKSTISOString(from),
        toKSTISOString(to)
      );

      let chartData = apiData.map(convertApiToChartData);
      if (chartData.length > MAX_DATA_POINTS) {
        chartData = chartData.slice(-MAX_DATA_POINTS);
      }
      candlesDataRef.current = chartData;

      if (candlestickSeriesRef.current) {
        candlestickSeriesRef.current.setData(chartData);
      }
    } catch (err) {
      setError(err);
      console.error("Failed to load initial candles:", err);
    } finally {
      setIsLoading(false);
    }
  }, [exchange, code]);

  // SSE로 받은 데이터를 차트에 업데이트
  const updateCandleFromSSE = useCallback(
    (sseData) => {
      if (!candlestickSeriesRef.current) return;

      const sseExchange = sseData.exchange;
      const sseCode = sseData.mkt_code ? sseData.mkt_code.join("/") : null;

      if (sseExchange !== exchange || sseCode !== code) {
        return;
      }

      const newCandle = convertSseToChartData(sseData);
      const nowTimestamp = getCurrentKstTimestamp();
      const candles = candlesDataRef.current;

      if (candles.length === 0) {
        appendCandle(newCandle);
        return;
      }

      const existingIndex = candles.findIndex(
        (item) => item.time === newCandle.time
      );

      if (existingIndex !== -1) {
        replaceCandle(existingIndex, newCandle);
        return;
      }

      const lastCandle = candles[candles.length - 1];

      if (newCandle.time < lastCandle.time) {
        const delaySeconds = nowTimestamp - newCandle.time;
        if (delaySeconds <= 5) {
          insertCandleSorted(newCandle);
        }
        return;
      }

      fillMissingCandlesUntil(newCandle.time);
      appendCandle(newCandle);
    },
    [
      appendCandle,
      exchange,
      code,
      fillMissingCandlesUntil,
      insertCandleSorted,
      replaceCandle,
    ]
  );

  // SSE 연결
  const connectSSEStream = useCallback(() => {
    // 기존 연결 종료
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const topic = "candel-1s";

    const eventSource = connectSSE(
      topic,
      // onMessage
      (sseData) => {
        updateCandleFromSSE(sseData);
      },
      // onError
      (error) => {
        console.error("SSE connection error:", error);
        setIsConnected(false);
        // 5초 후 재연결 시도
        setTimeout(() => {
          connectSSEStream();
        }, 5000);
      },
      // onConnect
      () => {
        setIsConnected(true);
      }
    );

    eventSourceRef.current = eventSource;
  }, [updateCandleFromSSE]);

  // 차트 초기화
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

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    if (candlesDataRef.current.length > 0) {
      candlestickSeries.setData(candlesDataRef.current);
    }

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.offsetWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // 초기 데이터 로드 및 SSE 연결
  useEffect(() => {
    loadInitialData().then(() => {
      // 초기 데이터 로드 완료 후 SSE 연결
      connectSSEStream();
    });

    return () => {
      // 컴포넌트 언마운트 시 SSE 연결 종료
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [loadInitialData, connectSSEStream]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!candlestickSeriesRef.current || candlesDataRef.current.length === 0) {
        return;
      }

      const nowTimestamp = getCurrentKstTimestamp();
      fillMissingCandlesUntil(nowTimestamp + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [fillMissingCandlesUntil]);

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Chart Tools */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
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
          <div className="flex items-center space-x-4 text-xs">
            <span>
              연결 상태:{" "}
              <span
                className={isConnected ? "text-green-600" : "text-red-600"}
              >
                {isConnected ? "🟢 연결됨" : "🔴 연결 끊김"}
              </span>
            </span>
            <span>데이터: {candlesDataRef.current.length}개</span>
          </div>
        </div>
      </div>

      {/* Chart Content */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="text-gray-600">데이터 로딩 중...</div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="text-red-600">
              <p>에러: {error.message}</p>
              <button
                onClick={loadInitialData}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                재시도
              </button>
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default Chart;

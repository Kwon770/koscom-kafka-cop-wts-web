import { useState, useEffect, useRef, useCallback } from "react";
import {
  fetchInitialOrderbook,
  fetchTicker,
  connectOrderbookSSE,
  transformApiOrderbook,
  transformSseOrderbook,
} from "../../services/orderbookService";
import { connectTickerSSE } from "../../services/marketService";

export const useOrderBookData = (exchange, marketCode) => {
  const [sellOrders, setSellOrders] = useState([]);
  const [buyOrders, setBuyOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [openingPrice, setOpeningPrice] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);

  const eventSourceRef = useRef(null);
  const tickerEventSourceRef = useRef(null);

  // 초기 데이터 로드
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Ticker 데이터로 시가 및 현재가 설정
      const tickerData = await fetchTicker(exchange, marketCode);
      const opening = tickerData.tradePrice - tickerData.changePrice;
      setOpeningPrice(opening);
      setCurrentPrice(tickerData.tradePrice);

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

      // exchange 필터링 (대소문자 무시)
      const sseExchange = sseData.exchange?.toUpperCase();
      const currentExchange = exchange.toUpperCase();

      const sseCode = Array.isArray(sseData.mkt_code)
        ? sseData.mkt_code.join("/")
        : null;

      if (sseExchange !== currentExchange || sseCode !== marketCode) {
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

  // Ticker SSE 데이터 업데이트
  const updateCurrentPriceFromSSE = useCallback(
    (sseData) => {
      if (!sseData) return;

      // exchange 필터링
      const sseExchange = sseData.exchange?.toUpperCase();
      const currentExchange = exchange.toUpperCase();

      if (sseExchange !== currentExchange) {
        return;
      }

      // marketCode 매칭
      const sseCode = Array.isArray(sseData.mkt_code)
        ? sseData.mkt_code.join("/")
        : null;

      if (sseCode !== marketCode) {
        return;
      }

      // tradePrice와 signedChangeRate를 이용해 시가(opening price) 역산
      if (sseData.trade_price && sseData.signed_change_rate !== undefined) {
        const tradePrice = sseData.trade_price;
        const signedChangeRate = sseData.signed_change_rate;

        // 시가 = 현재가 / (1 + 등락률)
        const calculatedOpeningPrice = tradePrice / (1 + signedChangeRate);

        setOpeningPrice(calculatedOpeningPrice);
        setCurrentPrice(tradePrice);
      }
    },
    [exchange, marketCode],
  );

  // Ticker SSE 연결
  const connectTickerSSEStream = useCallback(() => {
    if (tickerEventSourceRef.current) {
      tickerEventSourceRef.current.close();
    }

    const eventSource = connectTickerSSE(
      "ticker-basic",
      (data) => {
        updateCurrentPriceFromSSE(data);
      },
      (error) => {
        console.error("Ticker SSE connection error:", error);
        setTimeout(() => {
          connectTickerSSEStream();
        }, 5000);
      },
      () => {
        console.log("Ticker SSE connected for OrderBook");
      },
    );

    tickerEventSourceRef.current = eventSource;
  }, [updateCurrentPriceFromSSE]);

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
        window.dispatchEvent(new CustomEvent("sse-status-update", {
          detail: { topic: "orderbook-5", connected: false }
        }));
        setTimeout(() => {
          connectSSEStream();
        }, 5000);
      },
      () => {
        setIsConnected(true);
        window.dispatchEvent(new CustomEvent("sse-status-update", {
          detail: { topic: "orderbook-5", connected: true }
        }));
      },
    );

    eventSourceRef.current = eventSource;
  }, [updateOrderbookFromSSE]);

  useEffect(() => {
    loadInitialData().then(() => {
      connectSSEStream();
      connectTickerSSEStream();
    });

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (tickerEventSourceRef.current) {
        tickerEventSourceRef.current.close();
        tickerEventSourceRef.current = null;
      }
    };
  }, [loadInitialData, connectSSEStream, connectTickerSSEStream]);

  return {
    sellOrders,
    buyOrders,
    isLoading,
    error,
    openingPrice,
    currentPrice,
    loadInitialData,
  };
};

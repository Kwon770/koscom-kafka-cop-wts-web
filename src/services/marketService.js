/**
 * 마켓 목록 관련 API 서비스
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * REST API로 마켓 목록 조회
 * @param {string} exchange
 * @returns {Promise<Array<{tickerId: number, tickerCode: string, tickerName: string, tradePrice: number, changeRate: number, changePrice: number, accTradePrice: number, localDateTime: string}>>}
 */
export async function fetchMarketList(exchange) {
  const params = new URLSearchParams({
    exchange,
  });

  try {
    const response = await fetch(
      `${API_BASE_URL}/v1/markets/list?${params}`,
    );

    if (!response.ok) {
      throw new Error(
        `Market List API Error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return Array.isArray(data?.results) ? data.results : [];
  } catch (error) {
    console.error("Failed to fetch market list:", error);
    throw error;
  }
}

/**
 * SSE 연결 생성 (티커 실시간 데이터)
 * @param {string} topic
 * @param {(data: any) => void} onMessage
 * @param {(error: Event) => void} onError
 * @param {() => void} onConnect
 * @returns {EventSource}
 */
export function connectTickerSSE(topic, onMessage, onError, onConnect) {
  const url = `${API_BASE_URL}/api/sse/subscribe/${topic}`;
  const eventSource = new EventSource(url);

  eventSource.addEventListener("connected", () => {
    if (onConnect) onConnect();
  });

  const handleMessage = (event) => {
    if (!event?.data) return;
    try {
      const data = JSON.parse(event.data);
      if (onMessage) onMessage(data);
    } catch (error) {
      console.error("Failed to parse ticker SSE message:", error);
    }
  };

  eventSource.onmessage = handleMessage;
  eventSource.addEventListener("message", handleMessage);

  eventSource.onerror = (error) => {
    if (onError) onError(error);
  };

  return eventSource;
}

/**
 * SSE 티커 데이터를 UI 형식으로 변환
 * @param {Object} sseData
 * @returns {{ticker: string, price: number, change: number, changeAmount: number, volume: number}}
 */
export function transformTickerData(sseData) {
  if (!sseData) return null;

  // mkt_code는 배열 형태 ["KRW", "BTC"]로 오므로 "/"로 조인
  let formattedTicker = null;
  if (Array.isArray(sseData.mkt_code)) {
    formattedTicker = sseData.mkt_code.join("/");
  } else if (typeof sseData.mkt_code === "string") {
    // 문자열인 경우 "KRW-BTC" -> "KRW/BTC" 형식으로 변환
    formattedTicker = sseData.mkt_code.replace("-", "/");
  }

  if (!formattedTicker) return null;

  return {
    ticker: formattedTicker,
    price: sseData.trade_price || 0,
    change: (sseData.signed_change_rate || 0) * 100, // 소수를 퍼센트로 변환
    changeAmount: sseData.signed_change_price || 0,
    volume: sseData.acc_trade_price_24h || 0,
  };
}

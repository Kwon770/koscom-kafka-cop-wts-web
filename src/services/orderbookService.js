/**
 * 호가(오더북) 관련 API & SSE 서비스
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * REST API로 현재가 정보 조회
 * @param {string} exchange
 * @param {string} marketCode
 * @returns {Promise<{tickerId: number, tickerCode: string, tickerName: string, tradePrice: number, changeRate: number, changePrice: number, accTradePrice: number, localDateTime: string}>}
 */
export async function fetchTicker(exchange, marketCode) {
  const params = new URLSearchParams({
    exchange,
    marketCode,
  });

  try {
    const response = await fetch(
      `${API_BASE_URL}/v1/orderbooks/ticker?${params}`,
    );

    if (!response.ok) {
      throw new Error(
        `Ticker API Error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch ticker:", error);
    throw error;
  }
}

/**
 * REST API로 초기 호가 데이터 로드
 * @param {string} exchange
 * @param {string} marketCode
 * @returns {Promise<Array<{type: 'ASK'|'BID', price: number, quantity: number, localDateTime: string}>>}
 */
export async function fetchInitialOrderbook(exchange, marketCode) {
  const params = new URLSearchParams({
    exchange,
  });

  if (marketCode) {
    params.append("marketCode", marketCode);
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/v1/orderbooks/orderbooks-price?${params}`,
    );

    if (!response.ok) {
      throw new Error(
        `Orderbook API Error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return Array.isArray(data?.results) ? data.results : [];
  } catch (error) {
    console.error("Failed to fetch initial orderbook:", error);
    throw error;
  }
}


/**
 * SSE 연결 생성 (호가)
 * @param {string} topic
 * @param {(data: any) => void} onMessage
 * @param {(error: Event) => void} onError
 * @param {() => void} onConnect
 * @returns {EventSource}
 */
export function connectOrderbookSSE(topic, onMessage, onError, onConnect) {
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
      console.error("Failed to parse orderbook SSE message:", error);
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
 * REST API 응답을 화면용 구조로 변환
 * @param {Array} apiResults
 * @returns {{asks: Array, bids: Array, totalAskSize: number, totalBidSize: number}}
 */
export function transformApiOrderbook(apiResults) {
  if (!Array.isArray(apiResults)) {
    console.error("transformApiOrderbook: apiResults is not an array", apiResults);
    return {
      asks: [],
      bids: [],
      totalAskSize: 0,
      totalBidSize: 0,
    };
  }

  const asks = [];
  const bids = [];

  for (const item of apiResults) {
    if (!item) {
      console.warn("transformApiOrderbook: skipping null/undefined item");
      continue;
    }

    // price가 number가 아니면 변환 시도
    let price = item.price;
    if (typeof price !== "number") {
      price = Number(price);
      if (Number.isNaN(price)) {
        console.warn("transformApiOrderbook: invalid price", item);
        continue;
      }
    }

    const level = {
      price: price,
      quantity: Number(item.quantity) || 0,
      timestamp: item.localDateTime ?? null,
    };

    if (item.type === "ASK") {
      asks.push(level);
    } else if (item.type === "BID") {
      bids.push(level);
    } else {
      console.warn("transformApiOrderbook: unknown type", item.type);
    }
  }

  // API에서 이미 정렬된 상태로 반환됨
  // Ask: AskPrice1(낮음) -> AskPrice5(높음)
  // Bid: BidPrice1(높음) -> BidPrice5(낮음)

  const totalAskSize = asks.reduce((acc, cur) => acc + cur.quantity, 0);
  const totalBidSize = bids.reduce((acc, cur) => acc + cur.quantity, 0);

  return {
    asks,
    bids,
    totalAskSize,
    totalBidSize,
  };
}

/**
 * SSE 데이터를 화면용 구조로 변환
 * @param {Object} sseData
 * @returns {{asks: Array, bids: Array, totalAskSize: number, totalBidSize: number, timestamp: number}}
 */
export function transformSseOrderbook(sseData) {
  if (!sseData || !Array.isArray(sseData.OrderbookUnits)) {
    return {
      asks: [],
      bids: [],
      totalAskSize: 0,
      totalBidSize: 0,
      timestamp: sseData?.timestamp ?? null,
    };
  }

  const asks = [];
  const bids = [];

  for (const unit of sseData.OrderbookUnits) {
    if (unit?.ask_price != null && unit?.ask_size != null) {
      asks.push({
        price: unit.ask_price,
        quantity: unit.ask_size,
        timestamp: sseData.timestamp ?? null,
      });
    }
    if (unit?.bid_price != null && unit?.bid_size != null) {
      bids.push({
        price: unit.bid_price,
        quantity: unit.bid_size,
        timestamp: sseData.timestamp ?? null,
      });
    }
  }

  // API에서 이미 정렬된 상태로 반환됨
  // Ask: AskPrice1(낮음) -> AskPrice5(높음)
  // Bid: BidPrice1(높음) -> BidPrice5(낮음)

  return {
    asks,
    bids,
    totalAskSize: sseData.total_ask_size ?? 0,
    totalBidSize: sseData.total_bid_size ?? 0,
    timestamp: sseData.timestamp ?? null,
  };
}


/**
 * 캔들 차트 API 서비스
 * REST API로 초기 데이터 로드, SSE로 실시간 데이터 수신
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * 초기 캔들 데이터 로드
 * @param {string} exchange - 거래소 코드 (예: 'UPBIT')
 * @param {string} code - 마켓 코드 (예: 'KRW/BTC')
 * @param {string} type - 캔들 타입 (기본값: '1s')
 * @param {string} from - 조회 시작 시간 (ISO-8601, 선택)
 * @param {string} to - 조회 종료 시간 (ISO-8601, 선택)
 * @returns {Promise<Array>} 캔들 데이터 배열
 */
export async function fetchInitialCandles(exchange, code, type, from, to) {
  const candleType = type ?? '1s';
  const params = new URLSearchParams({
    exchange,
    code,
    type: candleType,
  });

  if (from) params.append('from', from);
  if (to) params.append('to', to);

  try {
    const response = await fetch(`${API_BASE_URL}/v1/charts/candle?${params}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Failed to fetch initial candles:', error);
    throw error;
  }
}

/**
 * API 응답을 차트 데이터로 변환
 * @param {Object} apiData - API 응답 데이터 (localDateTime은 KST 기준)
 * @returns {Object} 차트용 데이터
 */
export function convertApiToChartData(apiData) {
  // localDateTime은 KST 기준 ISO-8601 형식
  const timestamp = Math.floor(new Date(apiData.localDateTime).getTime() / 1000);
  
  return {
    time: timestamp,
    open: apiData.openPrice,
    high: apiData.highPrice,
    low: apiData.lowPrice,
    close: apiData.closePrice,
  };
}

/**
 * SSE 메시지를 차트 데이터로 변환
 * @param {Object} sseData - SSE 메시지 데이터
 * @returns {Object} 차트용 데이터
 */
export function convertSseToChartData(sseData) {
  // SSE의 candle_date_time_kst를 사용 (KST 기준)
  // KST 시간 문자열을 파싱하여 timestamp로 변환
  const kstDateTime = sseData.candle_date_time_kst;
  const timestamp = Math.floor(new Date(kstDateTime).getTime() / 1000);
  
  return {
    time: timestamp,
    open: sseData.opening_price,
    high: sseData.high_price,
    low: sseData.low_price,
    close: sseData.trade_price,
  };
}

/**
 * SSE 연결 생성
 * @param {string} topic - SSE 토픽 (예: 'candel-1s')
 * @param {Function} onMessage - 메시지 수신 콜백
 * @param {Function} onError - 에러 콜백
 * @param {Function} onConnect - 연결 성공 콜백
 * @returns {EventSource} EventSource 인스턴스
 */
export function connectSSE(topic, onMessage, onError, onConnect) {
  const url = `${API_BASE_URL}/api/sse/subscribe/${topic}`;
  const eventSource = new EventSource(url);

  // 연결 성공
  eventSource.addEventListener('connected', (event) => {
    if (onConnect) onConnect();
  });

  // 기본 메시지 핸들러 (이벤트 타입이 지정되지 않은 경우 또는 기본 message 이벤트)
  // onmessage는 addEventListener('message', ...)보다 우선순위가 낮지만,
  // 서버가 이벤트 타입 없이 보내는 경우를 처리합니다
  eventSource.onmessage = (event) => {
    // connected 이벤트가 아닌 경우에만 처리
    if (event.data && !event.data.includes('Successfully connected')) {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) {
          onMessage(data);
        }
      } catch (error) {
        console.error('Failed to parse SSE message (from onmessage):', error);
      }
    }
  };

  // 실시간 데이터 수신 (명시적 message 이벤트 타입)
  eventSource.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data);
      if (onMessage) {
        onMessage(data);
      } else {
        console.warn('onMessage callback is not defined');
      }
    } catch (error) {
      console.error('Failed to parse SSE message:', error);
    }
  });

  // 에러 처리
  eventSource.onerror = (error) => {
    console.error('SSE Error:', error);
    if (onError) onError(error);
  };

  return eventSource;
}


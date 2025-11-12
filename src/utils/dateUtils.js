/**
 * 날짜 관련 유틸리티 함수
 */

/**
 * 현재 시간을 KST 기준 ISO-8601 형식 문자열로 변환
 * @param {Date} date - 변환할 Date 객체 (기본값: 현재 시간)
 * @returns {string} KST 기준 ISO-8601 형식 문자열 (예: "2025-01-15T14:30:00+09:00")
 */
export function toKSTISOString(date = new Date()) {
  // UTC → KST 변환 (9시간 더하기)
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const kst = new Date(date.getTime() + kstOffsetMs);

  // ISO 문자열 만들기 (Z → +09:00 치환)
  const isoKst = kst.toISOString().replace('Z', '+09:00');

  return isoKst;
}

/**
 * 현재 KST 기준 타임스탬프(초)를 반환
 * @param {Date} date - 기준이 되는 Date 객체 (기본값: 현재 시간)
 * @returns {number} 1970-01-01 00:00:00 UTC 기준 초 단위 타임스탬프
 */
export function getCurrentKstTimestamp(date = new Date()) {
  return Math.floor(date.getTime() / 1000);
}


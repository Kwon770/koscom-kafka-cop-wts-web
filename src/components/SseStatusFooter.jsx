import React, { useState, useEffect } from "react";

const SseStatusFooter = () => {
  const [sseStatus, setSseStatus] = useState({
    "ticker-basic": false,
    "candel-1s": false,
    "orderbook-5": false,
  });

  useEffect(() => {
    // 전역 이벤트를 통해 SSE 연결 상태 업데이트 수신
    const handleSseStatusUpdate = (event) => {
      const { topic, connected } = event.detail;
      setSseStatus((prev) => ({
        ...prev,
        [topic]: connected,
      }));
    };

    window.addEventListener("sse-status-update", handleSseStatusUpdate);

    return () => {
      window.removeEventListener("sse-status-update", handleSseStatusUpdate);
    };
  }, []);

  const getStatusColor = (connected) => {
    return connected ? "bg-green-500" : "bg-red-500";
  };

  const getStatusText = (connected) => {
    return connected ? "연결됨" : "연결 끊김";
  };

  return (
    <div className="bg-gray-800 text-white py-1 px-4 flex items-center justify-end space-x-4 text-xs">
      <span className="text-gray-400">SSE 연결 상태:</span>
      {Object.entries(sseStatus).map(([topic, connected]) => (
        <div key={topic} className="flex items-center space-x-1">
          <span className={`w-2 h-2 rounded-full ${getStatusColor(connected)}`}></span>
          <span className="text-gray-300">{topic}</span>
          <span className={connected ? "text-green-400" : "text-red-400"}>
            ({getStatusText(connected)})
          </span>
        </div>
      ))}
    </div>
  );
};

export default SseStatusFooter;

import React, { useState, createContext, useContext } from 'react';
import { logger } from './logger';

// 建立一個 Context，讓其他元件(如 TodoList)可以拿到引爆器
export const ChaosContext = createContext({
  isChaosEnabled: false,
  triggerFailure: () => false
});

export function ChaosMonkey({ children }) {
  const [isChaosEnabled, setChaosEnabled] = useState(false);

  // 💥 核心破壞邏輯
  const triggerFailure = () => {
    // 如果沒開 Chaos 模式，就當作沒事發生
    if (!isChaosEnabled) return false;

    // 設定 40% 的機率會爆炸 (你可以調高這個數字讓 Tester 比較好測)
    const shouldFail = Math.random() < 0.4;
    
    if (shouldFail) {
      // 隨機決定是「服務崩潰 (Error)」還是「高延遲 (Latency)」
      const failureType = Math.random() < 0.5 ? 'SERVICE_ERROR' : 'HIGH_LATENCY';
      
      if (failureType === 'SERVICE_ERROR') {
        const error = new Error("🔥 Chaos Monkey: Service unavailable (503)");
        // 記錄到 Log (這樣儀表板才會變紅)
        logger.error("System Failure Injection", error);
        alert("💥 系統被 Chaos Monkey 攻擊！操作失敗！");
        return true; // 回傳 true 代表「這次操作失敗了」
      } 
      
      if (failureType === 'HIGH_LATENCY') {
        logger.warn("⚠️ Chaos Monkey: High latency detected (>2000ms)");
        // 在前端很難真的暫停時間，我們用 Log 記錄就好，不阻擋操作
        return false; 
      }
    }
    return false; // 這次運氣好，沒爆炸
  };

  return (
    <ChaosContext.Provider value={{ isChaosEnabled, setChaosEnabled, triggerFailure }}>
      {children}
      
      {/* 🔴 控制按鈕 (固定在左下角) */}
      <div style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 9999 }}>
        <button 
          onClick={() => setChaosEnabled(!isChaosEnabled)}
          style={{
            backgroundColor: isChaosEnabled ? '#ff4d4f' : '#52c41a',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '30px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isChaosEnabled ? '🐵 Stop Chaos' : '🐵 Start Chaos'}
        </button>
        {isChaosEnabled && (
          <div style={{ 
            backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', padding: '5px 10px', 
            borderRadius: '4px', marginTop: '5px', fontSize: '12px', textAlign: 'center'
          }}>
            Failure Rate: 40%
          </div>
        )}
      </div>
    </ChaosContext.Provider>
  );
}
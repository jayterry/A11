import React from 'react';
import { auth, provider } from './firebase';
import { signInWithPopup } from "firebase/auth";
import { logger } from './logger';
function Login() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      // 登入成功後，App.jsx 的 onAuthStateChanged 會自動偵測到，並切換畫面
    } catch (error) {
      console.error("登入失敗:", error);
    }
    try {
      logger.info("Auth: Login attempt started"); // <--- 記錄開始
      await signInWithPopup(auth, provider);
      logger.info("Auth: Login successful");      // <--- 記錄成功
    } catch (error) {
      logger.error("Auth: Login failed", error);  // <--- 記錄失敗
    }
  };

  return (
    <div style={{
      background: 'white',
      padding: '40px',
      borderRadius: '15px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      textAlign: 'center'
    }}>
      <h2 style={{ color: '#333', marginBottom: '10px' }}>歡迎回來</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>請登入以管理您的個人待辦事項</p>
      
      <button
        onClick={handleLogin}
        style={{
          backgroundColor: '#4285F4',
          color: 'white',
          border: 'none',
          padding: '12px 30px',
          borderRadius: '30px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          margin: '0 auto',
          boxShadow: '0 4px 6px rgba(66, 133, 244, 0.3)'
        }}
      >
        <span>G</span> 使用 Google 帳號登入
      </button>
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#aaa' }}>
        <span role="img" aria-label="lock">🔒</span> 安全連線 • Firebase Authentication
      </div>
    </div>
  );
}

export default Login;
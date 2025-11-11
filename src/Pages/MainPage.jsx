import React from 'react';
import './MainPage.css';

const Main = ({ onNavigate,onGame }) => {

  return (
    <div className="main-site">
      {/* 主站顶部导航栏 */}
      <div className="main-top-bar">
        <div className="main-logo">
          <h1>网站主站</h1>
        </div>
        <div className="main-nav">
          <button 
            className="to-personal-button"
            onClick={() => onGame()}
          >
            进入小游戏！
          </button>
          <button 
            className="to-personal-button"
            onClick={() => onNavigate('personal')}
          >
            进入个人中心
          </button>
        </div>
      </div>

      {/* 主站内容 */}
      <div className="main-content">
        <div className="welcome-section">
          <h2>欢迎来到网站主站</h2>
          <p>这里是网站的主页内容，包含各种功能和信息...</p>
          {/* 添加更多主站内容 */}
        </div>
        
        <div className="features-section">
          <div className="feature-card">
            <h3>功能一</h3>
            <p>功能一的描述</p>
          </div>
          <div className="feature-card">
            <h3>功能二</h3>
            <p>功能二的描述</p>
          </div>
          <div className="feature-card">
            <h3>功能三</h3>
            <p>功能三的描述</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
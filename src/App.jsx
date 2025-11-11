import React, { useState } from 'react';
import PersonalPage from './Pages/PersonalPage.jsx';
import Main from './Pages/MainPage.jsx'; // 假设您有 Main 组件
import Game from './Pages/Game.jsx'; // 假设您有 Main 组件
import './App.css';

const App = () => {
  const [currentView, setCurrentView] = useState('main'); // 'main' 或 'personal'
  const [personalPageProps, setPersonalPageProps] = useState({});

  // 处理导航到个人中心
  const handleNavigateToPersonal = (props = {}) => {
    setPersonalPageProps(props);
    setCurrentView('personal');
  };

  // 处理返回主站
  const handleBackToMain = () => {
    setCurrentView('main');
  };

  const handleNavigateToGame = () =>{
    setCurrentView('game');
  };

  // 处理查看其他用户主页
  const handleViewUserProfile = (userId) => {
    // 这个函数会传递给 PersonalPage，用于在个人中心内查看其他用户
    console.log('查看用户主页:', userId);
  };

  return (
    <div className="app">
      {currentView === 'main' && (
        <Main 
          onNavigate={handleNavigateToPersonal}
          onGame={handleNavigateToGame}
        />
      )}
      
      {currentView === 'personal' && (
        <PersonalPage 
          onBackToMain={handleBackToMain}
          onViewUserProfile={handleViewUserProfile}
          {...personalPageProps}
        />
      )}

      
      {currentView === 'game' && (
        <Game 
          onBackToMain={handleBackToMain}
        />
      )}
    </div>
  );
};

export default App;
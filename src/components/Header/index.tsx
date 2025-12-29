import { useState, useEffect } from 'react';
import { getAssetUrl } from '../../utils/index';
import './style.scss';

const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather] = useState({ temp: 24, type: '晴', wind: '东南风 3级' });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="dashboard-header" style={{backgroundImage: `url(${getAssetUrl('img (1).png')})`}}>
      <div className="header-weather">
        <span className="weather-icon">☀</span>
        <span className="weather-temp">{weather.temp}°C</span>
        <span className="weather-type">{weather.type}</span>
        <span className="weather-wind">{weather.wind}</span>
      </div>
      <div className="header-decoration left"></div>
      <h1 className="header-title">渝车出海 · 在途管理驾驶舱</h1>
      <div className="header-decoration right"></div>
      <div className="header-time">{formatTime(currentTime)}</div>
    </div>
  );
};

export default Header;

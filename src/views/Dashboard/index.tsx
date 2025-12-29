import { useState, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import Header from '../../components/Header';
import Panel from '../../components/Panel';
import Toast from '../../components/Toast';
import type { ToastRef } from '../../components/Toast';
import useDashboardData from '../../hooks/useDashboardData';
import { getAssetUrl } from '../../utils/index';
import type { Car } from '../../types';
import './style.scss';

const Dashboard = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const toastRef = useRef<ToastRef>(null);

  // Use custom hook for data
  const { droneStats, patrolStats, metrics, zones } = useDashboardData();

  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  useEffect(() => {
    // Boot sequence
    const bootTimer = setTimeout(() => {
      setIsBooting(false);
    }, 2000);

    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      clearTimeout(bootTimer);
    };
  }, []);

  const handleGenerateReport = () => {
    toastRef.current?.add("正在生成在途管理报告...请稍候", "info");
    setTimeout(() => {
      toastRef.current?.add("报告生成成功！已发送至管理端。", "success");
    }, 2000);
  };

  const handleExceptionAction = () => {
    toastRef.current?.add("已将异常处置建议发送至调度中心", "warning");
  };

  const handleCarClick = (car: Car) => {
    setSelectedCar(car);
  };

  const closeCarModal = () => {
    setSelectedCar(null);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const getBarOption = () => ({
    grid: { top: 20, bottom: 20, left: 40, right: 20 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['正常', '异常'],
      axisLabel: { color: '#fff' },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)', type: 'dashed' } },
      axisLabel: { color: '#aaa' }
    },
    series: [
      {
        data: [
          {
            value: 180,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#00ffaa' },
                { offset: 1, color: 'rgba(0, 255, 170, 0.1)' }
              ])
            }
          },
          {
            value: 20,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#ff4444' },
                { offset: 1, color: 'rgba(255, 68, 68, 0.1)' }
              ])
            }
          }
        ],
        type: 'bar',
        barWidth: '30%',
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        itemStyle: {
          borderRadius: [5, 5, 0, 0]
        }
      }
    ]
  });

  return (
    <div className={`dashboard-container ${isFullScreen ? 'fullscreen' : ''}`} style={{ backgroundImage: `url("${getAssetUrl('img (29).png')}")` }}>
      <Toast ref={toastRef} />
      {isBooting && (
        <div className="boot-screen">
          <div className="boot-content">
            <div className="spinner-tech"></div>
            <div className="boot-text">SYSTEM INITIALIZING...</div>
            <div className="boot-progress"></div>
          </div>
        </div>
      )}

      {selectedCar && (
        <div className="modal-backdrop" onClick={closeCarModal}>
          <div className="tech-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">车辆详情</span>
              <span className="close-btn" onClick={closeCarModal}>×</span>
            </div>
            <div className="modal-content">
              <div className="car-detail-row">
                <span className="label">车辆编号:</span>
                <span className="value">{selectedCar.id}</span>
              </div>
              <div className="car-detail-row">
                <span className="label">当前位置:</span>
                <span className="value">{selectedCar.zone}区 - 第{selectedCar.row}行 - 第{selectedCar.col}列</span>
              </div>
              <div className="car-detail-row">
                <span className="label">车辆状态:</span>
                <span className={`value ${selectedCar.status === 'abnormal' ? 'red' : 'green'}`}>{selectedCar.status === 'abnormal' ? '异常' : '正常'}</span>
              </div>
              <div className="car-detail-row">
                <span className="label">电池电量:</span>
                <span className="value">87%</span>
              </div>
              <div className="car-detail-row">
                <span className="label">装载货物:</span>
                <span className="value">
                  <div className="cargo-list">
                    {selectedCar.cargo.map((box, idx) => (
                      <img key={idx} src={getAssetUrl(box)} alt="cargo" className="cargo-img" />
                    ))}
                  </div>
                </span>
              </div>
              {selectedCar.status === 'abnormal' && (
                <div className="abnormal-info">
                  <div className="warning-title">⚠️ 异常检测</div>
                  <div className="warning-desc">检测到{selectedCar.abnormalReason || '未知异常'}，请立即检查。</div>
                  <button className="dispatch-btn">派遣无人机复核</button>
                </div>
              )}
            </div>
            <div className="corner-tl"></div>
            <div className="corner-tr"></div>
            <div className="corner-bl"></div>
            <div className="corner-br"></div>
          </div>
        </div>
      )}

      <div className="fullscreen-toggle" onClick={toggleFullScreen}>
        {isFullScreen ? '↙' : '↗'}
      </div>
      <Header />
      <div className="dashboard-content">
        {/* Left Column */}
        <div className="column left-col">
          <Panel className="panel-h-sm panel-1" title="无人机任务统计">
            <div className="task-stats">
              <div className="chart-ring">
                <img src={getAssetUrl("drone.png")} alt="drone" className="drone-img" />
              </div>
              <div className="stats-list">
                <div className="stat-item">
                  <span className="label">任务总数(个)</span>
                  <span className="value">{droneStats.total}</span>
                </div>
                <div className="stat-item">
                  <span className="label">已完成任务数(个)</span>
                  <span className="value green">{droneStats.completed}</span>
                </div>
                <div className="stat-item">
                  <span className="label">未完成任务数(个)</span>
                  <span className="value orange">{droneStats.uncompleted}</span>
                </div>
              </div>
            </div>
          </Panel>
          <Panel title="无人机巡航视频" className="panel-h-md">
            <div className="video-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="video-item">
                  <div className="video-placeholder" style={{ backgroundImage: `url('${getAssetUrl(`img (${20 + i}).png`)}')`, backgroundSize: 'cover' }}>
                    <div className="video-overlay">
                      <div className="rec-indicator">● REC</div>
                      <div className="video-time">09:41:2{i}</div>
                    </div>
                    <div className="play-icon">▶</div>
                  </div>
                  <div className="video-label">SN-100{20 + i}</div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="无人机巡航统计" className="panel-h-sm">
            <div className="patrol-stats">
              <div className="efficiency">
                <div className="icon-box">✈</div>
                <div className="info">
                  <div className="label">排查总数</div>
                  <div className="value">{patrolStats.total}</div>
                </div>
              </div>
              <div className="chart-container" style={{ flex: 1, minHeight: 0 }}>
                <ReactECharts option={getBarOption()} style={{ height: '100%', width: '100%' }} />
              </div>
              <div className="bottom-stats">
                <div className="stat-box">
                  <div className="label">消防设施</div>
                  <div className="value">{patrolStats.fire}</div>
                  <div className="sub">正常/全部: {patrolStats.fire}/{patrolStats.fire}</div>
                </div>
                <div className="stat-box">
                  <div className="label">装卸通道</div>
                  <div className="value">{patrolStats.loading}</div>
                  <div className="sub">正常/全部: {patrolStats.loading}/{patrolStats.loading}</div>
                </div>
                <div className="stat-box">
                  <div className="label">车辆间距</div>
                  <div className="value red">{patrolStats.spacing}</div>
                  <div className="sub">正常/全部: {patrolStats.spacing}/{patrolStats.spacing}</div>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Center Column */}
        <div className="column center-col">
          <div className="top-metrics">
            <div className="metric-card left-bg">
              <div className="info">
                <div className="label">识别准确率</div>
                <div className="value">{metrics.accuracy}%</div>
              </div>
            </div>
            <div className="metric-card right-bg">
              <div className="info">
                <div className="label">识别误报率</div>
                <div className="value">&lt; {metrics.falseAlarm}%</div>
              </div>
            </div>
          </div>

          <Panel title="在途车辆状态总览" className="panel-h-lg">
            <div className="car-grid-container">
              {zones.map((zone) => (
                <div key={zone.name} className="zone-section">
                  <div className="zone-label">{zone.name}</div>
                  <div className="zone-grid">
                    {zone.cars.map((car, i) => {
                      const isAbnormal = car.status === 'abnormal';
                      return (
                        <div
                          key={i}
                          className={`car-item ${isAbnormal ? 'abnormal' : ''}`}
                          onClick={() => handleCarClick(car)}
                        >
                          <img
                            src={getAssetUrl(isAbnormal ? 'car_warning.png' : 'car.png')}
                            className="car-icon-img"
                            alt="car"
                          />
                          {isAbnormal && (
                            <div className="alert-popup">
                              <div className="alert-header">异常警告 <span className="close">×</span></div>
                              <div className="alert-content">
                                <div>车辆: {car.id}</div>
                                <div>位置: {car.zone}-行{car.row}-列{car.col}</div>
                                <div>异常: {car.abnormalReason}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <div className="bottom-status-row">
            <Panel title="无人机状态" className="panel-half">
              <div className="device-status-list">
                {[1, 2, 3].map(i => (
                  <div key={i} className="device-item">
                    <img src={getAssetUrl('drone.png')} className="device-icon-img" alt="drone" />
                    <div className="device-name">#{i}</div>
                    <div className={`device-state ${i === 3 ? 'charging' : 'patrolling'}`}>
                      {i === 3 ? '充电中' : '巡检中'}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="机器狗状态" className="panel-half">
              <div className="device-status-list">
                {[1, 2, 3].map(i => (
                  <div key={i} className="device-item">
                    <img src={getAssetUrl('dog.png')} className="device-icon-img" alt="robot dog" />
                    <div className="device-name">#{i}</div>
                    <div className={`device-state ${i === 3 ? 'charging' : 'patrolling'}`}>
                      {i === 3 ? '充电中' : '巡检中'}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="action-buttons">
            <button className="action-btn primary" onClick={handleGenerateReport}>生成在途报告</button>
            <button className="action-btn warning" onClick={handleExceptionAction}>异常处置建议 <span className="badge">3</span></button>
          </div>
        </div>

        {/* Right Column */}
        <div className="column right-col">
          <Panel title="机器狗巡检任务" className="panel-h-sm">
            <div className="task-stats">
              <div className="dog-model">
                {/* Using an image asset as placeholder for the robot dog */}
                <div className="model-display" style={{ backgroundImage: `url('${getAssetUrl('img (8).png')}')` }}></div>
              </div>
              <div className="stats-list right-align">
                <div className="stat-item">
                  <span className="label">今日任务数(个)</span>
                  <span className="value">500</span>
                </div>
                <div className="stat-item">
                  <span className="label">已完成任务数(个)</span>
                  <span className="value green">300</span>
                </div>
                <div className="stat-item">
                  <span className="label">未完成任务数(个)</span>
                  <span className="value orange">200</span>
                </div>
              </div>
            </div>
          </Panel>
          <Panel title="机器狗巡检视频" className="panel-h-md">
            <div className="video-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="video-item">
                  <div className="video-placeholder" style={{ backgroundImage: `url('${getAssetUrl(`img (${10 + i}).png`)}')`, backgroundSize: 'cover' }}>
                    <div className="video-overlay">
                      <div className="rec-indicator">● REC</div>
                      <div className="video-time">09:41:3{i}</div>
                    </div>
                    <div className="play-icon">▶</div>
                  </div>
                  <div className="video-label">SN-101{80 + i}</div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="区域巡检统计" className="panel-h-sm">
            <div className="area-stats">
              <div className="area-row abnormal">
                <div className="area-name">A区</div>
                <div className="area-info">
                  <div className="status-text">4处异常</div>
                  <div className="detail-text">车门未关、车胎漏气 等其他问题</div>
                </div>
              </div>
              <div className="area-row normal">
                <div className="area-name">B区</div>
                <div className="area-info">
                  <div className="status-text">正常</div>
                  <div className="detail-text">检查中</div>
                </div>
              </div>
              <div className="area-row normal">
                <div className="area-name">C区</div>
                <div className="area-info">
                  <div className="status-text">正常</div>
                  <div className="detail-text">已检查完毕</div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

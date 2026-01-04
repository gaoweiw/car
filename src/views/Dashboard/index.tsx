import { useState, useEffect, useRef } from 'react';
// import ReactECharts from 'echarts-for-react';
// import * as echarts from 'echarts';
import Header from '../../components/Header';
import Panel from '../../components/Panel';
import Toast from '../../components/Toast';
import type { ToastRef } from '../../components/Toast';
import useDashboardData from '../../hooks/useDashboardData';
import { getAssetUrl } from '../../utils/index';
import type { Car } from '../../types';
import { Icon } from '@iconify/react';
import './style.scss';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const toastRef = useRef<ToastRef>(null);
  const navigate = useNavigate();

  // Use custom hook for data
  const { droneStats, dogStats, patrolStats, metrics, zones } = useDashboardData();

  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(() => new Set());

  const dismissAlert = (carId: string) => {
    setDismissedAlertIds(prev => {
      const next = new Set(prev);
      next.add(carId);
      return next;
    });
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
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

  // Add navigation to logistics dashboard
  const goToLogistics = () => {
    window.location.href = '/logistics';
  };

  // const getBarOption = () => ({
  //   grid: { top: 20, bottom: 20, left: 40, right: 20 },
  //   tooltip: { trigger: 'axis' },
  //   xAxis: {
  //     type: 'category',
  //     data: ['正常', '异常'],
  //     axisLabel: { color: '#fff' },
  //     axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
  //     axisTick: { show: false }
  //   },
  //   yAxis: {
  //     type: 'value',
  //     splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)', type: 'dashed' } },
  //     axisLabel: { color: '#aaa' }
  //   },
  //   series: [
  //     {
  //       data: [
  //         {
  //           value: 180,
  //           itemStyle: {
  //             color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
  //               { offset: 0, color: '#00ffaa' },
  //               { offset: 1, color: 'rgba(0, 255, 170, 0.1)' }
  //             ])
  //           }
  //         },
  //         {
  //           value: 20,
  //           itemStyle: {
  //             color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
  //               { offset: 0, color: '#ff4444' },
  //               { offset: 1, color: 'rgba(255, 68, 68, 0.1)' }
  //             ])
  //           }
  //         }
  //       ],
  //       type: 'bar',
  //       barWidth: '30%',
  //       showBackground: true,
  //       backgroundStyle: {
  //         color: 'rgba(255, 255, 255, 0.05)'
  //       },
  //       itemStyle: {
  //         borderRadius: [5, 5, 0, 0]
  //       }
  //     }
  //   ]
  // });

  return (
    <div className={`dashboard-container ${isFullScreen ? 'fullscreen' : ''}`} style={{ backgroundImage: `url("${getAssetUrl('img (29).png')}")` }}>
      <Toast ref={toastRef} />

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
              {selectedCar.status === 'abnormal' && (
                <div className="abnormal-info">
                  <div className="warning-title">⚠️ 异常检测</div>
                  <div className="warning-desc">检测到{selectedCar.abnormalReason || '未知异常'}，请立即检查。</div>
                  <button className="dispatch-btn">派遣无人机复核</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="fullscreen-toggle" onClick={toggleFullScreen}>
        {isFullScreen ? (
          <Icon fontSize={32} icon="mdi:fullscreen-exit" />
        ) : (
          <Icon fontSize={32} icon="mdi:fullscreen" />
        )}
      </div>

      <div className="back-toggle" onClick={() => navigate('/logistics')} title="切换">
        <Icon fontSize={32} icon="material-symbols:switch-left" />
      </div>

      <Header />
      <div className="dashboard-content">
        {/* Left Column */}
        <div className="column left-col">
          <Panel className="panel-h-sm" title="无人机任务统计">
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
            <div className="patrol-overview">
              <div className="patrol-top">
                <div className="patrol-icon">
                  <img src={getAssetUrl('drone_icon.png')} alt="drone" />
                </div>

                <div className="patrol-total">
                  <div className="patrol-total-label">排查总数</div>
                  <div className="patrol-total-value">{patrolStats.total}</div>
                </div>

                <div className="patrol-progress">
                  <div className="patrol-progress-title">
                    <span className="t">排查正常数量</span>
                    <span className="t">排查异常数量</span>
                  </div>
                  <div className="patrol-progress-bar">
                    <div className="fill ok" style={{ width: `${Math.max(0, Math.min(100, ((patrolStats.total - patrolStats.fire - patrolStats.loading - patrolStats.spacing) / patrolStats.total) * 100))}%` }} />
                    <div className="fill bad" style={{ width: `${Math.max(0, Math.min(100, ((patrolStats.fire + patrolStats.loading + patrolStats.spacing) / patrolStats.total) * 100))}%` }} />
                    <div className="scan" />
                  </div>
                  <div className="patrol-progress-title">
                    <span className="v green">{patrolStats.total - patrolStats.fire - patrolStats.loading - patrolStats.spacing}</span>
                    <span className="v red">{patrolStats.fire + patrolStats.loading + patrolStats.spacing}</span>
                  </div>
                </div>
              </div>

              <div className="patrol-cards">
                <div className="patrol-card">
                  <div className="patrol-card-title">消防设施</div>
                  <div className="patrol-card-value">{patrolStats.fire}</div>
                  <div className="patrol-card-sub">正常/全部：<span className="green">{patrolStats.fire}/{patrolStats.fire}</span></div>
                </div>
                <div className="patrol-card">
                  <div className="patrol-card-title">装卸通道</div>
                  <div className="patrol-card-value">{patrolStats.loading}</div>
                  <div className="patrol-card-sub">正常/全部：<span className="green">{patrolStats.loading}/{patrolStats.loading}</span></div>
                </div>
                <div className="patrol-card">
                  <div className="patrol-card-title">车辆间距</div>
                  <div className="patrol-card-value red">{patrolStats.spacing}</div>
                  <div className="patrol-card-sub">正常/全部：<span className="green">{patrolStats.spacing}/{patrolStats.spacing}</span></div>
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

          <Panel title="在途车辆状态总览" className="panel-half">
            <div className="car-grid-container">
              {zones.map((zone) => (
                <div key={zone.name} className="zone-section">
                  <div className="zone-label">{zone.name}</div>
                  <div className="zone-grid">
                    {zone.cars.map((car, i) => {
                      const isAbnormal = car.status === 'abnormal';
                      const isAlertDismissed = dismissedAlertIds.has(car.id);

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
                          {isAbnormal && !isAlertDismissed && (
                            <div className="alert-popup" onClick={e => e.stopPropagation()}>
                              <div className="alert-header">
                                异常警告
                                <button
                                  type="button"
                                  className="alert-close"
                                  onClick={() => dismissAlert(car.id)}
                                  aria-label="关闭"
                                >
                                  ×
                                </button>
                              </div>
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
                    <div className="device-name">#{i}</div>
                    <div className={`device-state ${i === 3 ? 'charging' : 'patrolling'}`}>
                      {i === 3 ? '充电中' : '巡检中'}
                    </div>
                    <img src={i === 3 ? getAssetUrl('drone_charging.png') : getAssetUrl('drone_patrolling.png')} className="device-icon-img" alt="drone" />
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="机器狗状态" className="panel-half">
              <div className="device-status-list">
                {[1, 2, 3].map(i => (
                  <div key={i} className="device-item">
                    <div className="device-name">#{i}</div>
                    <div className={`device-state ${i === 3 ? 'charging' : 'patrolling'}`}>
                      {i === 3 ? '充电中' : '巡检中'}
                    </div>
                    <img src={i === 3 ? getAssetUrl('dog_charging.png') : getAssetUrl('dog_patrolling.png')} className="device-icon-img" alt="robot dog" />
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Footer action area */}
          <div className="dashboard-footer">
            <div className="action-buttons">
              <button className="action-btn primary" onClick={handleGenerateReport}>
                生成在途报告
              </button>
              <button className="action-btn warning" onClick={handleExceptionAction}>
                异常处置建议 <div className="badge">3</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="column right-col">
          <Panel title="机器狗巡检任务" className="panel-h-sm">
            <div className="task-stats">
              <div className="chart-ring">
                <img src={getAssetUrl("dog.png")} alt="robot dog" className="dog-img" />
              </div>
              <div className="stats-list">
                <div className="stat-item">
                  <span className="label">任务总数(个)</span>
                  <span className="value">{dogStats.total}</span>
                </div>
                <div className="stat-item">
                  <span className="label">已完成任务数(个)</span>
                  <span className="value green">{dogStats.completed}</span>
                </div>
                <div className="stat-item">
                  <span className="label">未完成任务数(个)</span>
                  <span className="value orange">{dogStats.uncompleted}</span>
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
              <div className="area-row normal">
                <div className="area-name">A区</div>
                <div className="area-info">
                  <div className="status-text">正常</div>
                  <div className="detail-text">检查中</div>
                </div>
              </div>
              <div className="area-row abnormal">
                <div className="area-name">B区</div>
                <div className="area-info">
                  <div className="status-text">4处异常</div>
                  <div className="detail-text">车门未关、车胎漏气 等其他问题</div>
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
            <div style={{ marginTop: '10px', textAlign: 'center' }}>
              <button
                onClick={goToLogistics}
                style={{
                  background: 'rgba(0, 246, 255, 0.1)',
                  border: '1px solid rgba(0, 246, 255, 0.3)',
                  color: '#00f6ff',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                查看国际物流态势 &gt;
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

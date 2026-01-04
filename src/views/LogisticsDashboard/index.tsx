import { useEffect, useMemo, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import Header from '../../components/Header';
import Panel from '../../components/Panel';
import { getAssetUrl, getJsonUrl } from '../../utils';
import './style.scss';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

type OrderRow = {
  id: string;
  name: string;
  content: string;
  status: 'warning' | 'normal';
};

type BrandRow = {
  name: string;
  value: number;
  icon: string;
  colorClass: string;
};

const LogisticsDashboard = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const [isHoveringTable, setIsHoveringTable] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [donutChartInstance, setDonutChartInstance] = useState<echarts.ECharts | null>(null);
  const navigate = useNavigate();
  // 模拟鼠标依次滑过饼图各部分
  useEffect(() => {
    if (!donutChartInstance) return;

    let currentIndex = -1;

    const interval = setInterval(() => {
      const option = donutChartInstance.getOption() as echarts.EChartsOption;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const series = option?.series as any[];
      const dataLen = series?.[0]?.data?.length || 4;

      // 取消之前的高亮
      donutChartInstance.dispatchAction({
        type: 'downplay',
        seriesIndex: 0,
        dataIndex: currentIndex
      });

      currentIndex = (currentIndex + 1) % dataLen;

      // 高亮当前扇区
      donutChartInstance.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex: currentIndex
      });

      // 显示 tooltip
      donutChartInstance.dispatchAction({
        type: 'showTip',
        seriesIndex: 0,
        dataIndex: currentIndex
      });
    }, 3000); // 每3秒切换一次

    return () => {
      clearInterval(interval);
      // 清除高亮状态
      if (!donutChartInstance.isDisposed()) {
        donutChartInstance.dispatchAction({
          type: 'downplay',
          seriesIndex: 0
        });
        donutChartInstance.dispatchAction({
          type: 'hideTip'
        });
      }
    };
  }, [donutChartInstance]);

  // 注册 ECharts 世界地图（GeoJSON）
  useEffect(() => {
    let cancelled = false;

    const register = async () => {
      try {
        // 运行期从 CDN 拉取 world GeoJSON（如果你希望离线/内网部署，可改为本地 assets json）
        const res = await fetch(getJsonUrl('world.json'));
        if (!res.ok) return;
        const geoJson = await res.json();
        if (cancelled) return;

        echarts.registerMap('world', geoJson);
        setIsMapLoaded(true);
      } catch (e) {
        console.error('Map load failed', e);
      }
    };

    register();
    return () => {
      cancelled = true;
    };
  }, []);

  const mapCenter = useMemo(() => [70, 30] as [number, number], []);

  const mapOption = useMemo(() => {
    const hub: [number, number] = [106.55, 29.56]; // 重庆

    type LineDatum = {
      fromName: string;
      toName: string;
      coords: [[number, number], [number, number]];
      value: number;
    };

    const geoPoints: Record<string, [number, number]> = {
      重庆: hub,
      莫斯科: [37.6173, 55.7558],
      曼谷: [100.5018, 13.7563],
      河内: [105.8342, 21.0278],
      万象: [102.6331, 17.9757],
    };

    const routes = [
      { from: '重庆', to: '莫斯科', value: 80 },
      { from: '重庆', to: '曼谷', value: 55 },
      { from: '重庆', to: '河内', value: 42 },
      { from: '重庆', to: '万象', value: 38 },
    ];

    const lineData: LineDatum[] = routes
      .map((r): LineDatum | null => {
        const from = geoPoints[r.from];
        const to = geoPoints[r.to];
        if (!from || !to) return null;
        return {
          fromName: r.from,
          toName: r.to,
          coords: [from, to],
          value: r.value,
        };
      })
      .filter((x): x is LineDatum => x !== null);

    const scatterData = Object.entries(geoPoints).map(([name, coord]) => ({
      name,
      value: [...coord, name === '重庆' ? 120 : 60] as [number, number, number],
    }));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0,0,0,0.82)',
        borderColor: '#00f6ff',
        textStyle: { color: '#fff' },
      },
      geo: {
        map: 'world',
        roam: true,
        center: mapCenter,
        zoom: 1.1,
        scaleLimit: { min: 1, max: 6 },
        itemStyle: {
          areaColor: 'rgba(7, 28, 52, 0.65)',
          borderColor: 'rgba(0, 246, 255, 0.25)',
          borderWidth: 0.8,
        },
        emphasis: {
          itemStyle: {
            areaColor: 'rgba(0, 246, 255, 0.10)',
            borderColor: 'rgba(0, 246, 255, 0.55)',
          },
          label: { show: false },
        },
        silent: false,
      },
      series: [
        {
          name: '航线',
          type: 'lines',
          coordinateSystem: 'geo',
          zlevel: 2,
          effect: {
            show: true,
            period: 5,
            trailLength: 0.2,
            symbol: 'arrow',
            symbolSize: 7,
            color: '#ffd36a',
          },
          lineStyle: {
            color: 'rgba(255, 211, 106, 0.85)',
            width: 2,
            opacity: 0.55,
            curveness: 0.25,
            shadowBlur: 10,
            shadowColor: 'rgba(255, 211, 106, 0.35)',
          },
          data: lineData,
        },
        {
          name: '节点',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          zlevel: 3,
          rippleEffect: {
            brushType: 'stroke',
            scale: 3.5,
          },
          itemStyle: {
            color: '#00f6ff',
            shadowBlur: 14,
            shadowColor: 'rgba(0, 246, 255, 0.5)',
          },
          symbolSize: (val: unknown) => {
            const v = val as [number, number, number] | undefined;
            return (v?.[2] ?? 0) > 100 ? 12 : 8;
          },
          label: {
            show: true,
            formatter: '{b}',
            color: 'rgba(188, 224, 255, 0.9)',
            fontSize: 11,
            position: 'right',
          },
          data: scatterData,
        },
      ],
    } as echarts.EChartsOption;
  }, [mapCenter]);

  const orders = useMemo<OrderRow[]>(
    () => [
      { id: '1', name: 'CKG-8821', content: '中俄铁路货物转作业环节需人工介入处理', status: 'warning' },
      { id: '2', name: 'CKG-8822', content: '正常运输中', status: 'normal' },
      { id: '3', name: 'CKG-8823', content: '正常运输中', status: 'normal' },
      { id: '4', name: 'CKG-8824', content: '正常运输中', status: 'normal' },
      { id: '5', name: 'CKG-8825', content: '正常运输中', status: 'normal' },
      { id: '6', name: 'CKG-8826', content: '正常运输中', status: 'normal' },
      { id: '7', name: 'CKG-8827', content: '正常运输中', status: 'normal' },
      { id: '8', name: 'CKG-8828', content: '正常运输中', status: 'normal' },
      { id: '9', name: 'CKG-8829', content: '正常运输中', status: 'normal' },
      { id: '10', name: 'CKG-8830', content: '正常运输中', status: 'normal' },
    ],
    [],
  );

  const brands = useMemo<BrandRow[]>(
    () => [
      { name: '比亚迪BYD', value: 98354, icon: 'logistics/one.png', colorClass: 'c1' },
      { name: '华为问界', value: 46546, icon: 'logistics/two.png', colorClass: 'c2' },
      { name: '长安汽车', value: 15984, icon: 'logistics/three.png', colorClass: 'c3' },
      { name: '赛力斯', value: 9980, icon: 'logistics/other.png', colorClass: 'c4' },
      { name: '长城', value: 7652, icon: 'logistics/other.png', colorClass: 'c5' },
    ],
    [],
  );

  const donutOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0,0,0,0.8)',
      borderColor: '#00f6ff',
      textStyle: { color: '#fff' },
      padding: 10,
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '0',
      left: 'center',
      textStyle: { color: '#bce0ff', fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
      icon: 'circle',
      padding: [10, 0, 0, 0],
    },
    series: [
      {
        name: '订单分布',
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#111',
          borderWidth: 2,
        },
        label: { show: false },
        data: [
          { value: 35, name: '俄罗斯', itemStyle: { color: '#00f6ff' } },
          { value: 25, name: '老挝', itemStyle: { color: '#026bff' } },
          { value: 25, name: '泰国', itemStyle: { color: '#ffd36a' } },
          { value: 15, name: '越南', itemStyle: { color: '#00ffaa' } },
        ],
      },
    ],
  } as echarts.EChartsOption), []);

  const lineOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.8)',
      borderColor: '#00f6ff',
      textStyle: { color: '#fff' },
      padding: 10,
    },
    legend: {
      data: ['铁路', '海运', '公路'],
      textStyle: { color: '#bce0ff', fontSize: 11 },
      top: 0,
      right: 0,
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 4,
    },
    grid: {
      left: '2%',
      right: '4%',
      bottom: '2%',
      top: '30px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLabel: { color: '#8aa', fontSize: 11 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#8aa', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)', type: 'dashed' } },
    },
    series: [
      {
        name: '铁路',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color: '#00f6ff', shadowColor: 'rgba(0, 246, 255, 0.5)', shadowBlur: 8 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(0, 246, 255, 0.3)' }, { offset: 1, color: 'rgba(0, 246, 255, 0)' }],
          },
        },
        data: [120, 132, 101, 134, 90, 230, 210, 182, 191, 234, 290, 330],
      },
      {
        name: '海运',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color: '#026bff', shadowColor: 'rgba(2, 107, 255, 0.5)', shadowBlur: 8 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(2, 107, 255, 0.3)' }, { offset: 1, color: 'rgba(2, 107, 255, 0)' }],
          },
        },
        data: [220, 182, 191, 234, 290, 330, 310, 282, 291, 334, 390, 430],
      },
      {
        name: '公路',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color: '#ffd36a', shadowColor: 'rgba(255, 211, 106, 0.5)', shadowBlur: 8 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(255, 211, 106, 0.3)' }, { offset: 1, color: 'rgba(255, 211, 106, 0)' }],
          },
        },
        data: [150, 232, 201, 154, 190, 330, 410, 332, 301, 334, 390, 420],
      },
    ],
  } as echarts.EChartsOption), []);

  useEffect(() => {
    const handleFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen?.();
    }
  };
  // Auto-scroll table
  useEffect(() => {
    const el = tableRef.current;
    if (!el) return;

    let scrollPos = 0;
    let rafId: number;

    const scroll = () => {
      if (!isHoveringTable) {
        scrollPos += 0.5;
        // Reset when scrolled halfway (since we duplicate data)
        if (scrollPos >= el.scrollHeight / 2) {
          scrollPos = 0;
        }
        el.scrollTop = scrollPos;
      }
      rafId = requestAnimationFrame(scroll);
    };

    rafId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(rafId);
  }, [isHoveringTable, orders]);

  return (
    <div
      className={`logistics-dashboard ${isFullScreen ? 'fullscreen' : ''}`}
      style={{ backgroundImage: `url("${getAssetUrl('logistics/map.png')}")`, backgroundPosition: 'center 26px', backgroundSize: '90%', backgroundRepeat: 'no-repeat' }}
    >
      <div className="fullscreen-toggle" onClick={toggleFullScreen} title="全屏">
        {isFullScreen ? (
          <Icon fontSize={32} icon="mdi:fullscreen-exit" />
        ) : (
          <Icon fontSize={32} icon="mdi:fullscreen" />
        )}
      </div>

      <div className="back-toggle" onClick={() => navigate('/')} title="切换">
        <Icon fontSize={32} icon="material-symbols:switch-right" />
      </div>

      <Header
        title="渝车出海 · 智能物流驾驶舱"
      />

      <div className="logistics-content">
        <div className="col left">
          <Panel title="运输情况统计" className="panel-h-lg logistics-title">
            <div className="kpi-block">
              <div className="kpi kpi-1">
                <div className="kpi-icon">
                  <img src={getAssetUrl('logistics/order_icon.png')} alt="order" />
                </div>
                <div className="kpi-main">
                  <div className="kpi-label">全年订单完成总数</div>
                  <div className="kpi-value">20000 <span>单</span></div>
                </div>
              </div>

              <div className="dual-bar">
                <div className="dual-legend">
                  <div className="lg">
                    <span className="dot normal" />
                    <span className="txt">正常完成</span>
                    <span className="num">15000 <i>单</i></span>
                  </div>
                  <div className="lg">
                    <span className="dot uncompleted" />
                    <span className="txt">未完成</span>
                    <span className="num">5000 <i>单</i></span>
                  </div>
                </div>

                <div className="combine-bar" aria-label="订单完成进度">
                  <div className="seg normal" style={{ width: '75%' }} />
                  <div className="seg uncompleted" style={{ width: '25%' }} />
                  <div className="glow" aria-hidden="true" />
                </div>
              </div>

              <div className="transport-cards">
                <div className="transport-card">
                  <img src={getAssetUrl('logistics/way_icon.png')} alt="way" />
                  <div className="meta">
                    <div className="label">在途车辆</div>
                    <div className="value">14580 <span>辆</span></div>
                  </div>
                </div>
                <div className="transport-card">
                  <img src={getAssetUrl('logistics/arrive_icon.png')} alt="arrive" />
                  <div className="meta">
                    <div className="label">达到车辆</div>
                    <div className="value">12000 <span>辆</span></div>
                  </div>
                </div>
              </div>

              <div className="mini-metrics">
                {[
                  { label: '商品年订单配送率', value: '98%', tone: 'green' },
                  { label: '商品年时效达标率', value: '100%', tone: 'green' },
                  { label: '在途信息正确率', value: '100%', tone: 'green' },
                  { label: '商品年货损率', value: '0.13%', tone: 'orange' },
                ].map((x) => (
                  <div key={x.label} className="mini-metric">
                    <div className="label">{x.label}</div>
                    <div className={`value ${x.tone}`}>{x.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
          <Panel title="各路订单分布情况" className="panel-h-md logistics-title">
            <div className="chart-container">
              <ReactECharts
                onChartReady={(instance) => setDonutChartInstance(instance)}
                option={donutOption}
                style={{ height: '90%', width: '100%' }}
              />
            </div>
          </Panel>
        </div>

        <div className="col center">
          <div className="center-top">
            <div className="pill pill-1">
              <div>
                <div className="pill-label">累计订单数</div>
                <div className="pill-value">1680 <span>单</span></div>
              </div>
            </div>
            <div className="pill pill-2">
              <div>
                <div className="pill-label">累计订单金额</div>
                <div className="pill-value">4324 <span>万</span></div>
              </div>
            </div>
          </div>

          <div className="map-panel">
            <div className="chart-container map-echarts">
              {isMapLoaded && <ReactECharts echarts={echarts} option={mapOption} style={{ height: '100%', width: '100%' }} />}
            </div>
            <div className="map-overlay" aria-hidden="true" />
          </div>
          <Panel title="运输结构分析" className="panel-h-sm logistics-title">
            <div className="chart-container">
              <ReactECharts option={lineOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </Panel>

          <div className="bottom-actions">
            <button className="big-btn">应急预案参考</button>
            <button className="big-btn active">
              运营数据分析 <span className="badge">3</span>
            </button>
          </div>
        </div>
        <div className="col right">
          <Panel title="应急预案统计" className="panel-h-sm logistics-title">
            <div className="emergency">
              <div className="emg-card">
                <img src={getAssetUrl('logistics/today_icon.png')} alt="warn" />
                <div className="emg-meta">
                  <div className="label">今日启动次数</div>
                  <div className="value">2</div>
                </div>
              </div>
              <div className="emg-card warning-card">
                <img src={getAssetUrl('logistics/warning_icon.png')} alt="todo" />
                <div className="emg-meta">
                  <div className="label">未处置</div>
                  <div className="value">1</div>
                </div>
              </div>
            </div>
          </Panel>
          <Panel title="订单状态总览" className="panel-h-md logistics-title">
            <div className="order-table">
              <div className="thead">
                <div>序号</div>
                <div>名称</div>
                <div>内容</div>
                <div className="col-status">状态</div>
              </div>
              <div
                className="tbody"
                ref={tableRef}
                onMouseEnter={() => setIsHoveringTable(true)}
                onMouseLeave={() => setIsHoveringTable(false)}
              >
                {orders.concat(orders).map((row, idx) => (
                  <div key={`${row.id}-${idx}`} className={`tr ${row.status}`}>
                    <div>{row.id}</div>
                    <div>{row.name}</div>
                    <div className="content">{row.content}</div>
                    <div className="col-status">
                      <span className={`tag ${row.status}`}>{row.status === 'warning' ? '预警' : '正常'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
          <Panel title="各品牌订单量" className="panel-h-sm logistics-title">
            <div className="brand-list">
              {brands.map((b, idx) => (
                <div key={b.name} className="brand-row">
                  <div className={`rank ${b.colorClass}`}>{idx + 1}</div>
                  <div className="brand-name">{b.name}</div>
                  <div className="brand-bar">
                    <div className={`brand-fill ${b.colorClass}`} style={{ width: `${Math.min(100, (b.value / brands[0].value) * 100)}%` }} />
                  </div>
                  <div className="brand-value">{b.value} <span>辆</span></div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default LogisticsDashboard;

import { useState, useEffect } from 'react';
import type { DashboardData } from '../types';

// Mock API service
const fetchDashboardData = async (): Promise<DashboardData> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, this would be an axios.get('/api/dashboard') call
  return {
    droneStats: {
      completionRate: 87,
      total: 500,
      completed: 435,
      uncompleted: 65
    },
    dogStats: {
      total: 500,
      completed: 312,
      uncompleted: 188
    },
    patrolStats: {
      total: 200,
      fire: 5,
      loading: 4,
      spacing: 2
    },
    metrics: {
      accuracy: 98.5,
      falseAlarm: 2.23
    },
    zones: ['A区', 'B区', 'C区'].map((zoneName, zoneIndex) => {
      // Distribute 500 cars across 3 zones
      // Zone A: 167, Zone B: 167, Zone C: 166
      const carsInZone = zoneIndex === 2 ? 166 : 167;
      
      return {
        name: zoneName,
        cars: Array.from({ length: carsInZone }).map((_, i) => {
          // Fixed abnormal cars instead of random
          let isAbnormal = false;
          let abnormalReason: string | undefined = undefined;

          // Define specific abnormal cars for each zone
          if (zoneIndex === 0) { // A区
             if (i === 119) { isAbnormal = true; abnormalReason = '车门未关闭'; }
            //  if (i === 45) { isAbnormal = true; abnormalReason = '车胎漏气'; }
            //  if (i === 103) { isAbnormal = true; abnormalReason = '货物倾斜'; }
            //  if (i === 156) { isAbnormal = true; abnormalReason = '停车越线'; }
          } else if (zoneIndex === 1) { // B区
             if (i === 13) { isAbnormal = true; abnormalReason = '车门未关闭'; }
             if (i === 88) { isAbnormal = true; abnormalReason = '引擎未熄火'; }
             if (i === 130) { isAbnormal = true; abnormalReason = '天窗未关'; }
          } else if (zoneIndex === 2) { // C区
            //  if (i === 8) { isAbnormal = true; abnormalReason = '非法入侵'; }
            //  if (i === 66) { isAbnormal = true; abnormalReason = '设备离线'; }
            //  if (i === 142) { isAbnormal = true; abnormalReason = '油箱盖未关'; }
          }
          
          const row = Math.floor(i / 6) + 1; // 6 cars per row
          const col = i % 6 + 1;
          
          // Deterministic cargo based on index (not random)
          const cargoCount = (i % 3) + 1;
          const cargo = Array.from({ length: cargoCount }).map((_, cIdx) => {
            const boxNum = ((i + cIdx) % 9) + 1;
            return `box${boxNum}.png`;
          });
  
          return {
            id: `CAR-${zoneName}-${(row * 10 + col).toString().padStart(3, '0')}`,
            zone: zoneName,
            row,
            col,
            status: isAbnormal ? 'abnormal' : 'normal',
            abnormalReason,
            cargo
          };
        })
      };
    })
  };
};

const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    droneStats: {
      completionRate: 60,
      total: 500,
      completed: 300,
      uncompleted: 200
    },
    dogStats: {
      total: 500,
      completed: 300,
      uncompleted: 200
    },
    patrolStats: {
      total: 200,
      fire: 5,
      loading: 4,
      spacing: 2
    },
    metrics: {
      accuracy: 98.5,
      falseAlarm: 2.23
    },
    zones: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 模拟任务进度缓慢增加
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const { droneStats, dogStats } = prev;
        
        let nextDroneStats = droneStats;
        let nextDogStats = dogStats;

        // 无人机任务进度模拟
        if (droneStats.completed < droneStats.total) {
          const newCompleted = Math.min(droneStats.total, droneStats.completed + 1);
          const newUncompleted = droneStats.total - newCompleted;
          const newRate = Math.round((newCompleted / droneStats.total) * 100);
          
          nextDroneStats = {
            ...droneStats,
            completed: newCompleted,
            uncompleted: newUncompleted,
            completionRate: newRate
          };
        }

        // 机器狗任务进度模拟
        if (dogStats.completed < dogStats.total) {
          const newCompleted = Math.min(dogStats.total, dogStats.completed + 1);
          const newUncompleted = dogStats.total - newCompleted;
          
          nextDogStats = {
            ...dogStats,
            completed: newCompleted,
            uncompleted: newUncompleted
          };
        }

        if (nextDroneStats === droneStats && nextDogStats === dogStats) {
          return prev;
        }

        return {
          ...prev,
          droneStats: nextDroneStats,
          dogStats: nextDogStats
        };  
      });
    }, 5000); // 每5秒增加一次

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const newData = await fetchDashboardData();
        if (isMounted) {
          setData(prev => ({
            ...newData,
            // Keep local simulation progress if it's ahead of the fetched data (since fetched data is static mock)
            droneStats: prev.droneStats.completed > newData.droneStats.completed ? prev.droneStats : newData.droneStats,
            dogStats: prev.dogStats.completed > newData.dogStats.completed ? prev.dogStats : newData.dogStats
          }));
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('Failed to fetch dashboard data');
          setLoading(false);
        }
      }
    };

    // Initial load
    loadData();

    // Polling every 5 seconds
    const timer = setInterval(loadData, 5000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  return { ...data, loading, error };
};

export default useDashboardData;

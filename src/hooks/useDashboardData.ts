import { useState, useEffect } from 'react';
import type { DashboardData } from '../types';

// Mock API service
const fetchDashboardData = async (): Promise<DashboardData> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, this would be an axios.get('/api/dashboard') call
  return {
    droneStats: {
      completionRate: 60 + Math.floor(Math.random() * 10),
      total: 500,
      completed: 300 + Math.floor(Math.random() * 50),
      uncompleted: 200 - Math.floor(Math.random() * 50)
    },
    patrolStats: {
      total: 200 + Math.floor(Math.random() * 5),
      fire: 5,
      loading: 4,
      spacing: 2
    },
    metrics: {
      accuracy: +(98.5 + (Math.random() * 0.2 - 0.1)).toFixed(1),
      falseAlarm: +(2.23 + (Math.random() * 0.2 - 0.1)).toFixed(2)
    },
    zones: ['A区', 'B区', 'C区'].map((zoneName, zoneIndex) => {
      // Distribute 500 cars across 3 zones
      // Zone A: 167, Zone B: 167, Zone C: 166
      const carsInZone = zoneIndex === 2 ? 166 : 167;
      
      return {
        name: zoneName,
        cars: Array.from({ length: carsInZone }).map((_, i) => {
          // Simulate random abnormal cars
          const isAbnormal = Math.random() > 0.98; // ~2% abnormal
          const row = Math.floor(i / 6) + 1; // 6 cars per row
          const col = i % 6 + 1;
          
          // Randomly assign 1-3 cargo boxes
          const cargoCount = Math.floor(Math.random() * 3) + 1;
          const cargo = Array.from({ length: cargoCount }).map(() => {
            const boxNum = Math.floor(Math.random() * 9) + 1;
            return `box${boxNum}.png`;
          });
  
          return {
            id: `CAR-${zoneName}-${(row * 10 + col).toString().padStart(3, '0')}`,
            zone: zoneName,
            row,
            col,
            status: isAbnormal ? 'abnormal' : 'normal',
            abnormalReason: isAbnormal ? '车门未关闭' : undefined,
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

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const newData = await fetchDashboardData();
        if (isMounted) {
          setData(newData);
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

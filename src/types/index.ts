export interface DroneStats {
  completionRate: number;
  total: number;
  completed: number;
  uncompleted: number;
}

export interface PatrolStats {
  total: number;
  fire: number;
  loading: number;
  spacing: number;
}

export interface Metrics {
  accuracy: number;
  falseAlarm: number;
}

export interface Car {
  id: string;
  zone: string;
  row: number;
  col: number;
  status: 'normal' | 'abnormal';
  abnormalReason?: string;
  cargo: string[]; // Array of cargo image filenames (e.g., 'box1.png')
}

export interface Zone {
  name: string;
  cars: Car[];
}

export interface DashboardData {
  droneStats: DroneStats;
  patrolStats: PatrolStats;
  metrics: Metrics;
  zones: Zone[];
}

export type AttendanceReward = {
  attendanceDate: string;
  consecutiveDay: number;
  grantedCoin: number;
  balance: number;
};

export type AttendanceStatus = {
  attendedToday: boolean;
  consecutiveDay: number;
};

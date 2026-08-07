export type UserRole = "ADMIN" | "MODERATOR" | "BANKER" | "REGISTRAR";
export type StaffRole = Exclude<UserRole, "ADMIN">;

export type TimerStatus = "NOT_STARTED" | "RUNNING" | "PAUSED" | "FINISHED";

export type TeamSummary = {
  id: string;
  name: string;
  note: string | null;
  timerStatus: TimerStatus;
  timerRemainingSeconds: number;
  timerBudgetSeconds: number;
  balance: number;
  createdAt: string;
};

export type TransactionEntry = {
  id: string;
  amount: number;
  note: string;
  createdAt: string;
  station: { number: number; name: string } | null;
  createdBy: { username: string } | null;
};

export type StationSummary = { id: string; number: number; name: string };

export type StaffSummary = {
  id: string;
  username: string;
  role: StaffRole;
  createdAt: string;
  station: { number: number; name: string } | null;
};

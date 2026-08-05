import { STARTING_CASH } from "./constants";

type TimerFields = {
  timerStatus: string;
  timerStartedAt: Date | null;
  timerAccumulatedSeconds: number;
  timerBudgetSeconds: number;
};

export function timerRemainingSeconds(team: TimerFields) {
  let elapsed = team.timerAccumulatedSeconds;
  if (team.timerStatus === "RUNNING" && team.timerStartedAt) {
    elapsed += Math.floor((Date.now() - team.timerStartedAt.getTime()) / 1000);
  }
  return Math.max(0, Math.min(team.timerBudgetSeconds, team.timerBudgetSeconds - elapsed));
}

export function balanceFromTotal(total: number) {
  return STARTING_CASH + total;
}

type TeamFields = TimerFields & {
  id: string;
  name: string;
  note: string | null;
  createdAt: Date;
};

export function serializeTeam(team: TeamFields, transactionTotal: number) {
  return {
    id: team.id,
    name: team.name,
    note: team.note,
    timerStatus: team.timerStatus,
    timerRemainingSeconds: timerRemainingSeconds(team),
    timerBudgetSeconds: team.timerBudgetSeconds,
    balance: balanceFromTotal(transactionTotal),
    createdAt: team.createdAt,
  };
}

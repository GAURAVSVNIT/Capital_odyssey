export const STARTING_CASH = 100_000;
export const TIMER_BUDGET_SECONDS = 45 * 60;
export const LENDER_STATION_NUMBER = 7;

// Loan settlement: total repayment = principal * (1 + LOAN_INTEREST_RATE) ** LOAN_COMPOUND_PERIODS
export const LOAN_INTEREST_RATE = 0.08;
export const LOAN_COMPOUND_PERIODS = 5;

export const STATIONS = [
  { number: 1, name: "Investment Exchange" },
  { number: 2, name: "Opportunity Cost Challenge" },
  { number: 3, name: "Digital Payment Strategy" },
  { number: 4, name: "Payment Routing" },
  { number: 5, name: "Coding Comp" },
  { number: 6, name: "Bug Bounty: Hunt the Vulnerability" },
  { number: 7, name: "The Lender" },
] as const;

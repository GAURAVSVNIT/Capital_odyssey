export const STARTING_CASH = 100_000;
export const TIMER_BUDGET_SECONDS = 45 * 60;
export const LENDER_STATION_NUMBER = 7;

// Loan settlement: each loan repays as principal * (1 + its own interestRate) ** LOAN_COMPOUND_PERIODS.
// The Banker picks the rate per loan; this is just the pre-filled suggestion in that form.
export const DEFAULT_LOAN_INTEREST_RATE_PERCENT = 8;
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

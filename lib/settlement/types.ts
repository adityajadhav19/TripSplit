//same file as components/settlement/types.ts

export type SettlementMember = {
  id: string;
  name: string;
};

export type MemberBalance = SettlementMember & {
  paid: number;
  share: number;
  balance: number;
};

export type Transfer = {
  fromId: string;
  from: string;
  toId: string;
  to: string;
  amount: number;
};

export type SettlementData = {
  group: {
    name: string;
    groupCode: string;
  };
  totalSpent: number;
  members: MemberBalance[];
  transfers: Transfer[];
};

export type SettlementExpense = {
  id: string;
  description: string;
  amount: number;
  payerId: string;
  shares: {
    memberId: string;
    amount: number;
  }[];
};
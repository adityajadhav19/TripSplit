export type MemberBalance = {
  id: string;
  name: string;
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
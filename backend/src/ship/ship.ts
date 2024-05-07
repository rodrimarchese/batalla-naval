import { UUID } from 'crypto';

export type Ship = {
  id: UUID;
  shipType: string;
  createdAt: Date;
};

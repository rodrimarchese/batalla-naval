import { Ship } from './ship';
import { ShipPartStatus } from '../board/board';

export function convertToShip(data: any[]): Ship {
  const map = data.map(shipData => {
    return {
      id: shipData.id,
      createdAt: new Date(shipData.created_at),
      shipType: shipData.ship_type,
    };
  });
  return map[0];
}

export function mapShipStatusToDB(status: ShipPartStatus): string {
  return status;
}

export function mapShipStatusFromDB(statusInDB: string): ShipPartStatus {
  if (statusInDB == 'alive') return ShipPartStatus.Alive;
  if (statusInDB == 'dead') return ShipPartStatus.Dead;
  else return ShipPartStatus.Alive;
}

export function convertToShipByData(data: any): Ship | null {
  if (data == null) return null;
  return {
    shipType: data.ship_type,
    id: data.id,
    createdAt: new Date(data.created_at),
  };
}

import { supabase } from '../db/supabase';

export async function generateUniqueMovement(gameId: string, userId: string) {
  const BOARD_SIZE = 15;

  const { data: previousMovements, error } = await supabase
    .from('movements')
    .select('x_coordinate, y_coordinate, user_id')
    .eq('game_id', gameId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching previous movements:', error);
    return null;
  }

  const occupiedPositions = new Set(
    previousMovements.map(
      movement => `${movement.x_coordinate},${movement.y_coordinate}`,
    ),
  );

  let xCoordinate, yCoordinate;
  let unique = false;

  while (!unique) {
    xCoordinate = Math.floor(Math.random() * BOARD_SIZE);
    yCoordinate = Math.floor(Math.random() * BOARD_SIZE);

    if (!occupiedPositions.has(`${xCoordinate},${yCoordinate}`)) {
      unique = true;
    }
  }

  return {
    gameId: gameId,
    xCoordinate: xCoordinate,
    yCoordinate: yCoordinate,
  };
}

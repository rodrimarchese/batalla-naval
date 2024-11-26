import { supabase } from '../db/supabase';
import { GameStatus } from '../game/game';

export async function fetchUserGameHistory(userId: string) {
  const { data, error } = await supabase
    .from('game')
    .select(
      `
        *,
        host:host_id(*),
        guest:guest_id(*)
      `,
    )
    .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
    .eq('status', GameStatus.Finished);

  if (error) {
    throw new Error('Error fetching game history');
  }

  const games = await Promise.all(
    data.map(async gameData => {
      const duration =
        gameData.started_at && gameData.finished_at
          ? (new Date(gameData.finished_at).getTime() -
              new Date(gameData.started_at).getTime()) /
            1000 // Convertir a segundos
          : null;

      const userEfficiency = await calculateUserEfficiency(gameData.id, userId);
      const opponentId =
        gameData.host_id === userId ? gameData.guest_id : gameData.host_id;
      const opponentEfficiency = await calculateUserEfficiency(
        gameData.id,
        opponentId,
      );

      return {
        id: gameData.id,
        opponent: gameData.host_id === userId ? gameData.guest : gameData.host,
        result:
          gameData.winner_id === userId
            ? 'Won'
            : gameData.winner_id
              ? 'Lost'
              : 'Abandoned',
        startedAt: gameData.started_at,
        duration,
        userEfficiency,
        opponentEfficiency,
      };
    }),
  );

  return games;
}

export async function calculateUserEfficiency(
  gameId: string,
  userId: string,
): Promise<{ totalHits: number; totalMisses: number } | null> {
  const { data, error } = await supabase
    .from('movements')
    .select('hit')
    .eq('game_id', gameId)
    .eq('user_id', userId);

  if (error || !data) {
    return null;
  }

  let totalHits = 0;
  let totalMisses = 0;

  data.forEach(movement => {
    if (movement.hit) {
      totalHits++;
    } else {
      totalMisses++;
    }
  });

  return { totalHits, totalMisses };
}

export async function fetchWinLossStats(userId: string) {
  const { data, error } = await supabase
    .from('game')
    .select('winner_id')
    .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
    .eq('status', GameStatus.Finished);

  if (error) {
    throw new Error('Error fetching win/loss stats');
  }

  let totalGames = 0;
  let totalWins = 0;
  let totalLosses = 0;

  data.forEach(game => {
    totalGames++;
    if (game.winner_id === userId) {
      totalWins++;
    } else if (game.winner_id) {
      totalLosses++;
    }
  });

  return {
    totalGames,
    totalWins,
    totalLosses,
  };
}

export async function fetchUserAccuracyStats(userId: string) {
  const { data, error } = await supabase
    .from('movements')
    .select('hit, game_id')
    .eq('user_id', userId);

  if (error || !data) {
    throw new Error('Error fetching user accuracy stats');
  }

  let totalShots = 0;
  let totalHits = 0;
  const gameIds = new Set<string>();

  data.forEach(movement => {
    totalShots++;
    if (movement.hit) {
      totalHits++;
    }
    gameIds.add(movement.game_id);
  });

  const totalGames = gameIds.size;
  const averageHitsPerGame = totalGames > 0 ? totalHits / totalGames : 0;

  return {
    totalShots,
    totalHits,
    totalGames,
    averageHitsPerGame,
  };
}

export async function fetchAverageGameDuration(userId: string) {
  const { data, error } = await supabase
    .from('game')
    .select('started_at, finished_at')
    .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
    .eq('status', GameStatus.Finished);

  if (error || !data) {
    throw new Error('Error fetching game durations');
  }

  let totalGames = 0;
  let totalDuration = 0;

  data.forEach(game => {
    if (game.started_at && game.finished_at) {
      const duration =
        (new Date(game.finished_at).getTime() -
          new Date(game.started_at).getTime()) /
        1000; // Convertir a segundos
      totalDuration += duration;
      totalGames++;
    }
  });

  const averageDuration = totalGames > 0 ? totalDuration / totalGames : 0;

  return {
    totalGames,
    averageDuration,
  };
}

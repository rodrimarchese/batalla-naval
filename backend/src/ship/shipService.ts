import { supabase } from '../db/supabase';
import { convertToShip } from './util';

export async function saveShip(shipType: string) {
  try {
    const possibleShip = {
      ship_type: shipType,
    };

    const { data: shipQuery, error } = await supabase
      .from('ship')
      .insert([possibleShip])
      .select();

    if (shipQuery == null) return null;
    const ship = convertToShip(shipQuery);

    if (error) {
      throw error;
    }

    return ship;
  } catch (error) {
    throw new Error('Error inserting ship in database');
  }
}

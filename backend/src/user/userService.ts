import { supabase } from '../db/supabase';

export async function saveUser(
  id: string,
  first_name: string,
  last_name: string,
  email: string,
) {
  try {
    const user = {
      id,
      name: first_name + ' ' + last_name,
      email,
    };

    const { data, error } = await supabase.from('users').insert([user]);

    console.log('data', data);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error inserting user in database:', error);
    throw new Error('Error inserting user in database');
  }
}

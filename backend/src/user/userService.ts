import { supabase } from '../db/supabase';
import { convertToUser, convertToUsers } from './util';
import { User } from './user';

export async function saveUser(
  id: string,
  first_name: string,
  last_name: string,
  email: string,
) {
  try {
    const possibleUser = {
      id,
      name: first_name + ' ' + last_name,
      email,
    };

    const { data: userQuery, error } = await supabase
      .from('users')
      .insert([possibleUser])
      .select();

    if (userQuery == null) return null;
    const user = convertToUser(userQuery);

    if (error) {
      throw error;
    }

    return user;
  } catch (error) {
    throw new Error('Error inserting user in database');
  }
}

export const allUsers = async () => {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (data == null) return null;
    const users = convertToUsers(data);
    if (error) throw error;
    return users;
  } catch (error) {
    throw new Error('Error fetching users from Superbase');
  }
};

export const userWithId = async (id: string): Promise<User> => {
  const { data, error } = await supabase.from('users').select('*').eq('id', id);

  if (!id) {
    throw new Error('Invalid user ID provided');
  }

  if (error) {
    throw new Error('Error fetching user from Superbase');
  }

  if (data === null || data.length === 0) {
    throw new Error('User not found');
  }

  return convertToUser(data);
};

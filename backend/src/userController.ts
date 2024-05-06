// user.controller.ts
// recibe un /createUser webhook, para pergarle a supabase y crear un user en supabase con la info que me venga
import { Request, Response } from 'express';
import { supabase } from './supabase';

// export const getUsers = async (req: Request, res: Response) => {
//     try {
//       const { data, error } = await supabase.from('users').select('*');
//       if (error) throw error;
//       res.status(200).json(data);
//     } catch (error : any) {
//       res.status(500).json({ error: error.message });
//     }
//   };

export async function createUser(req: Request, res: Response) {
  module.exports = {
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    bracketSpacing: true,
    arrowParens: 'avoid',
  };

  const body = req.body;
  const userData = body.data;

  const user = {
    id: userData.id.toString(),
    name: userData.first_name + ' ' + userData.last_name,
    email: userData.email_addresses[0].email_address,
  };

  console.log('user', user);

  const { data, error } = await supabase.from('users').insert([user]);

  if (error) {
    console.error('Error inserting user in database:', error);
    return res
      .status(500)
      .json({ message: 'Error inserting user in database' });
  }

  console.log('data', data);

  res.json({ message: 'Event received', yourData: body });
}

// export const updateUser = async (req: Request, res: Response) => {
//     const { id, name, email } = req.body;

//     const { data, error } = await supabase.from("users").upsert([
//         { id, name, email },
//     ]);

//     if (error) {
//         console.error("Error updating user in database:", error);
//         return res.status(500).json({ message: "Error updating user in database" });
//     }

//     res.json({ message: "User updated", yourData: req.body });
// }

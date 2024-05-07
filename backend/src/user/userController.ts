// user.controller.ts
// recibe un /createUser webhook, para pergarle a supabase y crear un user en supabase con la info que me venga
import { Request, Response } from 'express';
import { saveUser, allUsers, userWithId } from './userService';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await allUsers();

    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await userWithId(userId);

    res.status(200).json(user);
  } catch (error: any) {
    if (error.message === 'Invalid user ID provided') {
      res.status(400).json({ error: error.message });
    } else if (error.message === 'User not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

export async function createUser(req: Request, res: Response) {
  try {
    const body = req.body;
    const userData = body.data;

    const user = await saveUser(
      userData.id.toString(),
      userData.first_name,
      userData.last_name,
      userData.email_addresses[0].email_address,
    );

    res.json({ message: 'Event received', yourData: body });
  } catch (error) {
    return res.status(500).json({ message: 'Error saving user' });
  }
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

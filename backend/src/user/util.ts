import { User } from './user';
export function convertToUser(data: any[]): User {
  const map = data.map(userData => {
    return {
      id: userData.id,
      createdAt: new Date(userData.created_at),
      updatedAt: new Date(userData.updated_at),
      name: userData.name,
      email: userData.email,
    };
  });
  return map[0];
}

export function convertToUserByData(data: any): User | null {
  if (data == null) return null;
  return {
    id: data.id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    name: data.name,
    email: data.email,
  };
}

export function convertToUsers(data: any[]): User[] {
  return data.map(userData => {
    return {
      id: userData.id,
      createdAt: new Date(userData.created_at),
      updatedAt: new Date(userData.updated_at),
      name: userData.name,
      email: userData.email,
    };
  });
}

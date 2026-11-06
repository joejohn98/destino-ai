export interface UserSeedInput {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: "user" | "admin";
  avatarUrl: string;
}

export const rawUsersData: UserSeedInput[] = [
  {
    firstName: "Admin",
    lastName: "User",
    username: "admin_alex",
    email: "admin@destino.ai",
    role: "admin",
    avatarUrl: "https://i.pravatar.cc/150?u=alex",
  },
  {
    firstName: "John",
    lastName: "Traveler",
    username: "john_traveler",
    email: "john@example.com",
    role: "user",
    avatarUrl: "https://i.pravatar.cc/150?u=john",
  },
  {
    firstName: "Sarah",
    lastName: "Explorer",
    username: "sarah_explorer",
    email: "sarah@example.com",
    role: "user",
    avatarUrl: "https://i.pravatar.cc/150?u=sarah",
  },
];

export const getUsersSeedData = (hashedPassword: string) => {
  return rawUsersData.map((user) => ({
    ...user,
    password: hashedPassword,
  }));
};


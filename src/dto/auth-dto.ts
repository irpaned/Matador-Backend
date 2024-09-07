export type LoginDTO = {
  email: string;
  password: string;
};

export type registerDTO = {
  sex: string;
  email: string;
  password: string;
  fullName: string;
};

export type UserProfileDto = {
  fullName?: string;
  sex?: string;
  bio?: string;
  photoProfile?: string;
  coverImage?: string;
};

export type ResetDTO = {
  id: Number;
  email: string;
  password: string;
};

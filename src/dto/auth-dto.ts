export type LoginDTO = {
  email: string;
  password: string;
};

export type registerDTO = {
  userName: string;
  email: string;
  password: string;
  fullName: string;
};

export type editProfileDTO = {
  userName: string;
  fullName: string;
  bio: string;
  photoProfile: string;
};

export type ResetDTO = {
  id: Number;
  email: string;
  password: string;
};

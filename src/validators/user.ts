import j from "joi";

export const updateProfileSchema = j.object({
  fullName: j.string().required().min(3).max(20),
  sex: j.string(),
  bio: j.allow(null),
  photoProfile: j.allow(null),
  coverImage: j.allow(null),
});

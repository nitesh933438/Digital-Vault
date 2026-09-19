import { auth } from "../firebase/firebase";
import { updateProfile } from "firebase/auth";
import { uploadToCloudinary } from "./cloudinaryService";

export const uploadProfilePhoto = async (file) => {

  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not logged in");
  }

  const data = await uploadToCloudinary(file);

  await updateProfile(user, {
    photoURL: data.secure_url
  });

  return data.secure_url;

};
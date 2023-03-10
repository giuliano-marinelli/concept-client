import { Profile } from "./profile.model";

export class User {
  // tslint:disable-next-line: variable-name
  _id?: string;
  username?: string;
  email?: string;
  role?: string;
  avatar?: string;
  verified?: boolean;
  lastVerifyDate?: Date;
  verificationCode?: string;
  createdAt?: Date;
  profile?: Profile;
}

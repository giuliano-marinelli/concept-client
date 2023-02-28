import { Device } from "./device.model";

export class Session {
  _id?: string;
  user?: string;
  token?: string;
  device?: Device;
  blocked?: boolean;
  closed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

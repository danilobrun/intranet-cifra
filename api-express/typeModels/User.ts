// IMPORTS
import {model, Schema, Types} from "mongoose"

export interface IUser {
  name: string;
  email: string;
  password: string;
  type: number;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema<IUser>({
  name:{ type: 'String', required: true},
  email:{ type: 'String', required: true},
  password:{ type: 'String', required: true},
  type:{ type: 'Number', required: true},
  role:{ type: 'String', required: true},
  createdAt:{ type: 'Date', required: true},
  updatedAt:{ type: 'Date', required: true}
})

export const User = model<IUser>('Usuario', UserSchema)
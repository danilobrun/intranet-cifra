//IMPORT
import { model, Schema } from "mongoose";
//Create Interface
export interface IRent {
    car_id: string;
    user_id: string; 
    createdAt: Date;
    updatedAt: Date;
}

//Create Schema moogose
export const RentSchema = new Schema<IRent>({
    car_id: {type: 'String', required: true},
    user_id: {type: 'String', required: true}, 
    createdAt: {type: 'Date', required: true},
    updatedAt: {type: 'Date', required: true},
})
//Export model<paramInterface>('collectionName', moongoseSchema)
export const Rent = model<IRent>('Aluguel', RentSchema)
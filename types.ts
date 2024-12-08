
import { ObjectId, OptionalId } from "mongodb"

export type UserModel = OptionalId<{
    _id : ObjectId,
    name : string,
    email : string,
    created_at : Date,
}>;

export type User = {
    id : string,
    name : string,
    email : string,
    created_at : Date,
};

export type ProjectModel = OptionalId<{
    _id : ObjectId,
    name : string,
    description : string,
    start_date : Date,
    end_date : Date,
    user_id: ObjectId
}>;

export type Project = {
    id : string,
    name : string,
    description : string,
    start_date : Date,
    end_date : Date,
    user_id : string
};

export type TareaModel = OptionalId<{
    _id : ObjectId,
    title : string,
    description : string,
    status : "pending "| "in_progress" | "completed",
    created_at : Date,
    due_date : Date, 
    project_id : ObjectId,
}>;

export type Tarea = {
    id : string,
    title : string,
    description : string,
    status : "pending "| "in_progress" | "completed",
    created_at : Date,
    due_date? : Date, 
    project_id : string,
}
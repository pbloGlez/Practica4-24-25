import { MongoClient, ObjectId } from "mongodb";
import type { ProjectModel, UserModel, TareaModel } from "./types.ts";
import { fromModelToProject, fromModelToTask, fromModelToUser } from "./utils.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");
if(!MONGO_URL) {
  console.error("MONGO_URL is not set");
  Deno.exit(1);
}

const client = new MongoClient(MONGO_URL);
await client.connect();
console.info("Connected to MongoDB");

const db = client.db("Practica4");

const userCollection = db.collection<UserModel>("usuarios");
const projectCollection = db.collection<ProjectModel>("proyectos"); 
const taskCollection = db.collection<TareaModel>("tareas");

const handler = async(req: Request): Promise<Response> => {
  const method =req.method;
  const url = new URL(req.url);
  const path = url.pathname;
  
  if(method === "GET"){

    if (path ==="/users") {
      const name = url.searchParams.get("name");
      if(name){
        const userDB = await userCollection.find().toArray();
        const users = await Promise.all(userDB.map((u) => fromModelToUser(u)));
        return new Response(JSON.stringify(users));
      }
    }else if(path === "/projects"){
      const userDB = await projectCollection.find().toArray();
      const users = await Promise.all(userDB.map((u) => fromModelToProject(u)));
      return new Response(JSON.stringify(users),{status: 200});

    }else if(path ==="/tasks"){
      const userDB = await taskCollection.find().toArray();
      const users = await Promise.all(userDB.map((u)=> fromModelToTask(u)));
      return new Response(JSON.stringify(users),{status:200});

    }else if(path === "/task/by-project"){
      const task = url.searchParams.get("project_id");
      if(!task) return new Response("Bad Request", {status: 404});
      const pId = new ObjectId(task);
      const taskDB = await taskCollection.find({project_id : pId}).toArray();
      const tasks = await Promise.all(taskDB.map(t => fromModelToTask(t)));
      return new Response(JSON.stringify(tasks), {status : 200});

    }else if(path === "/projects/by-user"){
      const projID = url.searchParams.get("user_id");
      if(!projID) return new Response("Bad request", {status : 404});
      const userID = new ObjectId(projID);
      const projDB = await projectCollection.find({user_id: userID}).toArray();
      const projects = await Promise.all(projDB.map(u => fromModelToProject(u)));
      return new Response(JSON.stringify(projects), {status: 200});
    }
  }else if(method === "POST"){

    if(path.startsWith("/users")){
      const user = await req.json();
      if(!user.name || !user.email){
        return new Response("Bad request", {status: 400});
      }
      const userDB = await userCollection.findOne({email : user.email});
      if(userDB) return new Response("El usuario ya existe", {status : 409});

      const { insertedId } = await userCollection.insertOne({
        name: user.name,
        email : user.email,
        created_at : new Date(),
      });
      return new Response(JSON.stringify({
        id : insertedId,
        name : user.name,
        email : user.email,
        created_at : new Date(),
      }),{status : 201});

    }else if(path === "/projects"){
      const proyect = await req.json();
      if(!proyect.name || !proyect.description || !proyect.start_date || !proyect.user_id){
        return new Response("Bad request", {status : 400});
      }
      const userDB = await projectCollection.findOne({name : proyect.name});
      if(userDB) return new Response("El proyecto ya existe", {status: 409});

      const { insertedId } = await projectCollection.insertOne({
        name : proyect.name,
        description : proyect.description,
        start_date : proyect.start_date,
        user_id : new ObjectId(proyect.user_id as string),
        end_date: proyect.end_date
      });
      return new Response(JSON.stringify({
        name : proyect.name,
        description : proyect.description,
        start_date : proyect.start_date,
        user_id : proyect.user_id,
        end_date: proyect.end_date,
        id: insertedId,
      }),{status : 201});

    }else if(path==="/tasks"){
      const tareas = await req.json();
      if(!tareas.title || !!tareas.description || !tareas.status || !tareas.due_date || !tareas.project_id){
        return new Response("Bad request", {status : 400});
      }
      const projectID = await projectCollection.find({_id : tareas.project_id});
      if(!projectID) return new Response("Project not found", {status: 400});

      const { insertedId } = await taskCollection.insertOne({
        title : tareas.title,
        description : tareas.description,
        status : tareas.status,
        created_at : tareas.created_at, 
        due_date : tareas.due_date,
        project_id : new ObjectId(tareas.project_id as string),
      });
      return new Response (JSON.stringify({
        title: tareas.title,
        description: tareas.description,
        status: tareas.status,
        created_at: tareas.created_at,
        due_date: tareas.due_date,
        project_id: tareas.project_id,
        id: insertedId
      }),{status: 200});

    }
  }else if(method === "DELETE"){
    if(path.startsWith("/users")){
      const id = url.searchParams.get("url");
      if(!id) return new Response("Bad request", {status : 400});
      await userCollection.deleteOne({ _id : new ObjectId(id)});
      return new Response(JSON.stringify("Tarea eliminada correctamente"));
    }
  }
  return new Response("endpoint not found", {status : 404});
}
Deno.serve({port: 8080}, handler);
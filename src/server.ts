import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import connectDb from "./config/db.js";
import userRouter from "./routes/user.js";
import adminRouter from "./routes/admin.js";

const app = express();
app.use(express.json());
app.use(cors());


await connectDb()

app.use('/api/user', userRouter)
app.use('/api/admin', adminRouter)

const PORT = 5000;
app.get("/", (req: Request, res: Response) => {
  res.json("Api is working");
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
import dotenv from "dotenv";

dotenv.config();

import app from "./src/app";
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4242;

app.get("/", (req, res) => {
    res.status(200).send("Je suis sur l'API 'http://localhost:4242'");
})

app.listen(port, () => {
    console.log(`Server adress : http://localhost:${port}`);
});
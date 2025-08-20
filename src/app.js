const express = require("express");
const cors = require("cors");
const router = require("./router");
const app = express();

app.use(cors());
app.use(express.json());

// get http://localhost:4242
app.get("/", (req, res) => {
	// la réponse classique pour un get est 200
	res.status(200).send("Je suis sur l'API http://localhost:4242/");
});

app.use("/api", router);

module.exports = app;

const express = require("express");
const cors = require("cors");
const path = require("path"); // pour gérer les images
const router = require("./router");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "../public/images")));

// get http://localhost:4242
app.get("/", (req, res) => {
	// la réponse classique pour un get est 200
	res.status(200).send("Je suis sur l'API http://localhost:4242/");
});

app.use("/api", router);

module.exports = app;

require("dotenv").config();
const app = require("./src/app");

const port = process.env.PORT;

app.listen(port, (err) => {
	if (err) {
		console.error(err);
	} else {
		console.log(`Server adress : http://localhost:${port}`);
	}
});

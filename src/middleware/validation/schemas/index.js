// =================================================================
// POINT D'ENTRÉE PRINCIPAL - SCHÉMAS
// =================================================================

// Import de tous les schémas
const baseSchemas = require("./base");
const authSchemas = require("./auth");
const contactSchemas = require("./contact");
const articlesSchemas = require("./articles");
const illustrationsSchemas = require("./illustrations");
const aboutSchemas = require("./about");
const tagsSchemas = require("./tags");
const uploadSchemas = require("./upload");

// =================================================================
// EXPORTS FINAUX
// =================================================================

module.exports = {
	...baseSchemas,
	...authSchemas,
	...contactSchemas,
	...articlesSchemas,
	...illustrationsSchemas,
	...aboutSchemas,
	...tagsSchemas,
	...uploadSchemas,
};

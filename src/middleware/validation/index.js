// =================================================================
// POINT D'ENTRÉE PRINCIPAL - VALIDATION
// =================================================================

// Import des schémas
const baseSchemas = require("./schemas/base");
const authSchemas = require("./schemas/auth");
const contactSchemas = require("./schemas/contact");
const articlesSchemas = require("./schemas/articles");
const illustrationsSchemas = require("./schemas/illustrations");
const aboutSchemas = require("./schemas/about");
const tagsSchemas = require("./schemas/tags");
const uploadSchemas = require("./schemas/upload");

// Import des middleware
const baseMiddleware = require("./middleware/base");
const bodyMiddleware = require("./middleware/body");
const paramsMiddleware = require("./middleware/params");

// =================================================================
// EXPORTS FINAUX
// =================================================================

module.exports = {
	// Middleware de base
	...baseMiddleware,

	// Middleware de validation du body
	...bodyMiddleware,

	// Middleware de validation des paramètres
	...paramsMiddleware,

	// Schémas (pour usage avancé)
	schemas: {
		...baseSchemas,
		...authSchemas,
		...contactSchemas,
		...articlesSchemas,
		...illustrationsSchemas,
		...aboutSchemas,
		...tagsSchemas,
		...uploadSchemas,
	},
};

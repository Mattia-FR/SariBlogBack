import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// Je lance les tests dans un environnement Node.js,
		// car il s'agit de tests backend (pas de DOM).
		environment: "node",

		// Nettoie automatiquement les mocks entre chaque test.
		// Cela évite qu'un mock configuré dans un test ne « fuite » dans un autre.
		clearMocks: true,

		// Tests unitaires (tests/unit/) et d'intégration HTTP avec Supertest (tests/integration/).
		include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
	},
});

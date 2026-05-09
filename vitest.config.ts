import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Je lance les tests dans un environnement Node.js,
    // car il s'agit de tests backend (pas de DOM).
    environment: "node",

    // Nettoie automatiquement les mocks entre chaque test.
    // Cela évite qu'un mock configuré dans un test ne « fuite » dans un autre.
    clearMocks: true,

    // Seuls les fichiers dans tests/unit/ et terminant par .test.ts seront exécutés.
    // Cela permet d'avoir d'autres types de tests (intégration, E2E) dans d'autres dossiers.
    include: ["tests/unit/**/*.test.ts"],
  },
});
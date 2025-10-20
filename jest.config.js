module.exports = {
	testEnvironment: "node",
	collectCoverageFrom: [
		"src/**/*.js",
		"!src/**/*.test.js",
		"!src/**/*.spec.js",
	],
	testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
	setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
	testTimeout: 10000,
};

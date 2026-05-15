import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        globals:     false,       // explicit imports keep tests readable
        testTimeout: 10000,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            include:  ['lib/**/*.js', 'storageManager.js', 'INFTManager.js', 'roomManager.js'],
            exclude:  ['node_modules/**', 'tests/**', 'scripts/**'],
        },
    },
});

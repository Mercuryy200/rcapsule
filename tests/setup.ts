import "@testing-library/jest-dom";
import { beforeAll, afterAll, afterEach } from "vitest";
import { server } from "./mocks/server";

// Start MSW mock server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));

// Reset handlers between tests to avoid bleed-over
afterEach(() => server.resetHandlers());

// Stop server after all tests
afterAll(() => server.close());

import { beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({
  getApps: vi.fn(), initializeApp: vi.fn(), getFirestore: vi.fn(),
  app: { name: "controlled-app" }, db: { type: "controlled-firestore" },
}));

vi.mock("firebase/app", () => ({ getApps: sdk.getApps, initializeApp: sdk.initializeApp }));
vi.mock("firebase/firestore", () => ({ getFirestore: sdk.getFirestore }));

const config = {
  EXPO_PUBLIC_FIREBASE_API_KEY: "test-api-key",
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: "unit-test.invalid",
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: "unit-test-project",
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: "unit-test-bucket",
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "test-sender",
  EXPO_PUBLIC_FIREBASE_APP_ID: "test-app-id",
};

beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal("__DEV__", false);
  for (const [key, value] of Object.entries(config)) vi.stubEnv(key, value);
  sdk.getApps.mockReturnValue([]);
  sdk.initializeApp.mockReturnValue(sdk.app);
  sdk.getFirestore.mockReturnValue(sdk.db);
});

describe("Firebase initialization and caching", () => {
  it("maps all six public environment values to SDK configuration", async () => {
    const { getFirebaseApp } = await import("./firebase");
    expect(getFirebaseApp()).toBe(sdk.app);
    expect(sdk.initializeApp).toHaveBeenCalledExactlyOnceWith({
      apiKey: "test-api-key", authDomain: "unit-test.invalid", projectId: "unit-test-project",
      storageBucket: "unit-test-bucket", messagingSenderId: "test-sender", appId: "test-app-id",
    });
  });

  it("initializes and caches only one app and Firestore instance", async () => {
    const { getFirebaseApp, getDb } = await import("./firebase");
    expect(getDb()).toBe(sdk.db);
    expect(getDb()).toBe(sdk.db);
    expect(getFirebaseApp()).toBe(sdk.app);
    expect(sdk.getApps).toHaveBeenCalledTimes(1);
    expect(sdk.initializeApp).toHaveBeenCalledTimes(1);
    expect(sdk.getFirestore).toHaveBeenCalledExactlyOnceWith(sdk.app);
  });

  it("reuses an existing app without requiring environment configuration", async () => {
    const existingApp = { name: "existing-app" };
    sdk.getApps.mockReturnValue([existingApp]);
    for (const key of Object.keys(config)) vi.stubEnv(key, undefined);
    const { getFirebaseApp, getDb } = await import("./firebase");
    expect(getFirebaseApp()).toBe(existingApp);
    expect(getDb()).toBe(sdk.db);
    expect(sdk.initializeApp).not.toHaveBeenCalled();
    expect(sdk.getFirestore).toHaveBeenCalledWith(existingApp);
  });

  it("can retry after app initialization fails", async () => {
    const failure = new Error("SDK initialization failure");
    sdk.initializeApp.mockImplementationOnce(() => { throw failure; });
    const { getFirebaseApp } = await import("./firebase");
    expect(() => getFirebaseApp()).toThrow(failure);
    expect(getFirebaseApp()).toBe(sdk.app);
  });

  it("can retry Firestore creation without initializing another app", async () => {
    const failure = new Error("Firestore initialization failure");
    sdk.getFirestore.mockImplementationOnce(() => { throw failure; });
    const { getDb } = await import("./firebase");
    expect(() => getDb()).toThrow(failure);
    expect(getDb()).toBe(sdk.db);
    expect(sdk.initializeApp).toHaveBeenCalledTimes(1);
  });
});

describe("missing Firebase configuration", () => {
  it.each(Object.keys(config))("rejects a missing %s without invoking initialization", async (key) => {
    vi.stubEnv(key, undefined);
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { getDb } = await import("./firebase");
    expect(() => getDb()).toThrow("Firebase configuration is unavailable.");
    expect(sdk.initializeApp).not.toHaveBeenCalled();
    expect(sdk.getFirestore).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  it("lists missing field names in development, without logging configured values", async () => {
    vi.stubGlobal("__DEV__", true);
    vi.stubEnv("EXPO_PUBLIC_FIREBASE_API_KEY", "");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { getFirebaseApp } = await import("./firebase");
    expect(() => getFirebaseApp()).toThrow("Firebase configuration is unavailable.");
    expect(log).toHaveBeenCalledExactlyOnceWith("Missing Firebase environment variables:", ["apiKey"]);
    expect(JSON.stringify(log.mock.calls)).not.toContain("unit-test-bucket");
  });

  it("can retry after configuration is supplied", async () => {
    vi.stubEnv("EXPO_PUBLIC_FIREBASE_API_KEY", "");
    const { getFirebaseApp } = await import("./firebase");
    expect(() => getFirebaseApp()).toThrow("Firebase configuration is unavailable.");
    vi.stubEnv("EXPO_PUBLIC_FIREBASE_API_KEY", "corrected-api-key");
    expect(getFirebaseApp()).toBe(sdk.app);
    expect(sdk.initializeApp).toHaveBeenCalledTimes(1);
  });
});

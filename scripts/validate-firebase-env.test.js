const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  FIREBASE_ENV_KEYS,
  getFirebaseEnv,
  getMissingFirebaseEnvKeys,
} = require("./validate-firebase-env");

describe("getMissingFirebaseEnvKeys", () => {
  it("returns every Firebase env key that is missing or empty", () => {
    const env = {
      EXPO_PUBLIC_FIREBASE_API_KEY: "api-key",
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: "",
      EXPO_PUBLIC_FIREBASE_PROJECT_ID: "project-id",
    };

    assert.deepEqual(getMissingFirebaseEnvKeys(env), [
      "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
      "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      "EXPO_PUBLIC_FIREBASE_APP_ID",
    ]);
  });

  it("returns no missing keys when all Firebase env keys are set", () => {
    const env = Object.fromEntries(
      FIREBASE_ENV_KEYS.map((key) => [key, `${key}-value`]),
    );

    assert.deepEqual(getMissingFirebaseEnvKeys(env), []);
  });

  it("merges .env, .env.local, and process env with process env taking precedence", () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "namsigdang-env-"));
    fs.writeFileSync(
      path.join(directory, ".env"),
      [
        "EXPO_PUBLIC_FIREBASE_API_KEY=from-dot-env",
        "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=from-dot-env",
      ].join("\n"),
    );
    fs.writeFileSync(
      path.join(directory, ".env.local"),
      [
        "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=from-dot-env-local",
        "EXPO_PUBLIC_FIREBASE_PROJECT_ID=from-dot-env-local",
      ].join("\n"),
    );

    const env = getFirebaseEnv({
      cwd: directory,
      env: {
        EXPO_PUBLIC_FIREBASE_API_KEY: "from-process-env",
      },
    });

    assert.equal(env.EXPO_PUBLIC_FIREBASE_API_KEY, "from-process-env");
    assert.equal(
      env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      "from-dot-env-local",
    );
    assert.equal(
      env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      "from-dot-env-local",
    );
  });
});

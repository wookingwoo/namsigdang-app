const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const {
  FIREBASE_ENV_KEYS,
  getFirebaseEnv,
  getMissingFirebaseEnvKeys,
  parseDotEnvContent,
  validateFirebaseEnv,
} = require("./validate-firebase-env");

function createEnvDirectory(t) {
  const tempRoot = fs.realpathSync(os.tmpdir());
  const directory = fs.mkdtempSync(path.join(tempRoot, "namsigdang-env-"));
  t.after(() => {
    // Only remove the exact temporary child created by this test.
    assert.equal(path.dirname(path.resolve(directory)), tempRoot);
    fs.rmSync(directory, { recursive: true, force: true });
  });
  return directory;
}

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

  it("merges .env, .env.local, and process env with process env taking precedence", (t) => {
    const directory = createEnvDirectory(t);
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

describe("dotenv parsing", () => {
  it("ignores blank lines, comments, and entries without a key/value separator", () => {
    assert.deepEqual(parseDotEnvContent("\n  # comment\r\nnot-an-entry\n=missing-key\n KEY = value \n"), {
      KEY: "value",
    });
  });

  it("removes matching single or double quotes and preserves embedded equals signs", () => {
    assert.deepEqual(parseDotEnvContent('A="value=one"\r\nB=\'value#two\'\r\nC=\r\nD=""\r\nE=\'\''), {
      A: "value=one", B: "value#two", C: "", D: "", E: "",
    });
  });

  it("uses the last duplicate key and leaves unmatched quotes untouched", () => {
    assert.deepEqual(parseDotEnvContent('A=first\nA=second\nB="unmatched\nC=value\''), {
      A: "second", B: '"unmatched', C: "value'",
    });
  });
});

describe("environment file precedence and validation", () => {
  it("handles missing files without reading the caller's process environment", (t) => {
    assert.deepEqual(getFirebaseEnv({ cwd: createEnvDirectory(t), env: { CUSTOM: "isolated" } }), {
      CUSTOM: "isolated",
    });
  });

  it("loads values from .env.local when .env does not exist", (t) => {
    const directory = createEnvDirectory(t);
    fs.writeFileSync(path.join(directory, ".env.local"), "EXPO_PUBLIC_FIREBASE_PROJECT_ID=local-project");
    assert.deepEqual(getFirebaseEnv({ cwd: directory, env: {} }), {
      EXPO_PUBLIC_FIREBASE_PROJECT_ID: "local-project",
    });
  });

  it("does not fall back to file values when a process variable is explicitly empty", (t) => {
    const directory = createEnvDirectory(t);
    fs.writeFileSync(path.join(directory, ".env"), "EXPO_PUBLIC_FIREBASE_API_KEY=file-value");
    const env = getFirebaseEnv({ cwd: directory, env: { EXPO_PUBLIC_FIREBASE_API_KEY: "" } });
    assert.equal(env.EXPO_PUBLIC_FIREBASE_API_KEY, "");
    assert.ok(getMissingFirebaseEnvKeys(env).includes("EXPO_PUBLIC_FIREBASE_API_KEY"));
  });

  it("reports missing key names without including configured values", () => {
    assert.throws(() => validateFirebaseEnv({ EXPO_PUBLIC_FIREBASE_API_KEY: "never-log-this-value" }), (error) => {
      assert.match(error.message, /EXPO_PUBLIC_FIREBASE_PROJECT_ID/);
      assert.doesNotMatch(error.message, /never-log-this-value/);
      assert.doesNotMatch(error.message, /EXPO_PUBLIC_FIREBASE_API_KEY/);
      return true;
    });
  });

  it("accepts a complete configuration", () => {
    const env = Object.fromEntries(FIREBASE_ENV_KEYS.map((key) => [key, "test-value"]));
    assert.doesNotThrow(() => validateFirebaseEnv(env));
  });
});

describe("validation CLI", () => {
  const cliPath = path.join(__dirname, "validate-firebase-env.js");

  function runCli(directory) {
    const env = { ...process.env };
    for (const key of FIREBASE_ENV_KEYS) delete env[key];
    return spawnSync(process.execPath, [cliPath], {
      cwd: directory, env, encoding: "utf8", timeout: 10_000,
    });
  }

  it("exits nonzero and lists all required keys when configuration is missing", (t) => {
    const result = runCli(createEnvDirectory(t));
    assert.ifError(result.error);
    assert.equal(result.status, 1);
    assert.equal(result.stdout, "");
    for (const key of FIREBASE_ENV_KEYS) assert.ok(result.stderr.includes(key));
  });

  it("exits successfully without printing values when .env is complete", (t) => {
    const directory = createEnvDirectory(t);
    fs.writeFileSync(path.join(directory, ".env"), FIREBASE_ENV_KEYS.map((key) => `${key}=test-only-value`).join("\n"));
    const result = runCli(directory);
    assert.ifError(result.error);
    assert.equal(result.status, 0);
    assert.equal(result.stdout, "");
    assert.equal(result.stderr, "");
  });
});

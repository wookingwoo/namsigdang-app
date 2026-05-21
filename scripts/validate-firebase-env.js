const fs = require("node:fs");
const path = require("node:path");

const FIREBASE_ENV_KEYS = [
  "EXPO_PUBLIC_FIREBASE_API_KEY",
  "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
  "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "EXPO_PUBLIC_FIREBASE_APP_ID",
];

function parseDotEnvContent(content) {
  const values = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex < 1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    let value = trimmedLine.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

function readDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return parseDotEnvContent(fs.readFileSync(filePath, "utf8"));
}

function getFirebaseEnv({ cwd = process.cwd(), env = process.env } = {}) {
  return {
    ...readDotEnvFile(path.join(cwd, ".env")),
    ...readDotEnvFile(path.join(cwd, ".env.local")),
    ...env,
  };
}

function getMissingFirebaseEnvKeys(env) {
  return FIREBASE_ENV_KEYS.filter((key) => !env[key]);
}

function validateFirebaseEnv(env = process.env) {
  const missingKeys = getMissingFirebaseEnvKeys(env);

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing Firebase environment variables: ${missingKeys.join(", ")}`,
    );
  }
}

if (require.main === module) {
  try {
    validateFirebaseEnv(getFirebaseEnv());
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  FIREBASE_ENV_KEYS,
  getFirebaseEnv,
  getMissingFirebaseEnvKeys,
  parseDotEnvContent,
  validateFirebaseEnv,
};

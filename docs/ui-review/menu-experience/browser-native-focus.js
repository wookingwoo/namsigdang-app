// App platform-branch regression in the real web renderer. This verifies the
// props our component supplies for Android, not Android's native rendering.
async (page) => {
  const setPlatform = async (os) => page.evaluate((os) => {
    const entry = [...globalThis.__r.getModules()].find(([, module]) => module.verboseName === "node_modules/react-native-web/dist/exports/Platform/index.js");
    globalThis.__r(entry[0]).default.OS = os;
  }, os);
  try {
    await setPlatform("android");
    await page.setViewportSize({ width: 376, height: 900 });
    await page.getByRole("button", { name: "서비스 정보", exact: true }).focus();
    await page.keyboard.press("Tab");
    const first = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
    if (first !== "동작관") throw new Error("Android branch must keep the unselected campus keyboard-focusable; first focus was " + first);
    await page.keyboard.press("Tab");
    const second = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
    if (second !== "은평관") throw new Error("Android branch must keep both campuses keyboard-focusable.");
  } finally {
    await setPlatform("web");
    await page.setViewportSize({ width: 375, height: 900 });
  }
  return { result: "PASS", platformBranch: "Android", focusOrder: ["동작관", "은평관"], limitation: "Native View focus mapping additionally checked in installed RN 0.81 source; no device execution." };
}

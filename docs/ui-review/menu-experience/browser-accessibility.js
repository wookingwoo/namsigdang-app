// Additional browser checks. Run after browser-checks.js on the development page.
async (page) => {
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  await page.setViewportSize({ width: 375, height: 900 });

  // The selected day remains October 25, 2026; change only the current-clock
  // input to make it each inclusive boundary. Unit tests cover calendar edges.
  const originalTime = await page.evaluate(() => Date.now());
  try {
    await page.clock.setFixedTime(new Date("2026-07-25T12:00:00+09:00"));
    await page.setViewportSize({ width: 376, height: 900 });
    check(await page.getByRole("button", { name: "다음 날짜", exact: true }).isDisabled(), "Upper-bound next arrow must be disabled.");
    await page.clock.setFixedTime(new Date("2027-01-25T12:00:00+09:00"));
    await page.setViewportSize({ width: 375, height: 900 });
    check(await page.getByRole("button", { name: "이전 날짜", exact: true }).isDisabled(), "Lower-bound previous arrow must be disabled.");
  } finally {
    await page.clock.setFixedTime(originalTime);
    await page.setViewportSize({ width: 376, height: 900 });
    await page.setViewportSize({ width: 375, height: 900 });
  }

  // Measure actual foreground/background colors of rendered text.
  const contrast = await page.evaluate(() => {
    const luminance = (color) => {
      const values = color.match(/[\d.]+/g).slice(0, 3).map(Number).map((value) => {
        const channel = value / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
    };
    const names = ["간장불고기", "남도학숙 식단 안내", "하루를 여는 한 끼", "오늘"];
    return names.map((name) => {
      const element = [...document.querySelectorAll('[dir="auto"]')].find((element) => element.textContent === name);
      let ancestor = element;
      let background = "rgb(255, 255, 255)";
      while (ancestor) {
        const color = getComputedStyle(ancestor).backgroundColor;
        if (color !== "rgba(0, 0, 0, 0)" && color !== "transparent") { background = color; break; }
        ancestor = ancestor.parentElement;
      }
      const a = luminance(getComputedStyle(element).color);
      const b = luminance(background);
      return { name, ratio: Number(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2)) };
    });
  });
  contrast.forEach(({ name, ratio }) => check(ratio >= 4.5, `Insufficient contrast: ${name}, ${ratio}.`));

  // Browser-only text magnification, not a substitute for native Dynamic Type.
  await page.evaluate(() => {
    globalThis.__reviewTextStyles = [...document.querySelectorAll('[dir="auto"]:not([aria-hidden="true"])')].map((element) => {
      const previous = element.getAttribute("style");
      const computed = getComputedStyle(element);
      element.style.fontSize = parseFloat(computed.fontSize) * 2 + "px";
      element.style.lineHeight = parseFloat(computed.lineHeight) * 2 + "px";
      return { element, previous };
    });
  });
  const clippedText = await page.evaluate(() => globalThis.__reviewTextStyles.filter(({ element }) => element.scrollWidth > element.clientWidth + 1).map(({ element }) => element.textContent));
  await page.evaluate(() => globalThis.__reviewTextStyles.forEach(({ element, previous }) => previous === null ? element.removeAttribute("style") : element.setAttribute("style", previous)));
  check(clippedText.length === 0, "Clipped text at 200% browser text size: " + clippedText.join(", "));

  const info = page.getByRole("button", { name: "서비스 정보", exact: true });
  await info.click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor();
  for (let index = 0; index < 8; index++) {
    await page.keyboard.press("Tab");
    check(await dialog.evaluate((element) => element.contains(document.activeElement)), "Tab must stay inside information dialog.");
  }
  check(await page.getByRole("link").count() === 3, "Information links must expose link roles.");
  await page.getByRole("button", { name: "닫기", exact: true }).click();
  await dialog.waitFor({ state: "hidden" });
  await page.waitForFunction(() => localStorage.getItem("selectedCampus") === "Eunpyeong");
  return { result: "PASS", contrast, dateBounds: "both disabled correctly", textMagnification: "200%, no clipping", modalKeyboardTrap: "8 tabs", campusPersistence: "Eunpyeong" };
}

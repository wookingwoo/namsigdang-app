// Run after browser-checks.js. Screenshots are genuine Expo web renders with
// the browser-local service fixture described in README.md.
async (page) => {
  const root = "docs/ui-review/menu-experience/";
  const capture = async (name, width, height) => {
    await page.setViewportSize({ width, height });
    await page.evaluate(async () => {
      await document.fonts.ready;
      document.activeElement?.blur();
      for (const element of document.querySelectorAll("*")) {
        if (element.scrollHeight > element.clientHeight && ["auto", "scroll"].includes(getComputedStyle(element).overflowY)) element.scrollTop = 0;
      }
    });
    await page.waitForTimeout(100);
    await page.screenshot({ path: root + name + ".png", fullPage: true, scale: "css", animations: "disabled" });
  };
  const mode = async (value) => page.evaluate((value) => { globalThis.__menuReview.mode = value; }, value);
  await mode("success");
  const today = page.getByRole("button", { name: "오늘로 이동", exact: true });
  if (await today.isEnabled()) await today.click();
  await page.getByText("간장불고기", { exact: true }).waitFor();
  await capture("after-desktop", 1440, 1000);
  await capture("after-mobile", 375, 900);
  await capture("after-mobile-full", 375, 1700);
  await page.setViewportSize({ width: 375, height: 900 });
  await page.getByRole("button", { name: "서비스 정보", exact: true }).click();
  await page.getByRole("dialog").waitFor();
  await capture("about-mobile", 375, 900);
  await page.getByRole("button", { name: "닫기", exact: true }).click();

  await mode("empty");
  await page.getByRole("button", { name: "다음 날짜", exact: true }).click();
  await page.getByText("식단을 기다리고 있어요", { exact: true }).waitFor();
  await capture("empty-desktop", 1440, 1000);
  await mode("error");
  await page.getByRole("button", { name: "다음 날짜", exact: true }).click();
  await page.getByRole("alert").waitFor();
  await capture("error-desktop", 1440, 1000);
  await mode("pending");
  await page.getByRole("button", { name: "다시 불러오기", exact: true }).click();
  await page.getByRole("status").waitFor();
  await capture("loading-desktop", 1440, 1000);
  await mode("success");
  await today.click();
  await page.getByText("간장불고기", { exact: true }).waitFor();
  await page.evaluate(() => globalThis.__menuReview.pending.splice(0).forEach((resolve) => resolve({ breakfast: [], lunch: [], dinner: [] })));
  return { captured: ["after-desktop", "after-mobile", "after-mobile-full", "about-mobile", "empty-desktop", "error-desktop", "loading-desktop"], fixture: "Sample menus, not live data", source: "982b09c" };
}

// Run with the Playwright browser_run_code tool's filename argument while the
// Expo development page is open. Only the network service export is replaced;
// React, the screen, storage, dates, and interaction handlers remain real.
// The fixture is browser-local and is never included in the application bundle.
async (page) => {
  const check = (condition, message) => {
    if (!condition) throw new Error(message);
  };
  await page.evaluate(() => {
    const moduleEntry = [...globalThis.__r.getModules()].find(
      ([, module]) => module.verboseName === "src/services/menu.ts",
    );
    if (!moduleEntry) throw new Error("Open the Expo development build first.");
    globalThis.__menuReview = { mode: "success", pending: [], requests: [] };
    globalThis.__r(moduleEntry[0]).getMenuByDate = async (campus, dateKey) => {
      const state = globalThis.__menuReview;
      state.requests.push({ campus, dateKey, mode: state.mode });
      if (state.mode === "error") throw new Error("Review: simulated offline");
      if (state.mode === "pending") {
        return await new Promise((resolve) => state.pending.push(resolve));
      }
      if (state.mode === "empty") return { breakfast: [], lunch: [], dinner: [] };
      return {
        breakfast: state.mode === "partial" ? [] : ["쌀밥", "소고기미역국", "계란말이", "도시락김", "배추김치"],
        lunch: ["잡곡밥", "돈육김치찌개", campus === "Dongjak" ? "돼지불고기" : "간장불고기", "콩나물무침", "깍두기"],
        dinner: ["카레라이스", "유부장국", "치킨너겟", "양배추샐러드", "배추김치"],
      };
    };
  });

  const mode = async (value) => page.evaluate((value) => { globalThis.__menuReview.mode = value; }, value);
  const campus = (name) => page.getByRole("tab", { name, exact: true });
  const next = () => page.getByRole("button", { name: "다음 날짜", exact: true });
  const today = () => page.getByRole("button", { name: "오늘로 이동", exact: true });

  if (await campus("동작관").getAttribute("aria-selected") === "true") {
    await campus("은평관").click();
    await page.getByText("간장불고기", { exact: true }).waitFor();
  }
  await campus("동작관").click({ timeout: 3000 });
  await page.getByText("돼지불고기", { exact: true }).waitFor();
  check(await campus("동작관").getAttribute("aria-selected") === "true", "Campus selection must be announced.");
  await campus("은평관").click();
  await page.getByText("간장불고기", { exact: true }).waitFor();
  await campus("은평관").focus();
  await page.keyboard.press("ArrowLeft");
  await page.getByText("돼지불고기", { exact: true }).waitFor();
  await page.keyboard.press("ArrowRight");
  await page.getByText("간장불고기", { exact: true }).waitFor();
  await page.getByRole("button", { name: "이전 날짜", exact: true }).click();
  check(await today().isEnabled(), "Today shortcut must become enabled away from today.");
  await today().click();
  check(await today().isDisabled(), "Today shortcut stays visible and disabled on today.");
  check(await today().evaluate((element) => !element.style.outlineWidth), "A disabled today shortcut must not retain a stale focus ring.");
  check(await page.getByRole("button", { name: /선택됨/ }).count() === 1, "Exactly one selected date must be named.");

  await mode("error");
  await next().click();
  await page.getByRole("alert").waitFor();
  const selectedBeforeRetry = await page.getByRole("button", { name: /선택됨/ }).getAttribute("aria-label");
  await mode("success");
  await page.getByRole("button", { name: "다시 불러오기", exact: true }).click({ timeout: 3000 });
  await page.getByText("간장불고기", { exact: true }).waitFor();
  check(await page.getByRole("alert").count() === 0, "Retry must clear the error.");
  check(await page.getByRole("button", { name: /선택됨/ }).getAttribute("aria-label") === selectedBeforeRetry, "Retry must preserve the selected date.");
  check(await campus("은평관").getAttribute("aria-selected") === "true", "Retry must preserve the selected campus.");

  // Retry itself is in flight when the date changes; its old result must be
  // ignored just like an old request triggered by campus/date selection.
  await mode("error");
  await next().click();
  await page.getByRole("alert").waitFor();
  const retryDate = await page.getByRole("button", { name: /선택됨/ }).getAttribute("aria-label");
  await mode("pending");
  await page.getByRole("button", { name: "다시 불러오기", exact: true }).click();
  await page.getByRole("status").waitFor();
  await mode("success");
  await next().click();
  await page.getByText("간장불고기", { exact: true }).waitFor();
  check(await page.getByRole("button", { name: /선택됨/ }).getAttribute("aria-label") !== retryDate, "Date selection must work during a pending retry.");
  await page.evaluate(() => globalThis.__menuReview.pending.splice(0).forEach((resolve) => resolve({ breakfast: ["오래된 재시도"], lunch: [], dinner: [] })));
  await page.waitForTimeout(100);
  check(await page.getByText("오래된 재시도", { exact: true }).count() === 0, "A pending retry must not overwrite the newly selected date.");

  await mode("pending");
  await next().click();
  await page.getByRole("status").waitFor();
  await mode("success");
  await campus("동작관").click();
  await page.getByText("돼지불고기", { exact: true }).waitFor();
  await page.evaluate(() => globalThis.__menuReview.pending.splice(0).forEach((resolve) => resolve({ breakfast: ["오래된 응답"], lunch: [], dinner: [] })));
  await page.waitForTimeout(100);
  check(await page.getByText("오래된 응답", { exact: true }).count() === 0, "A stale response must not overwrite a new campus.");

  await mode("partial");
  await next().click();
  await page.getByText("등록된 식단이 없어요", { exact: true }).waitFor();
  check(await page.getByText("돼지불고기", { exact: true }).isVisible(), "A missing meal must not hide other meals.");
  await mode("empty");
  await next().click();
  await page.getByText("식단을 기다리고 있어요", { exact: true }).waitFor();

  await mode("success");
  await campus("은평관").click();
  await today().click();
  await page.getByText("간장불고기", { exact: true }).waitFor();
  const info = page.getByRole("button", { name: "서비스 정보", exact: true }).first();
  await info.click();
  await page.getByRole("dialog").waitFor();
  await page.getByRole("button", { name: "닫기", exact: true }).waitFor();
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  check(await info.evaluate((element) => document.activeElement === element), "Closing information must restore trigger focus.");

  const layouts = [];
  for (const size of [{ width: 375, height: 900 }, { width: 768, height: 1024 }, { width: 1440, height: 1000 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(size);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    check(!overflow, `Horizontal overflow at ${size.width}px.`);
    const controls = await page.getByRole("button", { name: "이전 날짜", exact: true }).boundingBox();
    check(controls.width >= 48 && controls.height >= 48, "Date arrows require 48px touch targets.");
    layouts.push({ ...size, overflow });
  }
  await page.setViewportSize({ width: 375, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.keyboard.press("Tab");
  check(await page.evaluate(() => document.activeElement !== document.body), "Keyboard focus must reach an interactive element.");
  return { result: "PASS", checks: ["campus", "dates", "today", "selected semantics", "retry retains campus/date", "pending retry/date race", "loading", "stale campus cancellation", "partial empty", "empty", "modal Escape and focus", "touch targets", "responsive overflow", "reduced motion"], layouts, fixture: "Sample meals, not live dining data." };
}

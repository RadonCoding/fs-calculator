import { test, expect } from "@playwright/test";

test.describe("Calculator", () => {
  test("evaluates 1 + 2 × 3 ÷ 4 = 2.5", async ({ page }) => {
    page.on("response", async (res) => {
      if (!res.url().includes("/evaluate")) return;

      console.log("STATUS:", res.status());
      console.log("URL:", res.url());

      try {
        console.log("BODY:", await res.text());
      } catch (e) {
        console.log("BODY: <unreadable>");
      }
    });

    await page.goto("/");
    await page.getByRole("button", { name: "1" }).click();
    await page.getByRole("button", { name: "+" }).click();
    await page.getByRole("button", { name: "2" }).click();
    await page.getByRole("button", { name: "×" }).click();
    await page.getByRole("button", { name: "3" }).click();
    await page.getByRole("button", { name: "÷" }).click();
    await page.getByRole("button", { name: "4" }).click();
    await page.getByRole("button", { name: "=" }).click();
    await page.waitForResponse(
      (res) => res.url().includes("/evaluate") && res.ok(),
    );
    await expect(page.getByRole("textbox")).toHaveValue("2.5");
  });
});

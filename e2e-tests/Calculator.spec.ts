import { test, expect } from "@playwright/test";

test.describe("Calculator", () => {
  test("evaluates 1 + 2 × 3 ÷ 4 = 2.5", async ({ page }) => {
    page.on("console", (msg) => {
      console.log("BROWSER LOG:", msg.type(), msg.text());
    });

    page.on("request", (req) => {
      if (req.url().includes("/evaluate")) {
        console.log("REQUEST:", req.method(), req.url());
      }
    });

    page.on("response", (res) => {
      if (res.url().includes("/evaluate")) {
        console.log("RESPONSE:", res.status(), res.url());
      }
    });

    page.on("requestfailed", (req) => {
      if (req.url().includes("/evaluate")) {
        console.log("FAILED REQUEST:", req.url(), req.failure());
      }
    });

    console.log("NAVIGATE");
    await page.goto("/");

    const buttons = ["1", "+", "2", "×", "3", "÷", "4", "="];

    for (const b of buttons) {
      console.log("CLICK:", b);
      await page.getByRole("button", { name: b }).click();
    }

    console.log("WAITING FOR RESPONSE");
    await page.waitForResponse(
      (res) => res.url().includes("/evaluate") && res.ok(),
    );

    console.log("ASSERT VALUE");
    await expect(page.getByRole("textbox")).toHaveValue("2.5");
  });
});

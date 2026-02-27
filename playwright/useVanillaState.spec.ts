import { test, expect } from "@playwright/test"

test.describe("useVanillaState", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("updates view when @rerender:increase() is called", async ({ page }) => {
    await expect(page.locator("#secret-view")).toHaveText("secret")
    await expect(page.locator("#count-view")).toHaveText("0")
    await page.click("#increase-action")
    await expect(page.locator("#secret-view")).toHaveText("secret")
    await expect(page.locator("#count-view")).toHaveText("1")
  })

  test("updates view when @rerender:decrease() is called", async ({ page }) => {
    await expect(page.locator("#secret-view")).toHaveText("secret")
    await expect(page.locator("#count-view")).toHaveText("0")
    await page.click("#decrease-action")
    await expect(page.locator("#secret-view")).toHaveText("secret")
    await expect(page.locator("#count-view")).toHaveText("-1")
  })

  test("remains unchanged when silent() is called", async ({ page }) => {
    await expect(page.locator("#secret-view")).toHaveText("secret")
    await expect(page.locator("#count-view")).toHaveText("0")
    await page.click("#silent-action")
    await expect(page.locator("#secret-view")).toHaveText("secret")
    await expect(page.locator("#count-view")).toHaveText("0")
  })

  test("shared store updates across components", async ({ page }) => {
    await expect(page.locator("#shared-view")).toHaveText("shared: 0")
    await page.click("#shared-action")
    await expect(page.locator("#shared-view")).toHaveText("shared: 1")
  })
})

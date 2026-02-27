import { test, expect } from "@playwright/test"

test.describe("useVanillaState", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("updates view when @rerender:increase() is called", async ({ page }) => {
    await expect(page.locator("#secret-view")).toHaveText("secret")
    await expect(page.locator("#count-view")).toHaveText("0")
    await page.locator("#increase-action").click()
    await expect(page.locator("#secret-view")).toHaveText("secret")
    await expect(page.locator("#count-view")).toHaveText("1")
  })

  test("updates view when @rerender:decrease() is called", async ({ page }) => {
    await expect(page.locator("#secret-view")).toHaveText("secret")
    await expect(page.locator("#count-view")).toHaveText("0")
    await page.locator("#decrease-action").click()
    await expect(page.locator("#secret-view")).toHaveText("secret")
    await expect(page.locator("#count-view")).toHaveText("-1")
  })

  test("remains unchanged when silent() is called", async ({ page }) => {
    await expect(page.locator("#secret-view")).toHaveText("secret")
    await expect(page.locator("#count-view")).toHaveText("0")
    await page.locator("#silent-action").click()
    await expect(page.locator("#secret-view")).toHaveText("secret")
    await expect(page.locator("#count-view")).toHaveText("0")
  })
})

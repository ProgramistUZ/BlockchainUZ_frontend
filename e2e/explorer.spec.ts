import { test, expect } from "@playwright/test";

test.describe("Explorer happy path", () => {
  test("block number → details → breadcrumb home", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /BlockchainUZ Explorer/,
    );

    // Smart search: integer routes straight to the block detail page
    await page.getByRole("searchbox").first().fill("18946122");
    await page.getByRole("searchbox").first().press("Enter");

    await expect(page).toHaveURL(/\/en\/blocks\/18946122/);
    await expect(
      page.getByRole("heading", { level: 1 }),
    ).toContainText("Block #18");

    // Breadcrumb → Blocks list
    await page.getByRole("link", { name: "Blocks" }).first().click();
    await expect(page).toHaveURL(/\/en\/blocks/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Blocks");
  });

  test("URL filter persists across refresh", async ({ page }) => {
    await page.goto("/en/transactions?status=PENDING");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Transactions",
    );
    // Status select shows PENDING
    await expect(page.getByRole("combobox", { name: "Status" })).toHaveText(
      /Pending/i,
    );
    // Reload — URL state survives
    await page.reload();
    await expect(page).toHaveURL(/status=PENDING/);
  });

  test("invalid input shows helpful message", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("searchbox").first().fill("not-a-hash");
    await page.getByRole("searchbox").first().press("Enter");
    await expect(page).toHaveURL(/\/en\/search/);
    await expect(page.getByText(/Unknown input/i)).toBeVisible();
  });

  test("nonexistent block returns 404 page", async ({ page }) => {
    await page.goto("/en/blocks/99999999999");
    await expect(
      page.getByRole("heading", { level: 1, name: "Page not found" }),
    ).toBeVisible({ timeout: 10_000 });
  });
});

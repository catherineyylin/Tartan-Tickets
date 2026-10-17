import { expect, test } from "@playwright/test";

test("Ridge support chat shows suggested questions and saved-data panels", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "How can I help you today?" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Where is my order?" })).toBeVisible();
  await expect(page.getByRole("button", { name: "I want to return something" })).toBeVisible();
  await expect(page.getByRole("button", { name: "My backpack zipper broke" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What Ridge remembers about you" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tickets created" })).toBeVisible();
});

test("Ridge chat can submit a question and renders a server configuration error", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("textbox", { name: "Message Ridge" }).fill("Where is my order?");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByText("Where is my order?", { exact: true })).toBeVisible();
  await expect(page.locator(".error-message")).toContainText("not configured");
});
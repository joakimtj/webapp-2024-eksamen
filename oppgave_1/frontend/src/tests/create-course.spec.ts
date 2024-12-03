import {
  test,
  expect,
  type Page,
  type Locator,
  type BrowserContext,
} from "@playwright/test";

let page: Page;
let context: BrowserContext;

test.describe("Oppgave 1 Create", () => {
  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto("/courses/new");
  });
  /*
    test.beforeEach(async () => {
      // Reset to initial state before each test
      await page.reload();
    });
  */
  test.describe("When showing create page", () => {
    test("Should have test-id steps", async () => {
      const element = page.getByTestId("steps");
      const isVisible = await element.isVisible();
      expect(isVisible).toBe(true);
    });

    test("Should have test-id form_submit", async () => {
      const element = page.getByTestId("form_submit");
      const isVisible = await element.isVisible();
      expect(isVisible).toBe(true);
    });

    test("Should have test-id title", async () => {
      const element = page.getByTestId("title");
      const isVisible = await element.isVisible();
      expect(isVisible).toBe(true);
    });

    test("Should have test-id form", async () => {
      const element = page.getByTestId("form");
      const isVisible = await element.isVisible();
      expect(isVisible).toBe(true);
    });

    test("Should have test-id course_step", async () => {
      const element = page.getByTestId("course_step");
      const isVisible = await element.isVisible();
      expect(isVisible).toBe(true);
    });

    test("Should have test-id form_title", async () => {
      const element = page.getByTestId("form_title");
      const isVisible = await element.isVisible();
      expect(isVisible).toBe(true);
    });

    test("Should have test-id form_slug", async () => {
      const element = page.getByTestId("form_slug");
      const isVisible = await element.isVisible();
      expect(isVisible).toBe(true);
    });

    test("Should have test-id form_description", async () => {
      const element = page.getByTestId("form_description");
      const isVisible = await element.isVisible();
      expect(isVisible).toBe(true);
    });

    test("Should have test-id form_category", async () => {
      const element = page.getByTestId("form_category");
      const isVisible = await element.isVisible();
      expect(isVisible).toBe(true);
    });
  });



  test.describe("When stepping from first to second step", () => {
    test("Should show error if all required fields are missing", async () => {
      // Click the second step button (index 1)
      await page.getByTestId("step").nth(1).click();

      // Check if form_error is visible
      const formError = page.getByTestId("form_error");
      await expect(formError).toBeVisible();
    });

    test("Should show error if title field is missing", async () => {
      // Fill in all fields except title
      await page.getByTestId("form_slug").fill("test-slug");
      await page.getByTestId("form_description").fill("Test description");
      await page.getByTestId("form_category").selectOption({ index: 1 });

      // Try to move to next step
      await page.getByTestId("step").nth(1).click();

      // Check if form_error is visible
      const formError = page.getByTestId("form_error");
      await expect(formError).toBeVisible();
    });

    test("Should show error if slug field is missing", async () => {
      // Fill in all fields except slug
      await page.getByTestId("form_title").fill("Test title");
      await page.getByTestId("form_description").fill("Test description");
      await page.getByTestId("form_category").selectOption({ index: 1 });

      // Try to move to next step
      await page.getByTestId("step").nth(1).click();

      // Check if form_error is visible
      const formError = page.getByTestId("form_error");
      await expect(formError).toBeVisible();
    });

    test("Should show error if description field is missing", async () => {
      // Fill in all fields except description
      await page.getByTestId("form_title").fill("Test title");
      await page.getByTestId("form_slug").fill("test-slug");
      await page.getByTestId("form_category").selectOption({ index: 1 });

      // Try to move to next step
      await page.getByTestId("step").nth(1).click();

      // Check if form_error is visible
      const formError = page.getByTestId("form_error");
      await expect(formError).toBeVisible();
    });

    test("Should show error if category field is missing", async () => {
      // Fill in all fields except category
      await page.getByTestId("form_title").fill("Test title");
      await page.getByTestId("form_slug").fill("test-slug");
      await page.getByTestId("form_description").fill("Test description");

      // Try to move to next step
      await page.getByTestId("step").nth(1).click();

      // Check if form_error is visible
      const formError = page.getByTestId("form_error");
      await expect(formError).toBeVisible();
    });

    test("Should not show error if all fields are provided", async () => {
      // Fill in all fields
      await page.getByTestId("form_title").fill("Test title");
      await page.getByTestId("form_slug").fill("test-slug");
      await page.getByTestId("form_description").fill("Test description");
      await page.getByTestId("form_category").selectOption({ index: 1 });

      // Try to move to next step
      await page.getByTestId("step").nth(1).click();

      // Check if form_error is not visible
      const formError = page.getByTestId("form_error");
      await expect(formError).not.toBeVisible();
    });
  });



  test.describe("When at step two", () => {
    test.beforeAll(async () => {
      // Fill in all required fields.
      // We need dummy data to pass validation
      await page.getByTestId("form_title").fill("Test Course");
      await page.getByTestId("form_slug").fill("test-course");
      await page.getByTestId("form_description").fill("Test Description");
      await page.getByTestId("form_category").selectOption({ index: 1 });

      // Navigate to step two
      const stepButtons = page.getByTestId("step");
      await stepButtons.nth(1).click();
    });


    test("Should have disabled submit btn", async () => {
      const submitButton = page.getByTestId("form_submit");
      const isDisabled = await submitButton.isDisabled();
      expect(isDisabled).toBe(true);
    });

    test("Should have no errors", async () => {
      const formError = page.getByTestId("form_error");
      await expect(formError).not.toBeVisible();
    });
    test("Should have no success", async () => {
      const formSuccess = page.getByTestId("form_success");
      await expect(formSuccess).not.toBeVisible();
    });
    test("Should have test-id lessons", async () => {
      const lessons = page.getByTestId("lessons");
      const isVisible = await lessons.isVisible();
      expect(isVisible).toBe(true);
    });
    test("Should have test-id form_lesson_add", async () => {
      const formLessonAdd = page.getByTestId("form_lesson_add");
      const isVisible = await formLessonAdd.isVisible();
      expect(isVisible).toBe(true);
    });
  });




  test.describe("When added new lesson", () => {
    test.beforeAll(async () => {
      // Fill in all required fields.
      // We need dummy data to pass validation
      await page.getByTestId("form_title").fill("Test Course");
      await page.getByTestId("form_slug").fill("test-course");
      await page.getByTestId("form_description").fill("Test Description");
      await page.getByTestId("form_category").selectOption({ index: 1 });

      // Navigate to step two
      const stepButtons = page.getByTestId("step");
      await stepButtons.nth(1).click();

      // Add a new lesson
      const formLessonAdd = page.getByTestId("form_lesson_add");
      await formLessonAdd.click();
    });
    test("Should have disabled submit btn", async () => {
      const submitButton = page.getByTestId("form_submit");
      const isDisabled = await submitButton.isDisabled();
      expect(isDisabled).toBe(true);
    });
    test("Should have no errors", async () => {
      const formError = page.getByTestId("form_error");
      await expect(formError).not.toBeVisible();
    });
    test("Should have no success", async () => {
      const formSuccess = page.getByTestId("form_success");
      await expect(formSuccess).not.toBeVisible();
    });
    test("Should have test-id lessons", async () => {
      const lessons = page.getByTestId("lessons");
      const isVisible = await lessons.isVisible();
      expect(isVisible).toBe(true);
    });
    test("Should have test-id form_lesson_add", async () => {
      const formLessonAdd = page.getByTestId("form_lesson_add");
      const isVisible = await formLessonAdd.isVisible();
      expect(isVisible).toBe(true);
    });
    test("Should have test-id form_lesson_add_text", async () => {
      const formLessonAddText = page.getByTestId("form_lesson_add_text");
      const isVisible = await formLessonAddText.isVisible();
      expect(isVisible).toBe(true);
    });
    test("Should have test-id form_lesson_title", async () => {
      const formLessonTitle = page.getByTestId("form_lesson_title");
      const isVisible = await formLessonTitle.isVisible();
      expect(isVisible).toBe(true);
    });
    test("Should have test-id form_lesson_slug", async () => {
      const formLessonSlug = page.getByTestId("form_lesson_slug");
      const isVisible = await formLessonSlug.isVisible();
      expect(isVisible).toBe(true);
    });
    test("Should have test-id form_lesson_preAmble", async () => {
      const formLessonPreAmble = page.getByTestId("form_lesson_preAmble");
      const isVisible = await formLessonPreAmble.isVisible();
      expect(isVisible).toBe(true);
    });
    test("Should have one lesson", async () => {
      const lessons = page.getByTestId("lessons");
      const count = await lessons.count();
      expect(count).toBe(1);
    });
  });



  test.describe("When creating multiple lessons", () => {
    test.beforeAll(async () => {
      // Fill in all required fields.
      // We need dummy data to pass validation
      await page.getByTestId("form_title").fill("Test Course");
      await page.getByTestId("form_slug").fill("test-course");
      await page.getByTestId("form_description").fill("Test Description");
      await page.getByTestId("form_category").selectOption({ index: 1 });

      // Navigate to step two
      const stepButtons = page.getByTestId("step");
      await stepButtons.nth(1).click();

      // Add a new lesson
      const formLessonAdd = page.getByTestId("form_lesson_add");
      await formLessonAdd.click();
      // Count the lesson buttons instead of the container
      let lessonButtons = page.getByTestId("select_lesson_btn");
      let count = await lessonButtons.count();
      expect(count).toBe(1);

      // Fill in all required fields for lesson
      await page.getByTestId("form_lesson_title").fill("Test Lesson");
      await page.getByTestId("form_lesson_slug").fill("test-lesson");
      await page.getByTestId("form_lesson_preAmble").fill("Test preAmble");
      await page.getByTestId("form_lesson_text").fill("Test text");

      // Add another lesson
      await formLessonAdd.click();
      lessonButtons = page.getByTestId("select_lesson_btn");
      count = await lessonButtons.count();
      expect(count).toBe(2);
    });
    test("Should have disabled submit btn if title is missing", async () => {
      // Fill in all required fields except title
      await page.getByTestId("form_lesson_slug").fill("test-lesson");
      await page.getByTestId("form_lesson_preAmble").fill("Test preAmble");
      await page.getByTestId("form_lesson_text").fill("Test text");
      const submitButton = page.getByTestId("form_submit");
      const isDisabled = await submitButton.isDisabled();
      expect(isDisabled).toBe(true);
    });
    test("Should have disabled submit btn if preAmble is missing", async () => {
      // Fill in all required fields except preAmble
      await page.getByTestId("form_lesson_title").fill("Test Lesson");
      await page.getByTestId("form_lesson_slug").fill("test-lesson");
      await page.getByTestId("form_lesson_text").fill("Test text");
      const submitButton = page.getByTestId("form_submit");
      const isDisabled = await submitButton.isDisabled();
      expect(isDisabled).toBe(true);
    });
    test("Should have disabled submit btn if slug is missing", async () => {
      // Fill in all required fields except slug
      await page.getByTestId("form_lesson_title").fill("Test Lesson");
      await page.getByTestId("form_lesson_preAmble").fill("Test preAmble");
      await page.getByTestId("form_lesson_text").fill("Test text");
      const submitButton = page.getByTestId("form_submit");
      const isDisabled = await submitButton.isDisabled();
      expect(isDisabled).toBe(true);
    });
    test("Should have disabled submit btn if text is missing", async () => {
      // Fill in all required fields except text
      await page.getByTestId("form_lesson_title").fill("Test Lesson");
      await page.getByTestId("form_lesson_slug").fill("test-lesson");
      await page.getByTestId("form_lesson_preAmble").fill("Test preAmble");
      const submitButton = page.getByTestId("form_submit");
      const isDisabled = await submitButton.isDisabled();
      expect(isDisabled).toBe(true);
    });

    /* Huh??? */
    // test("Should have disabled submit btn if all fields are added on last lesson", async () => { });
    // test("Should have enabled submit btn if all fields are added on all lesson", async () => { });


    test("Should disable publish button if new lesson is added", async () => {
      // Check if publish button is disabled
      const publishButton = page.getByTestId("form_submit");
      const isDisabled = await publishButton.isDisabled();
      expect(isDisabled).toBe(true);
    });
  });

  test.describe("When creating multiple lessons with multiple textboxes", () => {
    test("Should have enabled publish button if all text fields are valid", async () => { });
  });
  test.describe("When created new course", () => {
    test("Should have show success when submitted", async () => { });
    test("Should show preview of content when submitted", async () => { });
    test("Should get response 200 from server", async () => { });
    test("Should get correct data from server", async () => { });
  });
});

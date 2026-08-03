import { renderHook } from "@testing-library/react";
import usePageMeta from "../../src/utils/usePageMeta";

const SITE_NAME = "Zymuk Trần";

describe("usePageMeta", () => {
  beforeEach(() => {
    document.title = "";
    document
      .querySelectorAll("meta[name]")
      .forEach((tag) => tag.remove());
  });

  it("sets document.title to 'title - site name' when title is given", () => {
    renderHook(() => usePageMeta({ title: "Calculator", description: "d" }));
    expect(document.title).toBe(`Calculator - ${SITE_NAME}`);
  });

  it("uses the fallback title when title is not provided", () => {
    renderHook(() => usePageMeta({ description: "d" }));
    expect(document.title).toBe(`${SITE_NAME} - QA Engineer Portfolio`);
  });

  it("creates meta description tags from the description prop", () => {
    renderHook(() =>
      usePageMeta({ title: "T", description: "A short description." }),
    );
    expect(
      document.querySelector('meta[name="description"]').getAttribute("content"),
    ).toBe("A short description.");
    expect(
      document
        .querySelector('meta[name="og:description"]')
        .getAttribute("content"),
    ).toBe("A short description.");
    expect(
      document
        .querySelector('meta[name="twitter:description"]')
        .getAttribute("content"),
    ).toBe("A short description.");
  });

  it("updates the existing meta tag content on prop change", () => {
    const { rerender } = renderHook(
      (props) => usePageMeta(props),
      { initialProps: { title: "A", description: "first" } },
    );
    rerender({ title: "B", description: "second" });
    expect(
      document.querySelector('meta[name="description"]').getAttribute("content"),
    ).toBe("second");
  });
});

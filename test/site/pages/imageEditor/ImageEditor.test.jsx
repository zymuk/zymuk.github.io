import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ImageEditor from "../../../../src/site/pages/imageEditor/ImageEditor";

const makeCtx = () => ({
  drawImage: jest.fn(),
  getImageData: jest.fn((x, y, w, h) => ({
    data: new Uint8ClampedArray(w * h * 4),
    width: w,
    height: h,
  })),
  putImageData: jest.fn(),
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  setLineDash: jest.fn(),
  strokeRect: jest.fn(),
  fillStyle: "",
  strokeStyle: "",
  lineWidth: 1,
});

class MockImage {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.naturalWidth = 200;
    this.naturalHeight = 100;
  }
  set src(value) {
    this._src = value;
    if (this.onload) this.onload();
  }
  get src() {
    return this._src;
  }
}

const getFieldValue = (labelText) => {
  const input = screen.getByLabelText(labelText);
  return input
    .closest(".image-editor-field")
    .querySelector(".image-editor-val").textContent;
};

const loadImageFile = (container) => {
  const file = new File(["dummy"], "photo.png", { type: "image/png" });
  fireEvent.change(container.querySelector('input[type="file"]'), {
    target: { files: [file] },
  });
};

describe("ImageEditor", () => {
  beforeEach(() => {
    jest
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockImplementation(() => makeCtx());
    jest
      .spyOn(HTMLCanvasElement.prototype, "toBlob")
      .mockImplementation((cb) => cb(new Blob(["x"], { type: "image/webp" })));
    global.URL.createObjectURL = jest.fn(() => "blob:mock");
    global.URL.revokeObjectURL = jest.fn();
    global.Image = MockImage;
  });

  afterEach(() => {
    delete global.Image;
    delete global.URL.createObjectURL;
    delete global.URL.revokeObjectURL;
  });

  it("renders title, subtitle and control sections", () => {
    render(<ImageEditor />);

    expect(screen.getByText("Image Editor")).toBeInTheDocument();
    expect(
      screen.getByText(/Remove white background, crop, resize/),
    ).toBeInTheDocument();
    expect(screen.getByText("1 · Source image")).toBeInTheDocument();
    expect(screen.getByText("2 · Manual crop")).toBeInTheDocument();
    expect(screen.getByText("3 · Remove white background")).toBeInTheDocument();
    expect(screen.getByText("4 · Preview background")).toBeInTheDocument();
    expect(screen.getByText("5 · Manual erase (click the image)")).toBeInTheDocument();
    expect(screen.getByText("6 · Export")).toBeInTheDocument();
  });

  it("disables export and crop controls until an image is loaded", () => {
    render(<ImageEditor />);

    expect(screen.getByRole("button", { name: "Download WEBP" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Select crop region" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Remove crop" }),
    ).toBeDisabled();
    expect(screen.getByText(/No image yet/)).toBeInTheDocument();
  });

  it("updates the white threshold label when the slider changes", () => {
    render(<ImageEditor />);
    fireEvent.change(screen.getByLabelText("White threshold"), {
      target: { value: "80" },
    });
    expect(getFieldValue("White threshold")).toBe("80");
  });

  it("updates the resize label when the scale slider changes", () => {
    render(<ImageEditor />);
    fireEvent.change(screen.getByLabelText("Resize result"), {
      target: { value: "150" },
    });
    expect(getFieldValue("Resize result")).toBe("150%");
  });

  it("updates the fixed border crop label in cm and px", () => {
    render(<ImageEditor />);
    const label = "Fixed border crop (per side)";
    fireEvent.change(screen.getByLabelText(label), {
      target: { value: "4" },
    });
    // 4 cm at 96 dpi => round(4 * 96 / 2.54) = 151 px
    expect(getFieldValue(label)).toBe("4 cm ≈ 151 px");
  });

  it("switches the download format between WEBP and PNG", () => {
    render(<ImageEditor />);
    const select = screen.getByLabelText("Download format");
    expect(select.value).toBe("image/webp");
    expect(
      screen.getByRole("button", { name: "Download WEBP" }),
    ).toBeInTheDocument();

    fireEvent.change(select, { target: { value: "image/png" } });
    expect(select.value).toBe("image/png");
    expect(
      screen.getByRole("button", { name: "Download PNG" }),
    ).toBeInTheDocument();
  });

  it("loads an image, processes it and enables export buttons", async () => {
    const { container } = render(<ImageEditor />);
    loadImageFile(container);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Download WEBP" }),
      ).not.toBeDisabled();
    });
    expect(screen.getByRole("button", { name: "Reset" })).not.toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Select crop region" }),
    ).not.toBeDisabled();
    expect(screen.getByText(/Original: 200×100 px/)).toBeInTheDocument();
    expect(screen.queryByText(/No image yet/)).not.toBeInTheDocument();
  });

  it("toggles crop mode when the crop button is clicked", async () => {
    const { container } = render(<ImageEditor />);
    loadImageFile(container);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Select crop region" }),
      ).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Select crop region" }));
    expect(
      screen.getByRole("button", { name: "Finish selection" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Finish selection" }));
    expect(
      screen.getByRole("button", { name: "Select crop region" }),
    ).toBeInTheDocument();
  });

  it("downloads the processed image via toBlob", async () => {
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    const { container } = render(<ImageEditor />);
    loadImageFile(container);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Download WEBP" }),
      ).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Download WEBP" }));

    expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it("resets back to the empty state", async () => {
    const { container } = render(<ImageEditor />);
    loadImageFile(container);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Reset" })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByRole("button", { name: "Download WEBP" })).toBeDisabled();
    expect(screen.getByText(/No image yet/)).toBeInTheDocument();
  });
});

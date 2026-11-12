import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CheckProgress } from "./check-progress";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("CheckProgress", () => {
  it("restores saved items and persists the next checkbox state", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [{ key: "expense", done: true }] }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) });
    vi.stubGlobal("fetch", fetchMock);

    render(<CheckProgress />);

    expect(await screen.findByText("1개 완료 · 3개 남음")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: /보험 구조 정리/ }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const request = fetchMock.mock.calls[1][1] as RequestInit;
    const body = JSON.parse(String(request.body));
    expect(body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "expense", done: true }),
        expect.objectContaining({ key: "insurance", done: true }),
      ]),
    );
  });
});

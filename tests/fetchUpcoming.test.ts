import { fetchUpcoming, latestMatches } from "../esports/upcoming";
global.fetch = jest.fn();

beforeEach(() => {
  latestMatches.length = 0;
});

describe("fetchUpcoming", () => {
  it("should return null when there are no upcoming matches", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { segments: [] } }),
    });

    const result = await fetchUpcoming();
    expect(result).toBeNull();
  });

  it("should return null on the first API call even if matches exist", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          segments: [
            {
              team1: "Team Alpha",
              team2: "Team Beta",
              unix_timestamp: "2025-02-25 19:00:00",
              match_series: "Group Stage",
              match_event: "Game Changers",
            },
          ],
        },
      }),
    });

    const firstCall = await fetchUpcoming();
    expect(firstCall).toBeNull(); // First call should just store the matches
  });

  it("should detect a single new match on the second API call", async () => {
    // First call (just stores matches)
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          segments: [
            {
              team1: "Team Alpha",
              team2: "Team Beta",
              unix_timestamp: "2025-02-25 19:00:00",
              match_series: "Group Stage",
              match_event: "Game Changers",
            },
          ],
        },
      }),
    });

    await fetchUpcoming();

    // Second call (new match detected)
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          segments: [
            {
              team1: "Team Gamma",
              team2: "Team Delta",
              unix_timestamp: "2025-02-25 20:00:00",
              match_series: "Group Stage",
              match_event: "Game Changers",
            },
          ],
        },
      }),
    });

    const result = await fetchUpcoming();
    expect(result).toContain("Team Alpha vs Team Beta has just started");
  });

  it("should detect two new matches starting at the same time", async () => {
    // First call (just stores matches)
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          segments: [
            {
              team1: "Team Alpha",
              team2: "Team Beta",
              unix_timestamp: "2025-02-25 18:00:00",
              match_series: "Group Stage",
              match_event: "Game Changers",
            },
            {
              team1: "Team Gamma",
              team2: "Team Delta",
              unix_timestamp: "2025-02-25 18:00:00",
              match_series: "Group Stage",
              match_event: "Game Changers",
            },
          ],
        },
      }),
    });

    await fetchUpcoming(); // First call - should return null

    // Second call (two new matches detected)
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          segments: [
            {
              team1: "Team Omega",
              team2: "Team Sigma",
              unix_timestamp: "2025-02-25 19:00:00",
              match_series: "Finals",
              match_event: "Championship",
            },
            {
              team1: "Team Sigmund",
              team2: "Team Freud",
              unix_timestamp: "2025-02-25 19:00:00",
              match_series: "Finals",
              match_event: "Championship",
            },
          ],
        },
      }),
    });

    const result = await fetchUpcoming();
    expect(result).toContain("Team Alpha vs Team Beta has just started");
    expect(result).toContain("Team Gamma vs Team Delta has just started");
  });
});

import { fetchUpcoming, latestTeams } from "../esports/upcoming";

global.fetch = jest.fn();

describe("fetchUpcoming", () => {
  beforeEach(() => {
    latestTeams.team1 = "TEAM_1";
    latestTeams.team2 = "TEAM_2";
    jest.clearAllMocks();
  });

  it("should return null and update latest teams if no previous teams are set", async () => {
    // Mock a successful API response
    const mockData = {
      data: {
        status: 200,
        segments: [
          {
            team1: "T1",
            team2: "Trace Esports",
            match_series: "Swiss Stage: Round 2 (0-1)",
            match_event: "Champions Tour 2025: Masters Bangkok",
          },
        ],
      },
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchUpcoming();

    expect(result).toBeNull();
    expect(latestTeams.team1).toBe("T1");
    expect(latestTeams.team2).toBe("Trace Esports");
  });

  it("should return a formatted message if teams have changed", async () => {
    latestTeams.team1 = "Team Liquid";
    latestTeams.team2 = "Sentinels";

    const mockData = {
      data: {
        status: 200,
        segments: [
          {
            team1: "T1",
            team2: "Trace Esports",
            match_series: "Swiss Stage: Round 2 (0-1)",
            match_event: "Champions Tour 2025: Masters Bangkok",
          },
        ],
      },
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchUpcoming();

    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${
      currentDate.getMonth() + 1
    }-${currentDate.getDate() + 1}`;

    expect(result).toBe(
      `[Valorant Esports Match: ${formattedDate}]\nTeam Liquid vs Sentinels has just started.\n\n(Swiss Stage: Round 2 (0-1))\n[Champions Tour 2025: Masters Bangkok]`
    );
    expect(latestTeams.team1).toBe("T1");
    expect(latestTeams.team2).toBe("Trace Esports");
  });

  it("should return null if teams have not changed", async () => {
    latestTeams.team1 = "T1";
    latestTeams.team2 = "Trace Esports";

    const mockData = {
      data: {
        status: 200,
        segments: [
          {
            team1: "T1",
            team2: "Trace Esports",
            match_series: "Swiss Stage: Round 2 (0-1)",
            match_event: "Champions Tour 2025: Masters Bangkok",
          },
        ],
      },
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchUpcoming();

    expect(result).toBeNull();
    expect(latestTeams.team1).toBe("T1");
    expect(latestTeams.team2).toBe("Trace Esports");
  });

  it("should return null and log a warning if no upcoming matches are found", async () => {
    const mockData = {
      data: {
        status: 200,
        segments: [],
      },
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const result = await fetchUpcoming();

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith("No upcoming matches found.");
    consoleSpy.mockRestore();
  });

  it("should return null and log a warning if invalid match data is received", async () => {
    const mockData = {
      data: {
        status: 200,
        segments: [
          {
            team1: null,
            team2: "Trace Esports",
            match_series: "Swiss Stage: Round 2 (0-1)",
            match_event: "Champions Tour 2025: Masters Bangkok",
          },
        ],
      },
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const result = await fetchUpcoming();

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith("Invalid match data received.");
    consoleSpy.mockRestore();
  });

  it("should return null and log an error if the API call fails", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: "Not Found",
    });

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const result = await fetchUpcoming();

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching matches:",
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });
});

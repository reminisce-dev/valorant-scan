import { fetchResults, latestTeams } from "../esports/results";

global.fetch = jest.fn();

describe("fetchResults", () => {
  beforeEach(() => {
    latestTeams.team1 = "TEAM_1";
    latestTeams.team2 = "TEAM_2";
    jest.clearAllMocks();
  });

  it("should return null and update latest teams if no previous teams are set", async () => {
    const mockData = {
      data: {
        status: 200,
        segments: [
          {
            team1: "T1",
            team2: "Trace Esports",
            score1: "2",
            score2: "0",
            round_info: "Swiss Stage-Round 2",
            tournament_name: "Champions Tour 2025: Masters Bangkok",
            match_page: "/449005/t1-vs-trace-esports",
          },
        ],
      },
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchResults();

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
            score1: "2",
            score2: "0",
            round_info: "Swiss Stage-Round 2",
            tournament_name: "Champions Tour 2025: Masters Bangkok",
            match_page: "/449005/t1-vs-trace-esports",
          },
        ],
      },
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const mockMatchPageResponse = "[T1: 2 - 0 Trace Esports]";
    global.getMatchPage = jest.fn().mockResolvedValue(mockMatchPageResponse);

    const result = await fetchResults();

    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${
      currentDate.getMonth() + 1
    }-${currentDate.getDate() + 1}`;

    expect(result).toBe(
      `[Valorant Esports Match: ${formattedDate}]\nT1 2-0 Trace Esports\n\n(Swiss Stage-Round 2)\n[Champions Tour 2025: Masters Bangkok]`
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
            score1: "2",
            score2: "0",
            round_info: "Swiss Stage-Round 2",
            tournament_name: "Champions Tour 2025: Masters Bangkok",
            match_page: "/449005/t1-vs-trace-esports",
          },
        ],
      },
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchResults();

    expect(result).toBeNull();
    expect(latestTeams.team1).toBe("T1");
    expect(latestTeams.team2).toBe("Trace Esports");
  });

  it("should return null and log a warning if no match data is found", async () => {
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

    const result = await fetchResults();

    expect(result).toBeNull();
  });

  it("should return null and log an error if the API call fails", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: "Not Found",
    });

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const result = await fetchResults();

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching matches:",
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });
});

interface MatchData {
  team1: string;
  team2: string;
  match_series: string;
  match_event: string;
  unix_timestamp: number;
}

const apiUrl = "https://vlrggapi.vercel.app/match?q=upcoming";
export let latestMatches: MatchData[] = [];

function getFormattedDate(): string {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export async function fetchUpcoming(): Promise<string | null> {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok)
      throw new Error(`Failed to fetch data: ${response.statusText}`);

    const jsonResponse = await response.json();
    if (!jsonResponse.data?.segments?.length) {
      console.warn("No upcoming matches found.");
      return null;
    }

    if (jsonResponse.data?.segments?.length) {
      jsonResponse.data.segments.sort((a: any, b: any) => {
        const aTime = new Date(a.unix_timestamp).getTime();
        const bTime = new Date(b.unix_timestamp).getTime();
        return aTime - bTime;
      });
    } else {
      console.warn("No upcoming matches found.");
      return null;
    }

    const allMatches: MatchData[] = jsonResponse.data.segments.map(
      (match: any) => ({
        team1: match.team1,
        team2: match.team2,
        match_series: match.match_series,
        match_event: match.match_event,
        unix_timestamp: match.unix_timestamp,
      })
    );

    allMatches.sort((a, b) => a.unix_timestamp - b.unix_timestamp);

    const earliestTime = allMatches[0].unix_timestamp;
    const upcomingMatches = allMatches.filter(
      (match) => match.unix_timestamp === earliestTime
    );

    const currentDate = getFormattedDate();
    const messages: string[] = [];

    const startedMatches = latestMatches.filter(
      (latestMatch) =>
        !upcomingMatches.some(
          (upcomingMatch) =>
            upcomingMatch.team1 === latestMatch.team1 &&
            upcomingMatch.team2 === latestMatch.team2
        )
    );

    if (startedMatches.length > 0) {
      for (const match of startedMatches) {
        messages.push(
          `[Valorant Esports Match: ${currentDate}]\n${match.team1} vs ${match.team2} has just started.\n\n(${match.match_series})\n[${match.match_event}]`
        );
      }
    }

    latestMatches = upcomingMatches;

    return messages.length ? messages.join("\n\n") : null;
  } catch (error) {
    console.error("Error fetching matches:", error);
    return null;
  }
}

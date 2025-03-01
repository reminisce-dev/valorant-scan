interface MatchData {
  team1: string;
  team2: string;
  match_series: string;
  match_event: string;
  unix_timestamp: number;
}

const apiUrl = "https://vlrggapi.vercel.app/match?q=upcoming";
export let latestMatches: MatchData[] = [];

/* Get date in YYYY-MM-DD format */
function getFormattedDate(): string {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

/* Fetch upcoming matches from apiUrl (vlrggapi.vercel.app) */
export async function fetchUpcoming(): Promise<string[] | null> {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok)
      throw new Error(`Failed to fetch data: ${response.statusText}`);

    const jsonResponse = await response.json();
    if (!jsonResponse.data?.segments?.length) {
      console.warn("No upcoming matches found.");
      return null;
    }

    /* Sort the jsonResponse in unix_timestamp order because 
    vlr dot gee gee groups tournaments and stuff.. */
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

    /* Throw the segments into allMatches */
    const allMatches: MatchData[] = jsonResponse.data.segments.map(
      (match: any) => ({
        team1: match.team1,
        team2: match.team2,
        match_series: match.match_series,
        match_event: match.match_event,
        unix_timestamp: match.unix_timestamp,
      })
    );

    const earliestTime = allMatches[0].unix_timestamp;

    /* compare all upcoming matches with the same time as the closest
    to starting to see if there are any that start at the same time */

    const upcomingMatches = allMatches.filter(
      (match) => match.unix_timestamp === earliestTime
    );

    const currentDate = getFormattedDate();

    /* compare teams in latestMatch to teams in upcomingMatch (data that was just fetched)
    and if there are any missing that means those teams' games have started and
    we can put those into startedMatches */
    const startedMatches = latestMatches.filter(
      (latestMatch) =>
        !upcomingMatches.some(
          (upcomingMatch) =>
            upcomingMatch.team1 === latestMatch.team1 &&
            upcomingMatch.team2 === latestMatch.team2
        )
    );

    const messages: string[] = [];

    if (startedMatches.length > 0) {
      for (const match of startedMatches) {
        if (match.team1 !== "TBD" && match.team2 !== "TBD") {
          messages.push(
            `[Valorant Esports Match: ${currentDate}]\n${match.team1} vs ${match.team2} has just started.\n\n(${match.match_series})\n[${match.match_event}]`
          );
        }
      }
    }

    latestMatches = upcomingMatches;

    return messages.length ? messages : null;
  } catch (error) {
    console.error("Error fetching matches:", error);
    return null;
  }
}

fetchUpcoming();

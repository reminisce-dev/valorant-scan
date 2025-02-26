import { load } from "cheerio";

const apiUrl = "https://vlrggapi.vercel.app/match?q=results";
export const latestTeams = {
  team1: "TEAM_1",
  team2: "TEAM_2",
};

// return date in YYYY-MM-DD format
function getFormattedDate(): string {
  const date = new Date();

  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

/* 
  scrape vlr dot gee gee using cheerio (shoutout for making it just a little bit easier)
  and grab all map data... also freaking vlr dot gee gee
  has so much white space so format it properly
*/
async function getMatchPage(matchPage: string): Promise<string> {
  try {
    const response = await fetch(matchPage);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const htmlContent = await response.text();
    const $ = load(htmlContent);
    let result = "";

    // i hate you vlr dot gee gee as well as api guy
    // grr why do you not provide this already!! (jokey joke)
    $(".vm-stats-game").each((i, mapElement) => {
      const mapSection = $(mapElement);
      let mapName = mapSection
        .find(".map div:first-child")
        .text()
        .trim()
        .split("\n")[0]
        .trim();
      const teams = mapSection
        .find(".team-name")
        .map((i, el) => $(el).text().trim())
        .get();
      const scores = mapSection
        .find(".score")
        .map((i, el) => $(el).text().trim())
        .get();

      if (scores.length === 2 && teams.length === 2) {
        const team1 = teams[0];
        const team2 = teams[1];
        const score1 = scores[0];
        const score2 = scores[1];

        if (result.length > 0) {
          result = result + "\n";
        }

        result =
          result + `[${mapName}: ${team1} ${score1} - ${score2} ${team2}]`;
        /*
        will return something like
        [Lotus: TBK Esports 15 - 13 MIBR Academy]
        [Haven: TBK Esports 14 - 12 MIBR Academy]
        */
      }
    });

    return result;
  } catch (error) {
    console.error(`Failed to process ${matchPage}:`, error);
    throw error;
  }
}

// fetch api and check for team name changes, meaning new results were added
// and then return those results formatted
export async function fetchResults(): Promise<string | null> {
  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`grr fail`);
    }

    const jsonResponse = await response.json();
    const data = jsonResponse.data.segments[0];

    if (data === undefined) {
      return null;
    }

    const {
      team1,
      team2,
      score1,
      score2,
      round_info: tournament,
      tournament_name: series,
      match_page,
    } = data;

    const currentDate = getFormattedDate();

    const matchPage = `https://vlr.gg${match_page}`;

    if (latestTeams.team1 === "TEAM_1") {
      latestTeams.team1 = team1;
      latestTeams.team2 = team2;
    }

    // comment out this part to test for latest result
    // if (latestTeams.team1 === team1) {
    //   return null;
    // }

    /* rewrote all of this just for maps xdd
    maybe ill add it to the return later but
    just wanted to see if i could do it
    REMOVE THESE COMMENTS IF YOU WANT MAPS
    (also make sure to add it to return statement) */

    // const mapResults = await getMatchPage(matchPage);

    latestTeams.team1 = team1;
    latestTeams.team2 = team2;

    let team1Won = score1 > score2;

    // can you tell i just learned about ternary operator
    return `[Valorant Esports Match: ${currentDate}]\n${
      team1Won ? team1 : team2
    } ${team1Won ? score1 : score2}-${team1Won ? score2 : score1} ${
      team1Won ? team2 : team1
    }\n\n(${tournament})\n[${series}]`;
  } catch (error) {
    console.error("Error fetching matches:", error);
    return null;
  }
}

import user from "../modal/user.js";
import { GraphQLError } from "graphql";
import { config } from "dotenv";
import game from "../modal/game.js";
import play from "../modal/play.js";
config();

function createPlayerStats(player) {
  return {
    _id: player._id,
    Player: player.fname + " " + player.lname,
    FG3: 0,
    FGA3: 0,
    FG2: 0,
    FGA2: 0,
    FT: 0,
    FTA: 0,
    PTS: 0,
    OFF: 0,
    DEF: 0,
    TOT: 0,
    PF: 0,
    TF: 0,
    A: 0,
    TO: 0,
    BLOCK: 0,
    STEAL: 0,
  };
}
export const playSchema = {
  typeDefs: [
    /* GraphQL */ `
      type Play {
        _id: String
        PlayerID: String
        Team: String
        PlayType: String
        Missed: Boolean
        Time: String
        GameID: String
      }
      type GamePlayerPlays {
        homeTeam: [PlayerPlays]
        awayTeam: [PlayerPlays]
      }
      type QuaterlyGamePlayerPlays {
        homeTeam: QuaterlyPlays
        awayTeam: QuaterlyPlays
      }
      type QuaterlyPlays {
        Quarter1: [PlayerPlays!]!
        Quarter2: [PlayerPlays!]!
        Quarter3: [PlayerPlays!]!
        Quarter4: [PlayerPlays!]!
      }
      type PlayerPlays {
        _id: String
        Player: String
        FG3: Int
        FGA3: Int
        FG2: Int
        FGA2: Int
        FT: Int
        FTA: Int
        PTS: Int
        OFF: Int
        DEF: Int
        TOT: Int
        PF: Int
        TF: Int
        A: Int
        TO: Int
        BLOCK: Int
        STEAL: Int
      }
      type GamePlays {
        homeTeam: [Int]!
        awayTeam: [Int]!
      }
      type ScoringGamePlay {
        homeTeam: [Play]
        awayTeam: [Play]
      }
      input CreateGameInput {
        homeTeam: String!
        awayTeam: String!
      }

      type Query {
        getGamePlay(gameID: String!): GamePlays
        getScoringGamePlay(gameID: String!): ScoringGamePlay
        getGamePlaysByPlayer(gameID: String!): GamePlayerPlays
        getQuarterlyGamePlaysByPlayer(gameID: String!): QuaterlyGamePlayerPlays
        getGamePlayerPlays: PlayerPlays
      }
      type Mutation {
        createPlay(
          PlayerID: String!
          TeamID: String!
          PlayType: String!
          Missed: Boolean!
          GameID: String!
          Quarter: Int!
        ): Play
      }
    `,
  ],
  resolvers: {
    Query: {
      getGamePlay: async (_, { gameID }, {}) => {
        try {
          const plays = await play.find({ Game: gameID, Missed: false });
          const thisGame = await game.find({ _id: gameID });

          // Initialize an object to store the scores for each team in each quarter
          const scores = {
            homeTeam: [0, 0, 0, 0],
            awayTeam: [0, 0, 0, 0],
          };

          // Loop through all the plays and calculate the scores
          plays.forEach((play) => {
            // Determine which team made the play

            const team =
              play.Team.toString() === thisGame[0].homeTeam.toString()
                ? "homeTeam"
                : "awayTeam";

            // Determine which quarter the play occurred in

            // Calculate the score for the play based on the PlayType
            let score;
            switch (play.PlayType) {
              case "3-Point":
                score = 3;
                break;
              case "2-Point":
                score = 2;
                break;
              case "Free Throw":
                score = 1;
                break;
              default:
                score = 0;
                break;
            }

            // Add the score to the appropriate team and quarter
            scores[team][play.Quarter - 1] += score;
          });

          // Return the final scores object

          return scores;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },

      getScoringGamePlay: async (_, { gameID }, {}) => {
        try {
          const plays = await play
            .find(
              {
                Game: gameID,
                Missed: false,
                PlayType: { $in: ["3-Point", "2-Point", "Free Throw"] },
              },
              {
                _id: 0,
                Missed: 0,
                GameID: 0,
              }
            )
            .populate("Player");
          const thisGame = await game.find({ _id: gameID });

          // Initialize an object to store the Plays for each team
          const Plays = {
            homeTeam: [],
            awayTeam: [],
          };

          // Loop through all the plays
          plays.forEach((play) => {
            // Determine which team made the play

            const team =
              play.Team.toString() === thisGame[0].homeTeam.toString()
                ? "homeTeam"
                : "awayTeam";
            play.PlayerID = play.Player.fname + " " + play.Player.lname;
            // Add the Play to the appropriate team
            Plays[team].push(play);
          });
          // Return the final scores object

          return Plays;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },

      getGamePlaysByPlayer: async (_, { gameID }, {}) => {
        try {
          const myGame = await game.findById(gameID).populate([
            { path: "awayTeam", populate: "Players" },
            { path: "homeTeam", populate: "Players" },
          ]);

          // Get all of the plays for the game.
          const plays = await play
            .find({ Game: myGame._id })
            .populate("Team Player");

          // Aggregate the plays by team and player.
          const teamStats = {
            homeTeam: [],
            awayTeam: [],
          };

          plays.forEach((play) => {
            const point = !play.Missed
              ? play.PlayType === "Free Throw"
                ? 1
                : play.PlayType === "3-Point"
                ? 3
                : play.PlayType === "2-Point"
                ? 2
                : 0
              : 0;
            const teamName =
              play.Team._id.toString() === myGame.homeTeam._id.toString()
                ? "homeTeam"
                : "awayTeam";

            const playerName = play.Player.fname + " " + play.Player.lname;

            // Check if the player already exists in the team stats.
            let existingPlayerStats = teamStats[teamName].find(
              (stats) => stats.Player === playerName
            );

            // If the player does not exist, create a new object for them.
            if (!existingPlayerStats) {
              teamStats[teamName].push({ ...createPlayerStats(play.Player) });
              existingPlayerStats = teamStats[teamName].find(
                (stats) => stats.Player === playerName
              );
            }

            // Update the player statistics for the current play.
            existingPlayerStats.FG3 +=
              play.PlayType === "3-Point" && !play.Missed ? 1 : 0;
            existingPlayerStats.FGA3 += play.PlayType === "3-Point" ? 1 : 0;
            existingPlayerStats.FG2 +=
              play.PlayType === "2-Point" && !play.Missed ? 1 : 0;
            existingPlayerStats.FGA2 += play.PlayType === "2-Point" ? 1 : 0;
            existingPlayerStats.FT +=
              play.PlayType === "Free Throw" && !play.Missed ? 1 : 0;
            existingPlayerStats.FTA += play.PlayType === "Free Throw" ? 1 : 0;
            existingPlayerStats.PTS += point;
            existingPlayerStats.OFF += play.PlayType === "OFF" ? 1 : 0;
            existingPlayerStats.DEF += play.PlayType === "DEF" ? 1 : 0;
            existingPlayerStats.TOT += play.PlayType === "TOT" ? 1 : 0;
            existingPlayerStats.PF += play.PlayType === "F" ? 1 : 0;
            existingPlayerStats.TF += play.PlayType === "TF" ? 1 : 0;
            existingPlayerStats.A += play.PlayType === "A" ? 1 : 0;
            existingPlayerStats.TO += play.PlayType === "TO" ? 1 : 0;
            existingPlayerStats.BLOCK += play.PlayType === "BLOCK" ? 1 : 0;
            existingPlayerStats.STEAL += play.PlayType === "STEAL" ? 1 : 0;
          });
          myGame.homeTeam.Players.map((Player) => {
            if (
              !teamStats.homeTeam.some(
                (stats) => stats._id.toString() === Player._id.toString()
              )
            ) {
              teamStats.homeTeam.push({ ...createPlayerStats(Player) });
            }
          });
          myGame?.awayTeam?.Players.map((Player) => {
            if (
              !teamStats.awayTeam.some(
                (stats) => stats._id.toString() === Player._id.toString()
              )
            ) {
              teamStats.awayTeam.push({ ...createPlayerStats(Player) });
            }
          });
          return teamStats;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
      getGamePlayerPlays: async (_, {}, { userID }) => {
        try {
          // Get all of the plays for the game.
          const plays = await play.find({ Player: userID });

          // Aggregate the plays by team and player.
          let existingPlayerStats = {
            FG3: 0,
            FGA3: 0,
            FG2: 0,
            FGA2: 0,
            FT: 0,
            FTA: 0,
            PTS: 0,
            OFF: 0,
            DEF: 0,
            TOT: 0,
            PF: 0,
            A: 0,
            TO: 0,
            BLOCK: 0,
            STEAL: 0,
          };
          plays.forEach((play) => {
            const point = !play.Missed
              ? play.PlayType === "Free Throw"
                ? 1
                : play.PlayType === "3-Point"
                ? 3
                : play.PlayType === "2-Point"
                ? 2
                : 0
              : 0;
            console.log(play);
            // Check if the player already exists in the team stats.

            // If the player does not exist, create a new object for them.

            // Update the player statistics for the current play.
            existingPlayerStats.FG3 +=
              play.PlayType === "3-Point" && !play.Missed ? 1 : 0;
            existingPlayerStats.FGA3 += play.PlayType === "3-Point" ? 1 : 0;
            existingPlayerStats.FG2 +=
              play.PlayType === "2-Point" && !play.Missed ? 1 : 0;
            existingPlayerStats.FGA2 += play.PlayType === "2-Point" ? 1 : 0;
            existingPlayerStats.FT +=
              play.PlayType === "Free Throw" && !play.Missed ? 1 : 0;
            existingPlayerStats.FTA += play.PlayType === "Free Throw" ? 1 : 0;
            existingPlayerStats.PTS += point;
            existingPlayerStats.OFF += play.PlayType === "OFF" ? 1 : 0;
            existingPlayerStats.DEF += play.PlayType === "DEF" ? 1 : 0;
            existingPlayerStats.TOT += play.PlayType === "TOT" ? 1 : 0;
            existingPlayerStats.PF += ["F", "TF"].includes(play.PlayType)
              ? 1
              : 0;
            existingPlayerStats.A += play.PlayType === "A" ? 1 : 0;
            existingPlayerStats.TO += play.PlayType === "TO" ? 1 : 0;
            existingPlayerStats.BLOCK += play.PlayType === "BLOCK" ? 1 : 0;
            existingPlayerStats.STEAL += play.PlayType === "STEAL" ? 1 : 0;
          });

          return existingPlayerStats;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
      getQuarterlyGamePlaysByPlayer: async (_, { gameID }, {}) => {
        try {
          let isDone = false;
          const myGame = await game.findById(gameID).populate([
            { path: "awayTeam", populate: "Players" },
            { path: "homeTeam", populate: "Players" },
          ]);

          // Get all of the plays for the game.
          const plays = await play
            .find({ Game: myGame._id })
            .populate("Team Player");

          // Aggregate the plays by team and player.
          const teamStats = {
            homeTeam: {
              Quarter1: [],
              Quarter2: [],
              Quarter3: [],
              Quarter4: [],
            },
            awayTeam: {
              Quarter1: [],
              Quarter2: [],
              Quarter3: [],
              Quarter4: [],
            },
          };

          plays.forEach((play, index) => {
            let point = 0;
            switch (play.PlayType) {
              case "Free Throw":
                point = play.Missed ? 0 : 1;
                break;
              case "3-Point":
                point = play.Missed ? 0 : 3;
                break;
              case "2-Point":
                point = play.Missed ? 0 : 2;
                break;
              default:
                point = 0;
                break;
            }
            const teamName =
              play.Team._id.toString() === myGame.homeTeam._id.toString()
                ? "homeTeam"
                : "awayTeam";

            const playerName = play.Player.fname + " " + play.Player.lname;

            // Check if the player already exists in the team stats.
            let existingPlayerStats = teamStats[teamName][
              "Quarter" + play.Quarter
            ].find((stats) => stats.Player === playerName);

            // If the player does not exist, create a new object for them.
            if (!existingPlayerStats) {
              teamStats[teamName]["Quarter" + play.Quarter].push({
                ...createPlayerStats(play.Player),
              });
              existingPlayerStats = teamStats[teamName][
                "Quarter" + play.Quarter
              ].find((stats) => stats.Player === playerName);
            }

            // Update the player statistics for the current play.
            existingPlayerStats.FG3 +=
              play.PlayType === "3-Point" && !play.Missed ? 1 : 0;
            existingPlayerStats.FGA3 += play.PlayType === "3-Point" ? 1 : 0;
            existingPlayerStats.FG2 +=
              play.PlayType === "2-Point" && !play.Missed ? 1 : 0;
            existingPlayerStats.FGA2 += play.PlayType === "2-Point" ? 1 : 0;
            existingPlayerStats.FT +=
              play.PlayType === "Free Throw" && !play.Missed ? 1 : 0;
            existingPlayerStats.FTA += play.PlayType === "Free Throw" ? 1 : 0;
            existingPlayerStats.PTS += point;
            existingPlayerStats.OFF += play.PlayType === "OFF" ? 1 : 0;
            existingPlayerStats.DEF += play.PlayType === "DEF" ? 1 : 0;
            existingPlayerStats.TOT += play.PlayType === "TOT" ? 1 : 0;
            existingPlayerStats.PF += play.PlayType === "F" ? 1 : 0;
            existingPlayerStats.A += play.PlayType === "A" ? 1 : 0;
            existingPlayerStats.TO += play.PlayType === "TO" ? 1 : 0;
            existingPlayerStats.BLOCK += play.PlayType === "BLOCK" ? 1 : 0;
            existingPlayerStats.STEAL += play.PlayType === "STEAL" ? 1 : 0;
          });

          for (let i = 0; i < 4; i++) {
            myGame.homeTeam.Players.map((Player) => {
              if (
                !teamStats.homeTeam["Quarter" + (i + 1)].some(
                  (stats) => stats._id.toString() === Player._id.toString()
                )
              ) {
                teamStats.homeTeam["Quarter" + (i + 1)].push({
                  ...createPlayerStats(Player),
                });
              }
            });
            myGame?.awayTeam?.Players.map((Player) => {
              if (
                !teamStats.awayTeam["Quarter" + (i + 1)].some(
                  (stats) => stats._id.toString() === Player._id.toString()
                )
              ) {
                teamStats.awayTeam["Quarter" + (i + 1)].push({
                  ...createPlayerStats(Player),
                });
              }
            });
          }

          return {
            homeTeam: {
              Quarter1: [...teamStats.homeTeam.Quarter1],
              Quarter2: [...teamStats.homeTeam.Quarter2],
              Quarter3: [...teamStats.homeTeam.Quarter3],
              Quarter4: [...teamStats.homeTeam.Quarter4],
            },
            awayTeam: {
              Quarter1: teamStats.awayTeam.Quarter1,
              Quarter2: teamStats.awayTeam.Quarter2,
              Quarter3: teamStats.awayTeam.Quarter3,
              Quarter4: teamStats.awayTeam.Quarter4,
            },
          };
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
    },
    Mutation: {
      createPlay: async (
        _,
        { PlayerID, TeamID, PlayType, Missed, GameID, Quarter },
        { liveQueryStore }
      ) => {
        try {
          const newPlay = new play({
            Player: PlayerID,
            PlayType: PlayType,
            Team: TeamID,
            Missed: Missed,
            Game: GameID,
            Quarter: Quarter,
            Time: new Date(),
          });
          newPlay.save();
          liveQueryStore.invalidate([
            "Query.getGamePlaysByPlayer",
            "Query.getQuarterlyGamePlaysByPlayer",
            "Query.getGamePlay",
            "Query.getScoringGamePlay",
          ]);
          return newPlay;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
    },
  },
};

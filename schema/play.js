import user from "../modal/user.js";
import { GraphQLError } from "graphql";
import { config } from "dotenv";
import game from "../modal/game.js";
import play from "../modal/play.js";
config();
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
      type PlayerPlays {
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
        getGames: [Game]
        getGamePlay(gameID: String!): GamePlays
        getScoringGamePlay(gameID: String!): ScoringGamePlay
        getGamePlaysByPlayer(gameID: String!): GamePlayerPlays
      }
      type Mutation {
        createPlay(
          PlayerID: String!
          TeamID: String!
          PlayType: String!
          Missed: Boolean!
          GameID: String!
        ): Play
      }
    `,
  ],
  resolvers: {
    Query: {
      getGames: async (_, {}, { userID }) => {
        try {
          const myGames = await game
            .find({ coach: userID })
            .populate("homeTeam")
            .populate("awayTeam");
          return myGames;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
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
            const quarter = Math.floor(
              (play.Time - thisGame[0].startTime) / (1000 * 60 * 12)
            );

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
            scores[team][quarter] += score;
          });

          // Return the final scores object
          console.log(scores);
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
          // console.log(Plays);
          return Plays;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
      getGamePlaysByPlayer: async (_, { gameID }, {}) => {
        try {
          let Game = await game
            .findById({ _id: gameID })
            .populate("homeTeam awayTeam");

          // find all plays for this game and populate the team and player fields
          let Plays = await play
            .find({ Game: Game._id })
            .populate("Team Player");

          // create an object to hold the player statistics for each team
          const teamStats = {
            homeTeam: [],
            awayTeam: [],
          };

          // aggregate the plays by team and player
          Plays.forEach((play) => {
            const teamName =
              play.Team.toString() === Game.homeTeam.toString()
                ? "homeTeam"
                : "awayTeam";
            const playerName = play.Player.fname + " " + play.Player.lname;

            const existingPlayerStats = teamStats[teamName].find(
              (stats) => stats.Player === playerName
            );
            let point = !play.Missed
              ? play.PlayType === "Free Throw"
                ? 1
                : play.PlayType === "3-Point"
                ? 3
                : play.PlayType === "2-Point"
                ? 2
                : 0
              : 0;
            console.log(point, play);
            if (existingPlayerStats) {
              // add to existing player stats
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
              existingPlayerStats.PF += play.PlayType === ("F" || "TF") ? 1 : 0;
              existingPlayerStats.A += play.PlayType === "A" ? 1 : 0;
              existingPlayerStats.TO += play.PlayType === "TO" ? 1 : 0;
              existingPlayerStats.BLOCK += play.PlayType === "BLOCK" ? 1 : 0;
              existingPlayerStats.STEAL += play.PlayType === "STEAL" ? 1 : 0;
            } else {
              // create new player stats
              teamStats[teamName].push({
                Player: playerName,
                FG3: play.PlayType === "3-Point" && !play.Missed ? 1 : 0,
                FGA3: play.PlayType === "3-Point" ? 1 : 0,
                FG2: play.PlayType === "2-Point" && !play.Missed ? 1 : 0,
                FGA2: play.PlayType === "2-Point" ? 1 : 0,
                FT: play.PlayType === "Free Throw" && !play.Missed ? 1 : 0,
                FTA: play.PlayType === "Free Throw" ? 1 : 0,
                PTS: point,
                OFF: play.PlayType === "OFF" ? 1 : 0,
                DEF: play.PlayType === "DEF" ? 1 : 0,
                TOT: play.PlayType === "TOT" ? 1 : 0,
                PF: play.PlayType === ("F" || "TF") ? 1 : 0,
                A: play.PlayType === "A" ? 1 : 0,
                TO: play.PlayType === "TO" ? 1 : 0,
                BLOCK: play.PlayType === "BLOCK" ? 1 : 0,
                STEAL: play.PlayType === "STEAL" ? 1 : 0,
              });
            }
          });

          // print out the team stats
          console.log(teamStats);
          return teamStats;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
    },
    Mutation: {
      createPlay: async (
        _,
        { PlayerID, TeamID, PlayType, Missed, GameID },
        {}
      ) => {
        try {
          const newPlay = new play({
            Player: PlayerID,
            PlayType: PlayType,
            Team: TeamID,
            Missed: Missed,
            Game: GameID,
            Time: new Date(),
          });
          newPlay.save();

          return newPlay;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
    },
  },
};

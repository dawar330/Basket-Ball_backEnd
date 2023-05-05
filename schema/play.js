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
        _id: String!
        PlayerID: String!
        Team: String!
        PlayType: String!
        Missed: Boolean!
        Time: String!
        GameID: String!
      }
      type PlayTypes {
        ThreePoint: Int
        TwoPoint: Int
        BLOCK: Int
        FreeThrow: Int
        TF: Int
        DEF: Int
        OFF: Int
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

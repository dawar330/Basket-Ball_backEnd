import user from "../modal/user.js";
import { GraphQLError } from "graphql";
import { config } from "dotenv";
import game from "../modal/game.js";
import TimeOuts from "../modal/TimeOuts.js";
import Possessions from "../modal/Possessions.js";
config();
export const TimeOutSchema = {
  typeDefs: [
    /* GraphQL */ `
      type TimeOut {
        _id: String
        Team: String
        Secs: String
        Quarter: Int
        Time: String
        GameID: String
      }
      type Possession {
        _id: String
        Team: String

        Quarter: Int
        Time: String
        GameID: String
      }
      type GameTimeOuts {
        homeTeam: [TimeOut]
        awayTeam: [TimeOut]
      }
      type GamePossession {
        homeTeam: [Possession]
        awayTeam: [Possession]
      }
      type Query {
        getGameTimeOuts(gameID: String!): GameTimeOuts
        getGamePossession(gameID: String!): GamePossession
      }
      type Mutation {
        createTimeOuts(
          TeamID: String!
          Secs: String!
          GameID: String!
          Quarter: Int!
        ): TimeOut
        createPossession(
          TeamID: String!
          Time: String!
          GameID: String!
          Quarter: Int!
        ): Possession
      }
    `,
  ],
  resolvers: {
    Query: {
      getGameTimeOuts: async (_, { gameID }, {}) => {
        try {
          const timeouts = await TimeOuts.find(
            {
              Game: gameID,
            },
            {
              _id: 0,
              GameID: 0,
            }
          );

          const thisGame = await game.find({ _id: gameID });

          // Initialize an object to store the Plays for each team
          const T_Outs = {
            homeTeam: [],
            awayTeam: [],
          };

          // Loop through all the plays
          timeouts.forEach((Timeout) => {
            // Determine which team made the play

            const team =
              Timeout.Team.toString() === thisGame[0].homeTeam.toString()
                ? "homeTeam"
                : "awayTeam";
            // Add the Play to the appropriate team
            T_Outs[team].push(Timeout);
          });
          // Return the final scores object

          return T_Outs;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
      getGamePossession: async (_, { gameID }, {}) => {
        try {
          const PossessionSS = await Possessions.find(
            {
              Game: gameID,
            },
            {
              _id: 0,
              GameID: 0,
            }
          );

          const thisGame = await game.find({ _id: gameID });

          // Initialize an object to store the Plays for each team
          const Posses = {
            homeTeam: [],
            awayTeam: [],
          };

          // Loop through all the plays
          PossessionSS.forEach((Possession) => {
            // Determine which team made the play

            const team =
              Possession.Team.toString() === thisGame[0].homeTeam.toString()
                ? "homeTeam"
                : "awayTeam";
            // Add the Play to the appropriate team
            Posses[team].push(Possession);
          });
          // Return the final scores object

          return Posses;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
    },
    Mutation: {
      createTimeOuts: async (
        _,
        { TeamID, Secs, GameID, Quarter },
        { liveQueryStore }
      ) => {
        try {
          const newTimeOut = new TimeOuts({
            Secs: Secs,
            Team: TeamID,
            Game: GameID,
            Quarter: Quarter,
            Time: new Date(),
          });
          newTimeOut.save();
          //  liveQueryStore.invalidate([
          //    "Query.getGamePlaysByPlayer",
          //    "Query.getQuarterlyGamePlaysByPlayer",
          //    "Query.getGamePlay",
          //    "Query.getScoringGamePlay",
          //    ,
          //  ]);
          return newTimeOut;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
      createPossession: async (
        _,
        { TeamID, Time, GameID, Quarter },
        { liveQueryStore }
      ) => {
        try {
          const newPossession = new Possessions({
            Team: TeamID,
            Game: GameID,
            Quarter: Quarter,
            Time: Time,
          });
          newPossession.save();
          //  liveQueryStore.invalidate([
          //    "Query.getGamePlaysByPlayer",
          //    "Query.getQuarterlyGamePlaysByPlayer",
          //    "Query.getGamePlay",
          //    "Query.getScoringGamePlay",
          //    ,
          //  ]);
          return newPossession;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
    },
  },
};

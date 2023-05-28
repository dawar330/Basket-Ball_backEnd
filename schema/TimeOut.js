import user from "../modal/user.js";
import { GraphQLError } from "graphql";
import { config } from "dotenv";
import game from "../modal/game.js";
import TimeOuts from "../modal/TimeOuts.js";
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
      type GameTimeOuts {
        homeTeam: [TimeOut]
        awayTeam: [TimeOut]
      }
      type Query {
        getGameTimeOuts(gameID: String!): GameTimeOuts
      }
      type Mutation {
        createTimeOuts(
          TeamID: String!
          Secs: String!
          GameID: String!
          Quarter: Int!
        ): TimeOut
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
          // console.log(Plays);
          console.log(T_Outs);
          return T_Outs;
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
    },
  },
};

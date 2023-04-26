import user from "../modal/user.js";
import { GraphQLError } from "graphql";
import { config } from "dotenv";
import game from "../modal/game.js";
config();
export const gameSchema = {
  typeDefs: [
    /* GraphQL */ `
      type Game {
        _id: String!
        homeTeam: String!
        awayTeam: String!
        coach: String!
      }
      input CreateGameInput {
        homeTeam: String!
        awayTeam: String!
      }

      type Query {
        getGames: [Game]
        getGame(gameID: String!): Game
      }
      type Mutation {
        createGame(CreateGameInput: CreateGameInput!): Game
      }
    `,
  ],
  resolvers: {
    Query: {
      getGames: async (_, {}, { userID }) => {
        try {
          const myGames = await game.find({ coach: userID });
          return myGames;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
      getGame: async (_, { gameID }, {}) => {
        try {
          const myGame = await game.findOne({ _id: gameID });
          return myGame;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
    },
    Mutation: {
      createGame: async (_, { CreateGameInput }, { userID }) => {
        try {
          const myGame = new game({
            homeTeam: CreateGameInput.homeTeam,
            awayTeam: CreateGameInput.awayTeam,
            coach: userID,
          });
          myGame.save();

          return myGame;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
    },
  },
};

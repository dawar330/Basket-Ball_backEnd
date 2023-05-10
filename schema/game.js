import user from "../modal/user.js";
import { GraphQLError } from "graphql";
import { config } from "dotenv";
import game from "../modal/game.js";
config();
export const gameSchema = {
  typeDefs: [
    /* GraphQL */ `
      type Team {
        _id: String!
        teamName: String!
        teamCity: String!
        Image: String!
        Coach: String!
        Players: [String]!
      }
      type Game {
        _id: String!
        homeTeam: Team
        awayTeam: Team
        coach: String
        startTime: String
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
        StartGame(gameID: String!): Game
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
      getGame: async (_, { gameID }, {}) => {
        try {
          const myGame = await game
            .findOne({ _id: gameID })
            .populate("homeTeam")
            .populate("awayTeam");
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
            startTime: null,
          });
          myGame.save();

          return myGame;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
      StartGame: async (_, { gameID }, {}) => {
        try {
          const myGame = await game.findByIdAndUpdate(
            { _id: gameID },
            { startTime: new Date() }
          );

          return myGame;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
    },
  },
};

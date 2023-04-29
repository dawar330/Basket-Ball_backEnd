import { GraphQLError } from "graphql";
import { config } from "dotenv";
import comments from "../modal/comments.js";
config();
export const commentSchema = {
  typeDefs: [
    /* GraphQL */ `
      type Comment {
        _id: String!
        userID: String!
        gameID: String!
        comment: String!
        time: String!
      }

      type Query {
        getComments(gameID: String!): [Comment]
      }
      type Mutation {
        createComment(comment: String!, gameID: String!): Comment
      }
    `,
  ],
  resolvers: {
    Query: {
      getComments: async (_, { gameID }, {}) => {
        try {
          const gameComments = await comments
            .find({ gameID: gameID })
            .sort({ time: -1 });

          return gameComments;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
    },
    Mutation: {
      createComment: async (_, { comment, gameID }, { userID }) => {
        try {
          const gameComment = new comments({
            comment: comment,
            gameID: gameID,
            userID: userID,
            time: new Date(),
          });
          gameComment.save();

          return gameComment;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
    },
  },
};

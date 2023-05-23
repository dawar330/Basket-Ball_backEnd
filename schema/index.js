import { createSchema } from "graphql-yoga";
import { astFromDirective } from "@graphql-tools/utils";
import { GraphQLLiveDirective } from "@envelop/live-query";
import { userSchema } from "./user.js";
import { gameSchema } from "./game.js";
import { commentSchema } from "./comment.js";
import { teamSchema } from "./team.js";
import { playSchema } from "./play.js";
import { TimeOutSchema } from "./TimeOut.js";
export const schema = createSchema({
  typeDefs: [
    /* GraphQL */ `
      ${userSchema.typeDefs +
      gameSchema.typeDefs +
      commentSchema.typeDefs +
      teamSchema.typeDefs +
      playSchema.typeDefs +
      TimeOutSchema.typeDefs}
    `,
    astFromDirective(GraphQLLiveDirective),
  ],
  resolvers: {
    Query: {
      ...userSchema.resolvers.Query,
      ...gameSchema.resolvers.Query,
      ...commentSchema.resolvers.Query,
      ...teamSchema.resolvers.Query,
      ...playSchema.resolvers.Query,
      ...TimeOutSchema.resolvers.Query,
    },
    Mutation: {
      ...userSchema.resolvers.Mutation,
      ...gameSchema.resolvers.Mutation,
      ...commentSchema.resolvers.Mutation,
      ...teamSchema.resolvers.Mutation,
      ...playSchema.resolvers.Mutation,
      ...TimeOutSchema.resolvers.Mutation,
    },
  },
});

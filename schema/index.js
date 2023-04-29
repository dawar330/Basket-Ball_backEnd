import { createSchema } from "graphql-yoga";
import { astFromDirective } from "@graphql-tools/utils";
import { GraphQLLiveDirective } from "@envelop/live-query";
import { userSchema } from "./user.js";
import { gameSchema } from "./game.js";
import { commentSchema } from "./comment.js";
import { teamSchema } from "./team.js";
export const schema = createSchema({
  typeDefs: [
    /* GraphQL */ `
      ${userSchema.typeDefs +
      gameSchema.typeDefs +
      commentSchema.typeDefs +
      teamSchema.typeDefs}
    `,
    astFromDirective(GraphQLLiveDirective),
  ],
  resolvers: {
    Query: {
      ...userSchema.resolvers.Query,
      ...gameSchema.resolvers.Query,
      ...commentSchema.resolvers.Query,
      ...teamSchema.resolvers.Query,
    },
    Mutation: {
      ...userSchema.resolvers.Mutation,
      ...gameSchema.resolvers.Mutation,
      ...commentSchema.resolvers.Mutation,
      ...teamSchema.resolvers.Mutation,
    },
  },
});

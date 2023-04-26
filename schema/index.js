import { createSchema } from "graphql-yoga";
import { astFromDirective } from "@graphql-tools/utils";
import { GraphQLLiveDirective } from "@envelop/live-query";
import { userSchema } from "./user.js";
import { gameSchema } from "./game.js";
export const schema = createSchema({
  typeDefs: [
    /* GraphQL */ `
      ${userSchema.typeDefs + gameSchema.typeDefs}
    `,
    astFromDirective(GraphQLLiveDirective),
  ],
  resolvers: {
    Query: {
      ...userSchema.resolvers.Query,
      ...gameSchema.resolvers.Query,
    },
    Mutation: {
      ...userSchema.resolvers.Mutation,
      ...gameSchema.resolvers.Mutation,
    },
  },
});

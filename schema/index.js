import { createSchema } from "graphql-yoga";
import { astFromDirective } from "@graphql-tools/utils";
import { GraphQLLiveDirective } from "@envelop/live-query";
import { userSchema } from "./user.js";
export const schema = createSchema({
  typeDefs: [
    /* GraphQL */ `
      ${userSchema.typeDefs}
    `,
    astFromDirective(GraphQLLiveDirective),
  ],
  resolvers: {
    Query: userSchema.resolvers.Query,
    Mutation: userSchema.resolvers.Mutation,
  },
});

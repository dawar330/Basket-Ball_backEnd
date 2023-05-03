import user from "../modal/user.js";
import { GraphQLError } from "graphql";
import { config } from "dotenv";
import pkg from "jsonwebtoken";
import { getJwt, getUserByToken } from "./jwt.js";
const Jwt = pkg;
config();
export const userSchema = {
  typeDefs: [
    /* GraphQL */ `
      type User {
        fname: String!
        lname: String!
        email: String!
        password: String!
      }
      type UserDetail {
        _id: String!
        fname: String!
        lname: String!
      }
      input UserInput {
        id: String!
        fname: String!
        lname: String!
        email: String!
        password: String!
      }
      input registerUserInput {
        firstname: String!
        lastname: String!
        email: String!
        password: String!
      }
      input loginInput {
        email: String!
        password: String!
      }
      type auth {
        api_token: String!
        email: String!
        first_name: String!
        last_name: String!
      }

      type Query {
        getUser(id: String!): UserDetail
        getUserByToken(token: String!): User
      }
      type Mutation {
        updateUser(UserInput: UserInput!): User
        register(registerUserInput: registerUserInput!): auth
        login(loginInput: loginInput!): auth
      }
    `,
  ],
  resolvers: {
    Query: {
      getUserByToken: async (_, { token }) => {
        try {
          const myUser = await getUserByToken(token);
          return myUser;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
      getUser: async (_, { id }) => {
        try {
          const myUser = await user.findOne(
            { _id: id },
            { _id: 1, fname: 1, lname: 1 }
          );
          return myUser;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
    },
    Mutation: {
      login: async (_, { loginInput }) => {
        try {
          const User = await user.findOne({
            email: loginInput.email,
            password: loginInput.password,
          });
          var accessToken = getJwt(User.email, "couch");

          return {
            api_token: accessToken,
            email: User.email,
            first_name: User.fname,
            last_name: User.lname,
          };
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
      register: async (_, { registerUserInput }) => {
        try {
          const newUser = new user({
            fname: registerUserInput.firstname,
            lname: registerUserInput.lastname,
            email: registerUserInput.email,
            password: registerUserInput.password,
          });
          newUser.save();
          var accessToken = getJwt(registerUserInput.email, "couch");

          return {
            api_token: accessToken,
            email: registerUserInput.email,
            first_name: registerUserInput.firstname,
            last_name: registerUserInput.lastname,
          };
        } catch (error) {
          throw new GraphQLError(error);
        }
      },

      updateUser: async (_, { UserInput }) => {
        try {
          const myUser = await user.findByIdAndUpdate(
            { _id: UserInput.id },
            {
              ...UserInput,
            },
            {
              new: true,
            }
          );
          return myUser;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
    },
  },
};

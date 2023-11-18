import user from "../modal/user.js";
import { GraphQLError } from "graphql";
import { config } from "dotenv";
import pkg from "jsonwebtoken";
import { getJwt, getUserByToken } from "./jwt.js";
import team from "../modal/team.js";
const Jwt = pkg;
config();
export const userSchema = {
  typeDefs: [
    /* GraphQL */ `
      type User {
        avatar: String!
        PlayingLevel: String
        Height: Int!
        Weight: Int!
        WingSpan: Int!
        Vertical: Int!
        CGPA: Float!
        AAU: Boolean!
        AAUTeamName: String!
        AAUAgeLevel: String!
        AAUState: String!
        fname: String!
        lname: String!
        email: String!
        AvailableGames: Int!
      }
      type UserDetail {
        _id: String
        email: String
        fname: String!
        lname: String!
        avatar: String!
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
        Role: String!
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
        Role: String!
      }

      type Query {
        getUser(id: String!): UserDetail
        getPlayers: [UserDetail]
        getUserByToken(token: String!): User
      }
      type Mutation {
        updateUser(UserInput: UserInput!): User
        register(registerUserInput: registerUserInput!): auth
        registerNewPlayer(
          avatar: String!
          Team: String!
          PlayerName: String!
          PlayingLevel: String!
          Height: Int!
          Weight: Int!
          WingSpan: Int!
          Vertical: Int!
          CGPA: Int!
          AAU: Boolean!
          AAUTeamName: String
          AAUAgeLevel: String
          AAUState: String
        ): Boolean
        login(loginInput: loginInput!): auth
        updateUserInfo(
          lname: String
          fname: String
          avatar: String
          PlayingLevel: String!
          Height: Int!
          Weight: Int!
          WingSpan: Int!
          Vertical: Int!
          CGPA: Float!
        ): User
        updateUserAAUInfo(
          AAU: Boolean!
          AAUTeamName: String
          AAUAgeLevel: String
          AAUState: String
        ): User
        UpdateEmail(email: String, PassWord: String): Boolean
        UpdatePass(newPass: String, PassWord: String): Boolean
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
            { _id: 1, fname: 1, lname: 1, avatar: 1 }
          );
          return myUser;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
      getPlayers: async (_, { }) => {
        try {
          const playersNotInTeams = await user.aggregate([
            // Match users with the role "Player"
            {
              $match: {
                role: "Player",
              },
            },
            // Lookup teams to get an array of all player ObjectIds from those teams
            {
              $lookup: {
                from: "teams",
                localField: "_id",
                foreignField: "Players",
                as: "teamsWithPlayer",
              },
            },
            // Filter out users who have no matching teams (teamsWithPlayer array is empty)
            {
              $match: {
                teamsWithPlayer: { $size: 0 },
              },
            },
            // Optionally, you can project the fields you want to include in the result
            // {
            //   $project: {
            //     fname: 1,
            //     lname: 1,
            //     email: 1,
            //     role: 1,
            //   },
            // },
          ]);
          console.log(playersNotInTeams, "asdas");
          return playersNotInTeams;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
    },
    Mutation: {
      login: async (_, { loginInput }) => {
        try {
          console.log(loginInput);
          const User = await user.findOne({
            email: loginInput.email,
            password: loginInput.password,
          });
          console.log(User);
          var accessToken = getJwt(User.email, User.role);

          return {
            api_token: accessToken,
            email: User.email,
            first_name: User.fname,
            last_name: User.lname,
            Role: User.role,
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
            role: registerUserInput.Role,
          });
          newUser.save();
          var accessToken = getJwt(
            registerUserInput.email,
            registerUserInput.Role
          );

          return {
            api_token: accessToken,
            email: registerUserInput.email,
            first_name: registerUserInput.firstname,
            last_name: registerUserInput.lastname,
            Role: registerUserInput.Role,
          };
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
      registerNewPlayer: async (
        _,
        {
          avatar,
          Team,
          PlayerName,
          PlayingLevel,
          Height,
          Weight,
          WingSpan,
          Vertical,
          CGPA,
          AAU,
          AAUTeamName,
          AAUAgeLevel,
          AAUState,
        },
        { liveQueryStore }
      ) => {
        try {
          const newUser = new user({
            fname: PlayerName,
            lname: "",
            email: "",
            password: "",
            avatar,
            PlayingLevel,
            Height,
            Weight,
            WingSpan,
            Vertical,
            CGPA,
            AAU,
            AAUTeamName,
            AAUAgeLevel,
            AAUState,
          });
          newUser.save();
          const newTeamMember = await team.findByIdAndUpdate(
            { _id: Team },
            {
              $push: {
                Players: newUser._id,
              },
            }
          );
          liveQueryStore.invalidate(["Query.getTeam"]);

          return true;
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
      updateUserInfo: async (
        _,
        {
          lname,
          fname,
          avatar,
          PlayingLevel,
          Height,
          Weight,
          WingSpan,
          Vertical,
          CGPA,
        },
        { userID }
      ) => {
        try {
          const myUser = await user.findByIdAndUpdate(
            { _id: userID },
            {
              fname: fname,
              lname: lname,
              avatar: avatar,
              PlayingLevel: PlayingLevel,
              Height: Height,
              Weight: Weight,
              WingSpan: WingSpan,
              Vertical: Vertical,
              CGPA: CGPA,
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
      updateUserAAUInfo: async (
        _,
        { AAU, AAUTeamName, AAUAgeLevel, AAUState },
        { userID }
      ) => {
        try {
          const myUser = await user.findByIdAndUpdate(
            { _id: userID },
            {
              AAU: AAU,
              AAUTeamName: AAUTeamName ? AAUTeamName : "",
              AAUAgeLevel: AAUAgeLevel ? AAUAgeLevel : "",
              AAUState: AAUState ? AAUState : "",
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

      UpdateEmail: async (_, { email, PassWord }, { userID }) => {
        try {
          const users = await user.findById({ _id: userID });

          if (users.password === PassWord) {
            const myUser = await user.findByIdAndUpdate(
              { _id: userID },
              { email: email },
              {
                new: true,
              }
            );

            return true;
          } else {
            return false;
          }
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
      UpdatePass: async (_, { newPass, PassWord }, { userID }) => {
        try {
          const users = await user.findById({ _id: userID });

          if (users.password === PassWord) {
            const myUser = await user.findByIdAndUpdate(
              { _id: userID },
              { password: newPass },
              {
                new: true,
              }
            );

            return true;
          } else {
            return false;
          }
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
    },
  },
};

import { GraphQLError } from "graphql";
import { config } from "dotenv";
import team from "../modal/team.js";
import user from "../modal/user.js";
config();

export const teamSchema = {
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
      type Player {
        fname: String!
        lname: String!
      }

      type Query {
        getTeams: [Team]
        getTeam(teamID: String!): Team
        getTeamPlayers(teamID: String!): [Player]
      }
      type Mutation {
        createTeam(teamName: String!, teamCity: String!, Image: String!): Team
      }
    `,
  ],
  resolvers: {
    Query: {
      getTeam: async (_, { teamID }, {}) => {
        try {
          const myTeam = await team.find({ _id: teamID });

          return myTeam;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
      getTeams: async (_, {}, { userID }) => {
        try {
          const myTeams = await team.find({ Coach: userID });

          return myTeams;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
      getTeamPlayers: async (_, { teamID }) => {
        try {
          const TeamPlayer = await team
            .find({ _id: teamID }, { Players: 1 })
            .populate("Players");

          return TeamPlayer[0].Players;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
    },
    Mutation: {
      createTeam: async (_, { Image, teamName, teamCity }, { userID }) => {
        try {
          const newTeam = new team({
            teamName: teamName,
            teamCity: teamCity,
            Image: Image,
            Coach: userID,
            Players: [],
          });
          newTeam.save();

          return newTeam;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
    },
  },
};

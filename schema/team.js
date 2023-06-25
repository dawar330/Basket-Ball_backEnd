import { GraphQLError } from "graphql";
import { config } from "dotenv";
import team from "../modal/team.js";
import user from "../modal/user.js";
import play from "../modal/play.js";
import { mongo } from "mongoose";
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
      type TeamInfo {
        _id: String!
        teamName: String!
        teamCity: String!
        Image: String!
        Coach: String!
        Players: [Player]!
      }
      type TeamStat {
        points: Int
        rebounds: Int
        assists: Int
        steals: Int
      }
      type Player {
        _id: String!
        fname: String!
        lname: String!
        avatar: String
      }

      type Query {
        getTeams: [Team]
        getTeam(teamID: String!): Team
        getTeamsInfo: [TeamInfo]
        getTeamPlayers(teamID: String!): [Player]
        getTeamStats(teamID: String!): TeamStat
      }
      type Mutation {
        createTeam(teamName: String!, teamCity: String!, Image: String!): Team
        updateTeamInfo(
          teamID: String!
          teamName: String!
          teamCity: String!
          Image: String!
        ): Team
        RemoveTeamPlayer(teamID: String!, PlayerID: String!): Boolean
        addTeamPlayer(teamID: String!, PlayerIDs: [String!]): Boolean
      }
    `,
  ],
  resolvers: {
    Query: {
      getTeam: async (_, { teamID }, {}) => {
        try {
          const myTeam = await team.find({ _id: teamID });

          return myTeam[0];
        } catch (error) {
          throw new GraphQLError(error);
        }
      },

      getTeamStats: async (_, { teamID }, {}) => {
        try {
          const teamStats = await play.aggregate([
            {
              $match: {
                Team: new mongo.ObjectId(teamID),
                Missed: false,
              },
            },
            {
              $group: {
                _id: null,
                totalPoints: {
                  $sum: {
                    $cond: [
                      { $eq: ["$PlayType", "3-Point"] },
                      3,
                      {
                        $cond: [
                          { $eq: ["$PlayType", "2-Point"] },
                          2,
                          {
                            $cond: [{ $eq: ["$PlayType", "Free Throw"] }, 1, 0],
                          },
                        ],
                      },
                    ],
                  },
                },
                totalRebounds: {
                  $sum: {
                    $cond: [{ $in: ["$PlayType", ["OFF", "DEF"]] }, 1, 0],
                  },
                },
                totalAssists: {
                  $sum: { $cond: [{ $eq: ["$PlayType", "A"] }, 1, 0] },
                },
                totalSteals: {
                  $sum: { $cond: [{ $eq: ["$PlayType", "STEAL"] }, 1, 0] },
                },
              },
            },
          ]);

          // The results are in an array with a single object, so extract the values
          const { totalPoints, totalRebounds, totalAssists, totalSteals } =
            teamStats[0] ?? {};

          const teamStatss = {
            points: totalPoints ?? 0,
            rebounds: totalRebounds ?? 0,
            assists: totalAssists ?? 0,
            steals: totalSteals ?? 0,
          };
          return teamStatss;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
      getTeams: async (_, {}, { userID }) => {
        try {
          //TODO Verify That all Teams Should Appear or not
          const myTeams = await team.find();

          return myTeams;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
      getTeamsInfo: async (_, {}, { userID }) => {
        try {
          //TODO Verify That all Teams Should Appear or not
          const myTeams = await team
            .find({ Coach: userID })
            .populate("Players");

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
      createTeam: async (
        _,
        { Image, teamName, teamCity },
        { userID, liveQueryStore }
      ) => {
        try {
          const newTeam = new team({
            teamName: teamName,
            teamCity: teamCity,
            Image: Image,
            Coach: userID,
            Players: [],
          });
          newTeam.save();
          liveQueryStore.invalidate(["Query.getTeamsInfo"]);
          return newTeam;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
      updateTeamInfo: async (_, { Image, teamName, teamCity, teamID }, {}) => {
        try {
          const newTeam = await team.findByIdAndUpdate(
            { _id: teamID },
            {
              teamName: teamName,
              teamCity: teamCity,
              Image: Image,
            }
          );
          return newTeam;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
      RemoveTeamPlayer: async (_, { teamID, PlayerID }, {}) => {
        try {
          const newTeam = await team.findByIdAndUpdate(
            { _id: teamID },
            {
              $pull: {
                Players: PlayerID,
              },
            }
          );
          return true;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
      addTeamPlayer: async (_, { teamID, PlayerIDs }, {}) => {
        try {
          const newTeam = await team.findByIdAndUpdate(
            { _id: teamID },
            {
              $push: {
                Players: PlayerIDs,
              },
            }
          );
          return true;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
    },
  },
};

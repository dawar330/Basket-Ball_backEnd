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
        TimeOutLimit: Int
        FoulLimit: Int
      }
      input CreateGameInput {
        homeTeam: String!
        awayTeam: String!
      }
      type SeasonOverView {
        Win: Int!
        Loss: Int!
      }
      type getRecentGamesStats {
        _id: String!
        Points: Int!
        TournOvers: Int!
        Steal: Int!
        ReboundOFF: Int!
        ReboundDEF: Int!
        BLOCK: Int!
        Assist: Int!
      }
      type Query {
        getGames: [Game]
        getGame(gameID: String!): Game
        getSeasonOverView: SeasonOverView
        getRecentGamesStats: [getRecentGamesStats]
      }

      type Mutation {
        createGame(CreateGameInput: CreateGameInput!): Game
        StartGame(gameID: String!): Game
        UpdateGameFoulLimit(
          gameID: String!
          PassWord: String!
          newLimit: Int!
        ): Boolean
        UpdateGameTimeOutLimit(
          gameID: String!
          PassWord: String!
          newLimit: Int!
        ): Boolean
      }
    `,
  ],
  resolvers: {
    Query: {
      getGames: async (_, {}, { userID }) => {
        try {
          // let User = await user.findById({ _id: userID });
          // if (User.role === "Player") {
          //   const myGames = await game.aggregate([
          //     {
          //       $lookup: {
          //         from: "teams",
          //         localField: "homeTeam",
          //         foreignField: "_id",
          //         as: "Home",
          //       },
          //     },
          //     {
          //       $lookup: {
          //         from: "teams",
          //         localField: "awayTeam",
          //         foreignField: "_id",
          //         as: "away",
          //       },
          //     },
          //     {
          //       $project: {
          //         homeTeam: {
          //           $arrayElemAt: ["$Home", 0],
          //         },
          //         awayTeam: {
          //           $arrayElemAt: ["$away", 0],
          //         },
          //         coach: 1,
          //         TimeOutLimit: 1,
          //         FoulLimit: 1,
          //         startTime: 1,
          //         home: {
          //           $arrayElemAt: ["$Home.Players", 0],
          //         },
          //         away: {
          //           $arrayElemAt: ["$away.Players", 0],
          //         },
          //       },
          //     },
          //     {
          //       $match: {
          //         $or: [
          //           {
          //             home: userID,
          //           },
          //           {
          //             away: userID,
          //           },
          //         ],
          //       },
          //     },
          //     {
          //       $project: {
          //         home: 0,
          //         away: 0,
          //       },
          //     },
          //   ]);

          //   return myGames;
          // } else {
          const myGames = await game
            .find({ coach: userID })
            .populate("homeTeam")
            .populate("awayTeam");

          return myGames;
          // }
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
      getRecentGamesStats: async (_, {}, { userID }) => {
        try {
          const myGame = await game.aggregate([
            {
              $match: {
                coach: userID,
              },
            },
            {
              $lookup: {
                from: "plays",
                localField: "_id",
                foreignField: "Game",
                as: "Plays",
              },
            },
            {
              $project: {
                Plays: 1,
              },
            },
            {
              $unwind: {
                path: "$Plays",
                preserveNullAndEmptyArrays: false,
              },
            },
            {
              $group: {
                _id: "$Plays.Game",
                Points: {
                  $sum: {
                    $cond: [
                      {
                        $eq: ["$Plays.PlayType", "2-Point"],
                      },
                      2,
                      {
                        $cond: [
                          {
                            $eq: ["$Plays.PlayType", "3-Point"],
                          },
                          3,
                          {
                            $cond: [
                              {
                                $eq: ["$Plays.PlayType", "Free Throw"],
                              },
                              1,
                              0,
                            ],
                          },
                        ],
                      },
                    ],
                  },
                },
                Assist: {
                  $sum: {
                    $cond: [
                      {
                        $eq: ["$Plays.PlayType", "A"],
                      },
                      1,
                      0,
                    ],
                  },
                },
                TournOvers: {
                  $sum: {
                    $cond: [
                      {
                        $eq: ["$Plays.PlayType", "TO"],
                      },
                      1,
                      0,
                    ],
                  },
                },
                Steal: {
                  $sum: {
                    $cond: [
                      {
                        $eq: ["$Plays.PlayType", "STEAL"],
                      },
                      1,
                      0,
                    ],
                  },
                },
                ReboundOFF: {
                  $sum: {
                    $cond: [
                      {
                        $eq: ["$Plays.PlayType", "OFF"],
                      },
                      1,
                      0,
                    ],
                  },
                },
                ReboundDEF: {
                  $sum: {
                    $cond: [
                      {
                        $eq: ["$Plays.PlayType", "DEF"],
                      },
                      1,
                      0,
                    ],
                  },
                },
                BLOCK: {
                  $sum: {
                    $cond: [
                      {
                        $eq: ["$Plays.PlayType", "BLOCK"],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ]);

          return myGame;
        } catch (error) {
          throw new GraphQLError(error);
        }
      },

      getSeasonOverView: async (_, {}, { userID }) => {
        try {
          const myGame = await game.aggregate([
            {
              $match: {
                coach: userID,
              },
            },
            {
              $lookup: {
                from: "plays",
                localField: "_id",
                foreignField: "Game",
                let: {
                  homeTeam: "$homeTeam",
                },
                pipeline: [
                  {
                    $match: {
                      Missed: false,
                    },
                  },
                  {
                    $project: {
                      Team: {
                        $cond: [
                          {
                            $eq: ["$Team", "$$homeTeam"],
                          },
                          1,
                          0,
                        ],
                      },
                      score: {
                        $cond: [
                          {
                            $eq: ["$PlayType", "2-Point"],
                          },
                          2,
                          {
                            $cond: [
                              {
                                $eq: ["$PlayType", "3-Point"],
                              },
                              3,
                              {
                                $cond: [
                                  {
                                    $eq: ["$PlayType", "Free Throw"],
                                  },
                                  1,
                                  0,
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    },
                  },
                  {
                    $group: {
                      _id: "$Team",
                      Score: {
                        $sum: "$score",
                      },
                    },
                  },
                ],
                as: "GamePlays",
              },
            },
            {
              $project: {
                GamePlays: 1,
              },
            },
          ]);
          let Win = 0;
          let Loss = 0;

          myGame.forEach((Game) => {
            let HomeScore = 0;
            let AwayScore = 0;
            if (Game.GamePlays[0]?._id === 1) {
              HomeScore = Game.GamePlays[0]?.Score;
            }
            if (Game.GamePlays[1]?._id === 1) {
              HomeScore = Game.GamePlays[1]?.Score;
            }
            if (Game.GamePlays[1]?._id === 0) {
              AwayScore = Game.GamePlays[1]?.Score;
            }
            if (Game.GamePlays[0]?._id === 0) {
              AwayScore = Game.GamePlays[0]?.Score;
            }
            if (HomeScore > AwayScore) {
              ++Win;
            } else {
              ++Loss;
            }
          });

          return { Win, Loss };
        } catch (error) {
          console.log(error);
          throw new GraphQLError(error);
        }
      },
    },
    Mutation: {
      createGame: async (_, { CreateGameInput }, { userID }) => {
        try {
          const CurrentUser = await user.findOne({ _id: userID });

          if (CurrentUser.AvailableGames > 0) {
            const myGame = new game({
              homeTeam: CreateGameInput.homeTeam,
              awayTeam: CreateGameInput.awayTeam,
              coach: userID,
              TimeOutLimit: 6,
              FoulLimit: 3,
              startTime: null,
            });
            CurrentUser.AvailableGames -= 1;
            CurrentUser.save();
            myGame.save();

            return myGame;
          } else {
            return {
              homeTeam: "",
              awayTeam: "",
              coach: "",
              TimeOutLimit: 0,
              FoulLimit: 0,
              startTime: null,
            };
          }
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
      UpdateGameFoulLimit: async (
        _,
        { gameID, PassWord, newLimit },
        { userID }
      ) => {
        try {
          const users = await user.findById({ _id: userID });

          if (users.password === PassWord) {
            const myGame = await game.findByIdAndUpdate(
              { _id: gameID },
              { FoulLimit: newLimit }
            );

            return true;
          } else {
            return false;
          }
        } catch (error) {
          throw new GraphQLError(error);
        }
      },
      UpdateGameTimeOutLimit: async (
        _,
        { gameID, PassWord, newLimit },
        { userID }
      ) => {
        try {
          const users = await user.findById({ _id: userID });

          if (users.password === PassWord) {
            const myGame = await game.findByIdAndUpdate(
              { _id: gameID },
              { TimeOutLimit: newLimit }
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

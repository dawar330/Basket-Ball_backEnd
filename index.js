import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { schema } from "./schema/index.js";
import { useLiveQuery } from "@envelop/live-query";
import { createPubSub } from "graphql-yoga";
import { InMemoryLiveQueryStore } from "@n1ru4l/in-memory-live-query-store";
// Create a Yoga instance with a GraphQL schema.
import { global } from "./src/global.js";
import mongoose, { connect, mongo } from "mongoose";
import { MONGODB_URL } from "./config.js";
import { config } from "dotenv";
import user from "./modal/user.js";
import { getUserByToken } from "./schema/jwt.js";
import pkg from "express";
const Express = pkg;
config();
const liveQueryStore = new InMemoryLiveQueryStore();
global.liveQueryStore = liveQueryStore;
global.pubsub = createPubSub();

const yoga = createYoga({
  maskedErrors: false,
  // cors: {
  //   origin: [
  //     "http://viseclub.visewealth.com",
  //     "https://viseclub.visewealth.com",
  //     "https://www.viseclub.visewealth.com",
  //     "http://18.208.0.233:3000",
  //     "http://localhost:3000",
  //   ],
  //   credentials: true,
  //   methods: ["POST"],
  //   bodyParserOptions: {},
  // },

  schema,
  plugins: [useLiveQuery({ liveQueryStore })],
  context: async ({ request }) => {
    let tokenData = await getUserByToken(request.headers.get("bearer"));
    let userID = false;
    let Email = "";
    if (tokenData.email) {
      const currentUser = await user.findOne(
        { email: tokenData.email },
        { _id: 1, email: 1 }
      );
      userID = currentUser._id;
      Email = currentUser.email;
    }
    return {
      userID,
      Email: Email,
      // pubsub: global.pubsub,
    };
  },

  port: 5001,
});

// Pass it into a server to hook into request handlers.
const server = createServer(yoga);
const app = Express();

// Define your route for the webhook endpoint
app.post("/web", Express.raw({ type: "application/json" }), (req, res) => {
  const payload = req.body;
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      "YOUR_STRIPE_WEBHOOK_SECRET"
    );
  } catch (err) {
    console.log("Webhook signature verification failed.");
    return res.sendStatus(400);
  }

  // Handle the specific event type (e.g., payment_intent.succeeded)
  if (event.type === "payment_intent.succeeded") {
    // Perform your Node.js task here
    console.log("Payment succeeded. Perform task here.");
  }

  res.sendStatus(200);
});

// Start the server and you're done!
let port = 4000;
app.listen({ port: 3000 }, () =>
  console.log(`Server running at http://localhost:4001`)
);
connect(MONGODB_URL, { useNewUrlParser: true }).then(() => {
  console.log("MONGODB Connected");
  server.listen(port, () => {
    console.info(`Server is running on http://localhost:${port}/graphql`);
  });
});

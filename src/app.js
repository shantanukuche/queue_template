// src/app.js
const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./routes/index');
const passport = require("passport");
const session = require("express-session");

const { createBullBoard } = require("@bull-board/api");
const { ExpressAdapter } = require("@bull-board/express");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");

const { ensureLoggedIn } = require("connect-ensure-login");
const { queue_blockchain } = require('./queue');
const LocalStrategy = require("passport-local").Strategy;


// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json());


passport.use(
    new LocalStrategy(function (username, password, cb) {
      if (
        username === process.env.QUEUE_USER &&
        password === process.env.QUEUE_PSWD
      ) {
        return cb(null, { user: "bull-board" });
      }
      return cb(null, false);
    }),
  );
  
  passport.serializeUser((user, cb) => {
    cb(null, user);
  });
  
  passport.deserializeUser((user, cb) => {
    cb(null, user);
  });
  
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath("/ui");
  
  createBullBoard({
    queues: [new BullMQAdapter(queue_blockchain)],
    serverAdapter,
    options: {
      uiConfig: {
        boardTitle: "TruEvidence",
      },
    },
  });
  app.set("views", __dirname + "/src/views");
  app.set("view engine", "ejs");
  
  app.use(
    session({ secret: "keyboard cat", saveUninitialized: true, resave: true }),
  );
  
  app.use(passport.initialize({}));
  
  app.use(passport.session({}));
  
  app.get("/ui/login", (req, res) => {
    res.render("login", { invalid: req.query.invalid === "true" });
  });
  
  app.post(
    "/ui/login",
    passport.authenticate("local", { failureRedirect: "/ui/login?invalid=true" }),
    (req, res) => {
      res.redirect("/ui");
    },
  );
  
  app.use(
    "/ui",
    ensureLoggedIn({ redirectTo: "/ui/login" }),
    serverAdapter.getRouter(),
  );

// Set up routes
app.use('/api/users', userRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Node.js API!');
});

// Server listening on port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

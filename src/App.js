const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const userSchema = require("./Schema/userSchema");
const todoSchema = require("./Schema/todoSchema");
const db = require("./connection");
//added body key to request

const session_secret = "newton";
router.use(
    session({
      resave: true,
      saveUninitialized: true,
      secret: session_secret, //adds a property called session to request
      cookie: { maxAge: 1 * 60 * 60 * 1000 },
    })
);

const userModel = mongoose.model("user", userSchema);

const todoModel = mongoose.model("todo", todoSchema);

const isNullorUndefined = (val) => val === null || val === undefined;

const SALT = 2;

router.post("/signup", async (req, res) => {
    const { password, mobile, email, name } = req.body;

    const existingUser = await userModel.findOne({ mobile });

    if (!isNullorUndefined(existingUser)) {
        res.status(400).send({ err: "User already exist" });
    } else {
        const hashedPassword = bcrypt.hashSync(password, SALT);
        const newUser = await userModel({
            name,
            password: hashedPassword,
            mobile,
            email,
        });

        await newUser.save();

        req.session.userId = newUser._id;

        res.status(201).send(newUser);
    }
});
router.post("/login", async (req, res) => {
    const { mobile, password } = req.body;

    const existingUser = await userModel.findOne({ mobile });

    if (isNullorUndefined(existingUser)) {
        res.status(401).send({ err: "Mobile number or Password is incorrect." });
    } else {
        const hashedPassword = existingUser.password;
        if (bcrypt.compareSync(password, hashedPassword)) {
          req.session.userId = existingUser._id;

          res.send(existingUser);
        } else {
          res.status(404).send({ err: "Mobile number or Password is incorrect." });
        }
    }
});

const AuthMiddleware = async (req, res, next) => {
    if (isNullorUndefined(req.session) || isNullorUndefined(req.session.userId)) {
        res.status(401).send("User is not logged in.");
    } else {
        next();
  }
};

router.get("/todo", AuthMiddleware, async (req, res) => {
    const userId = req.session.userId;
    const allTodosOfUser = await todoModel.find({ userId });
    res.send(allTodosOfUser);
});

router.post("/todo", AuthMiddleware, async (req, res) => {
    const todo = req.body;
    todo.creationTime = new Date();
    todo.done = false;
    todo.userId = req.session.userId;
    const newTodo = new todoModel(todo);
    await newTodo.save();
    res.status(201).send(newTodo);
});

router.put("/todo/:todoid", AuthMiddleware, async (req, res) => {
    console.log(req.body, req.params.todoid, "params");
    const { task } = req.body;
    const todoId = req.params.todoid;

    try {
        const searchedTodo = await todoModel.findOne({
            _id: todoId,
            userId: req.session.userId,
        });
        if (isNullorUndefined(searchedTodo)) {
            res.sendStatus(404);
        } else {
            searchedTodo.task = task;
            await searchedTodo.save();
            res.send(searchedTodo);
        }
    } catch (e) {
        res.sendStatus(404);
    }
});

router.delete("/todo/:todoId", AuthMiddleware, async (req, res) => {
    const todoId = req.params.todoId;
    console.log("deleting task", todoId);
    try {
        await todoModel.deleteOne({ _id: todoId, userId: req.session.userId });
        res.sendStatus(200);
    } catch (e) {
        res.sendStatus(404);
    }
});

router.get("/logout", (req, res) => {
    console.log("logout");
    if (!isNullorUndefined(req.session)) {
        req.session.destroy(() => {
        res.sendStatus(200);
      });
    } else {
        res.sendStatus(200);
    }
});

router.get("/userinfo", AuthMiddleware, async (req, res) => {
    const user = await userModel.findById(req.session.userId);

    res.send({ userName: user.userName });
});

// router.get('/userinfo',AuthMiddleware,async (req,res)=>{
//     console.log("inside userinfo ",req.session);
//     const user = await userModel.findById(req.session.userId);
//     res.send({userName : user.userName});
// })
module.exports = router;

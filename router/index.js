const Router = require("express");
const router = new Router();
const userRouter = require("./userRouter.js");

router.use("/user", userRouter);

module.exports = router;
const jwt = require('jsonwebtoken')
const User = require("../models/models");

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next()
    }
    try {
        const {email, password} = req.body;
        console.log(email)
        const user = User.findOne(({where: {email}}));
        if (user.dataValues.status === "Block") {
            return res.status(404).json({message: "This user is block"});
        }
        const token = req.header.authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({message: "User is not authorized"})
        }
        const decode = token.verify(token, process.env.SECRET_KEY);
        req.user = decode;
        next();
    } catch (e) {
        res.status(401).json({message: "User is not authorized"})
    }
}
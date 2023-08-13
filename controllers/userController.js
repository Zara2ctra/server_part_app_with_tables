const ApiError = require("../error/ApiError.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/models.js");

const generateJwt = (id, email, name) => {
    return jwt.sign(
        {id, email, name},
        process.env.SECRET_KEY,
        {expiresIn: "24h"}
    )
}

class UserController {
    async registration(req, res, next) {
        const {email, password, name, status} = req.body;
        if ((!email) || (!password)) {
            return next(ApiError.badRequest("Incorrect email or password " + email + "  " + password))
        }
        const candidate = await User.findOne(({where: {email}}));
        if (candidate) {
            return next(ApiError.badRequest("A user with this email address already exists"));
        }
        const hashPassword = await bcrypt.hash(password, 5);
        const user = await User.create({email, password: hashPassword, name, status});
        const token = generateJwt(user.id, user.email, user.name);
        await User.update({last_login_date: `${new Date()}`}, {
            where: {
                email: email
            }
        });
        await User.update({registration_date: `${new Date()}`}, {
            where: {
                email: email
            }
        });
        return res.json({token})
    }

    async login(req, res, next) {
        const {email, password} = req.body;
        const user = await User.findOne(({where: {email}}));
        if (!user) {
            return next(ApiError.internal("There is no user with this email address"));
        }
        ;
        let comparePassword = bcrypt.compareSync(password, user.password);
        if (!comparePassword) {
            return next(ApiError.internal("Incorrect password"));
        }
        if (user?.dataValues?.status === "Block") {
            return next(ApiError.internal("This user is block"));
        }
        await User.update({last_login_date: `${new Date()}`}, {
            where: {
                email: email
            }
        });

        const token = generateJwt(user.id, user.email, user.name);

        return res.json({token});
    }

    async check(req, res) {
        const token = generateJwt(req.user.id, req.user.email, req.user.name);
        return res.json({token})
    }

    async getAll(req, res) {
        let users = await User.findAll();
        return res.json(users);
    }

    async deleteUser(req, res, next) {
        let id = req.body.id;
        await User.destroy({
            where: {
                id: id
            }
        });
        return res.json({message: "Deleted"})
    }

    async deleteAll(req, res, next) {
        await User.destroy({
            where: {}
        });
        return res.json({message: "All are Deleted"})
    }

    async changeUserStatus(req, res, next) {
        let id = req.body.id;
        const user = await User.findOne(({where: {id: id}}));
        if (user.dataValues.status === "Block") {
            await User.update({status: "Active"}, {
                where: {
                    id: id
                }
            });
        } else {
            await User.update({status: "Block"}, {
                where: {
                    id: id
                }
            });
        }
        return res.json({message: "Status changed"})
    }

    async blockAll(req, res, next) {
        await User.update({status: "Block"}, {
            where: {}
        });
        return res.json({message: "All user are block"})
    }
}


module.exports = new UserController();
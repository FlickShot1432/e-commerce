const Mysqli = require('mysqli')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


// one config
let conn = new Mysqli({
    host: 'localhost', // IP/domain  
    port: 3306, //port, default 3306  
    user: 'root', // username
    passwd: 'ips12345', // password
    db: 'mega_shop' // the default database name  【optional】
})

let db = conn.emit(false, '')


const secret = "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";

module.exports = {
    database: db,
    secret: secret,
    validJWTNeeded: (req, res, next) => {
        if (req.headers['authorization']) {
            try {
                let authorization = req.headers['authorization'].split(' ');
                if (authorization[0] !== 'Bearer') {
                    return res.status(401).send();
                } else {
                    req.jwt = jwt.verify(authorization[1], secret);
                    return next();
                }
            } catch (err) {
                return res.status(403).send("Authentication failed");
            }
        } else {
            return res.status(401).send("No authorization header found.");
        }
    },
    hasAuthFields: (req, res, next) => {
        let errors = [];

        if (req.body) {
            if (!req.body.email) {
                errors.push('Missing email field');
            }
            if (!req.body.password) {
                errors.push('Missing password field');
            }

            if (errors.length) {
                return res.status(400).send({ errors: errors.join(',') });
            } else {
                return next();
            }
        } else {
            return res.status(400).send({ errors: 'Missing email and password fields' });
        }
    },
    // isPasswordAndUserMatch: async (req, res, next) => {
    //     const myPlaintextPassword = req.body.password;
    //     const myEmail = req.body.email;

    //     const user = await db.table('users').filter({ $or: [{ email: myEmail }, { username: myEmail }] }).get();

    //     if (user) {
    //         const match = await bcrypt.compare(myPlaintextPassword, user.password);

    //         if (match) {
    //             req.username = user?.RowDataPacket?.username;
    //             req.email = user?.RowDataPacket?.email;
    //             next();
    //         } else {
    //             res.status(401).send("Username or password incorrect");
    //         }

    //     } else {
    //         res.status(401).send("Username or password incorrect");
    //     }
    // }

    isPasswordAndUserMatch: async (req, res, next) => {
        const myPlaintextPassword = req.body.password;
        const myEmail = req.body.email;
    
        const user = await db.table('users').filter({ $or: [{ email: myEmail }, { username: myEmail }] }).get();
        console.log(user);
        if (user) {
            const match = await bcrypt.compare(myPlaintextPassword, user.password);
        
            if (match) {
                req.userData = {
                    username: user.username,
                    email: user.email,
                    id: user.id,
                    photoUrl: user.photoUrl,
                    fname:user.fname,
                    lname:user.lname
                };
                next();
            } else {
                res.status(401).send("Username or password incorrect");
            }
    
        } else {
            res.status(401).send("Username or password incorrect");
        }
    }
    
};
const { getUserByUserNamePwd, roleUsers } = require('../models/user.model')
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { username, pwd } = req.body;
    let token;
    try {
        const roleUser = await roleUsers();
        const result = await getUserByUserNamePwd(username, pwd);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }


        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }


        if (user.isadmin === true) {
            const loginUsr = { id: user.ids, username: user.username, isadmin: user.isadmin },
                token = jwt.sign(
                    loginUsr,
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

            req.session.token = token;
            req.session.user = loginUsr;
            res.json({
                token,
                user: loginUsr
            });
        } else {
            const secondUser = roleUser.filter(item => (item.username === user.username && item.pwd === user.pwd));
            //console.log(secondUser);
            const loginUsr = { id: secondUser[0].ids, username: secondUser[0].username, isadmin: secondUser[0].isadmin, groupid: secondUser[0].groupid, group: secondUser[0].names },
                //console.log(secondUser);
                token = jwt.sign(
                    loginUsr,
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

            req.session.token = token;
            req.session.user = loginUsr;
            res.json({
                token,
                user: loginUsr
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const checkAuth = (req, res) => {
    if (!req.session.token) {
        return res.json({ authenticated: false });
    }

    try {
        const decoded = jwt.verify(req.session.token, process.env.JWT_SECRET);
        res.json({
            authenticated: true,
            user: decoded
        });
    } catch (error) {
        res.json({ authenticated: false });
    }
};

const logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Erreur de déconnexion' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Déconnecté avec succès' });
    });
};


module.exports = { login, checkAuth, logout }
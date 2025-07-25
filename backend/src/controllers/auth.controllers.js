const { getUserByUserNamePwd } = require('../models/user.model')
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { username, pwd } = req.body;

    try {
        const result = await getUserByUserNamePwd(username, pwd);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }

        const user = result.rows[0];

        console.log(user);

        if (!user) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }


        const token = jwt.sign(
            { id: user.ids, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );


        req.session.token = token;
        req.session.user = user;

        res.json({
            token,
            user: {
                id: user.ids,
                username: user.username
            }
        });

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
        const decoded = jwt.verify(req.session.token, SECRET_KEY);
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
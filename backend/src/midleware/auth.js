const jwt = require('jsonwebtoken')

const authenticateJWT = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                console.error('JWT Verification Error:', err);
                return res.status(403).json({ error: 'Token invalide' });
            }
            req.user = user;
            return next();
        });
    }

    else if (req.session?.token) {
        jwt.verify(req.session.token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                console.error('Session Token Verification Error:', err);
                return res.status(403).json({ error: 'Session token invalide' });
            }
            req.user = user;
            return next();
        });
    }

    else {
        console.warn('Aucun token JWT trouvé dans les headers ou la session');
        return res.status(401).json({ error: 'Authentification requise' });
    }
};


module.exports = { authenticateJWT }
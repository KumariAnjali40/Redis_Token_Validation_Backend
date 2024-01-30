const jwt = require("jsonwebtoken");
const Redis = require('ioredis');
const redis = new Redis({
    port : "13881",
    host : "redis-13881.c301.ap-south-1-1.ec2.cloud.redislabs.com",
    password : "iuIcoRFsH3WwAlScP2KkuBM9CpNGhKTu"
});



const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log(token);
  if (!token || await isTokenBlacklisted(token)) {
    return res.status(401).json({ error: 'Invalid or blacklisted token' });
  }
  jwt.verify(token, "masai", (err, decoded) => {
    if (decoded) {
      console.log(decoded);
      next();
    } else {
      res.json({ msg: "You are not authorized" });
    }
  });
};


async function isTokenBlacklisted(token) {
    const result = await redis.get(token);
    return result === 'blacklisted'; // return boolean...
 }

module.exports = {
  auth,
};
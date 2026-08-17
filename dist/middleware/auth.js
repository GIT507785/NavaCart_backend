import jwt from "jsonwebtoken";
const authUser = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization header missing",
            });
        }
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : authHeader;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token missing",
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded?.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }
        req.userId = decoded.id;
        next();
    }
    catch (error) {
        console.log("AUTH ERROR:", error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
export default authUser;

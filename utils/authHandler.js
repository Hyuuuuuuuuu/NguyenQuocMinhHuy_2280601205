// utils/authHandler.js
let { Response } = require('./responseHandler')
let jwt = require("jsonwebtoken")
let users = require('../schemas/users')

module.exports = {
    Authentication: async function (req, res, next) {
        try {
            let token = req.headers.authorization ? req.headers.authorization : req.cookies.token;

            if (!token || !token.startsWith("Bearer")) {
                return Response(res, 401, false, "Yêu cầu chưa được xác thực. Vui lòng đăng nhập.");
            }
            
            token = token.split(" ")[1];
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // <-- SỬA Ở ĐÂY

            // Không cần kiểm tra exp thủ công, jwt.verify đã làm việc đó
            // Nếu token hết hạn, nó sẽ throw lỗi và bị bắt bởi khối catch.

            const user = await users.findById(decoded._id);
            if (!user || user.isDeleted) {
                return Response(res, 401, false, "Người dùng không tồn tại hoặc đã bị xóa.");
            }

            req.userId = decoded._id;
            next();

        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return Response(res, 401, false, "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            }
            if (error.name === 'JsonWebTokenError') {
                return Response(res, 401, false, "Token không hợp lệ.");
            }
            // Chuyển các lỗi khác cho error handler chung
            next(error);
        }
    },
    Authorization: function (...roleRequire) {
        return async function (req, res, next) {
            try {
                // req.userId phải tồn tại sau khi qua middleware Authentication
                if (!req.userId) {
                    return Response(res, 403, false, "Lỗi xác thực người dùng.");
                }

                let user = await users.findById(req.userId).populate({
                    path: 'role',
                    select: 'name'
                });

                if (!user || !user.role) {
                     return Response(res, 403, false, "Không thể xác định vai trò người dùng.");
                }

                let role = user.role.name;
                if(roleRequire.includes(role)){
                    next();
                } else {
                    Response(res, 403, false, "Bạn không có quyền truy cập chức năng này.");
                }
            } catch(error) {
                next(error);
            }
        }
    }
}
const multer = require('multer')

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'text/plain') {
            return cb(new Error('Only .txt files are allowed'), false)
        }
        cb(null, true)
    }
})

module.exports = upload
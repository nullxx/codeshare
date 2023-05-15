const mongoose = require('mongoose');

const schema = mongoose.model('Code',
    new mongoose.Schema(
        {
            shortId: {
                type: String,
                index: true
            },
            code: String,
            hash: {
                type: String,
                index: true
            },
            views: {
                type: Number,
                default: 0
            }
        },
        {
            timestamps: { createdAt: true, updatedAt: false }
        }
    )
);


module.exports = schema;
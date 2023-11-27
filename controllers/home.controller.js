const randomstring = require("randomstring");
const { sha512_256 } = require('js-sha512');

const Code = require('../schemas/code.schema');

function getRoot(req, res, next) {
    try {
        res.render('front/index');
    } catch (error) {
        next(error);
    }
}

async function newCode(req, res, next) {
    try {
        const { code } = req.body;

        if (!code) throw new Error('ERR_EMPTY_CODE');

        const hash = sha512_256(code);
        let codeFound = await Code.findOne({ hash });

        if (!codeFound) {
            const byteLength = Buffer.byteLength(code, 'utf8');
            const mbLength = byteLength / 1048576;

            if (mbLength > 5) {
                throw new Error('MAX_LENGTH_RAISED');
            }
            const shortId = randomstring.generate({ capitalization: false, charset: 'alphabetic', length: 5 });
            codeFound = await new Code({ code, hash, shortId }).save();
        }

        res.json({
            shortId: codeFound.shortId,
            hash: codeFound.hash,
            createdAt: codeFound.createdAt
        });
    } catch (error) {
        next(error);
    }
}

async function showCode(req, res, next) {
    try {
        const { shortId } = req.params;
        const { raw } = req.query;

        let codeFound = await Code.findOneAndUpdate({ shortId }, { $inc: { views: 1 } });
        if (!codeFound) throw new Error('ERR_NOT_FOUND');
        if (raw) {
            return res.send(codeFound.code);
        }
        
        res.render('code', { code: codeFound.code, shortId: codeFound.shortId });
    } catch (error) {
        next(error);
    }
}

async function statsCode(req, res, next) {
    try {
        const { shortId } = req.params;

        let codeFound = await Code.findOne({ shortId });
        if (!codeFound) throw new Error('ERR_NOT_FOUND');

        res.json({
            shortId: codeFound.shortId,
            hash: codeFound.hash,
            views: codeFound.views,
            createdAt: codeFound.createdAt
        });
    } catch (error) {
        next(error);
    }
}

module.exports.getRoot = getRoot;
module.exports.newCode = newCode;
module.exports.showCode = showCode;
module.exports.statsCode = statsCode;   
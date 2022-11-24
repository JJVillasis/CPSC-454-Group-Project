const express = require('express')
const cors = require("cors");
const router = express.Router();
const app = express()

const port = 3000
require('dotenv').config();
app.use(cors({
    origin: "*",
}));
app.use(express.json());
app.use("/",router);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*" /*"http://localhost:3000"*/); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE,PATCH,OPTIONS',)
    next();
});

const url = "https://dev-imgur-clone-bucket.s3.amazonaws.com/"
app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`REST API Started on port ${port}`))

app.get('/list', async (req, res) => {
    const theList = await list();
    res.send(theList)
})

app.get('/db', async (req, res) => {
    const theList = await db();
    res.send(theList)
})

app.get('/images', async (req, res) => {
    const theList = await imagesWithComments();
    res.send(theList)
})

app.get('/listall', async (req, res) => {
    const theList = await db();
    const imageList = [];
    for (let i = 0; i < theList.length; ++i) {
        console.log(theList[i]);
        imageList.push(url + theList[i].image_object_id);
    }
    res.header("Access-Control-Allow-Origin", "*");
    res.send(imageList)
})

async function getLikesForUser(username) {
    if (username === undefined) {
        return []
    }
    console.log(poolConfig + " " + configTwo);
    const pool = new Pool(poolConfig)
    const answer = await pool.query(`SELECT * from likes WHERE username = '${username}'`);
    console.log(answer.rows);
    pool.end()
    return answer.rows;
}

let commentCache = null;

async function getComments(pool) {
    if (commentCache !== null)
        return commentCache
    const answer = await pool.query(`SELECT * from comments`);
    console.log(answer.rows);
    commentCache = {}
    for (let row of answer.rows) {
        commentCache[row.comment_id] = row;
    }
    return commentCache;
}

let commentsForImageCache = null

async function getCommentsForImage(pool, image_id) {

    if (commentsForImageCache !== null && commentsForImageCache[image_id] !== undefined)
        return commentsForImageCache[image_id];

    const answer = await pool.query(`SELECT * from image_comments WHERE image_id = ${image_id}`);

    console.log(answer.rows);
    if (commentsForImageCache === null) {
        commentsForImageCache = {}
    }
    commentsForImageCache[image_id] = answer.rows;
    return answer.rows;
}

let commentsPerImageCache = null

async function getCommentsPerImage(pool, image_id) {

    if (commentsPerImageCache !== null && commentsPerImageCache[image_id] !== undefined)
        return commentsPerImageCache[image_id];

    const answer = await pool.query(`SELECT * from image_comments`);

    if (commentsPerImageCache === null) {
        commentsPerImageCache = {}
    }
    for (let i = 0; i < answer.rowCount; ++i) {
        const row_image_id = answer.rows[i].image_id
        if (commentsPerImageCache[row_image_id] === undefined)
            commentsPerImageCache[row_image_id] = [];
        if (commentsPerImageCache[row_image_id].indexOf(answer.rows[i].comment_id) === -1)
            commentsPerImageCache[row_image_id].push(answer.rows[i].comment_id)
    }
    return commentsPerImageCache[image_id];
}

// search?
//    text=   search text
//    sortby= newest, controversial, viral
//    user=   username

app.get('/search', async (req, res) => {
    const pool = new Pool(poolConfig);

    const { image_rows, tags } = await search(pool, req.query.text, req.query.sortby, req.query.user, req.query.image_id);
    const imageList = [];
    let userLikes = await getLikesForUser(pool, req.query.currentuser);
    let comments = await getComments(pool);
    console.log(req.query.currentuser + ": " + userLikes);
    for (let i = 0; i < image_rows.length; ++i) {
        let theTags = []
        for (let key in tags) {
            if (image_rows[i].image_id === tags[key].image_id) {
                theTags.push(tags[key].tag_name.toLowerCase())
            }
        }
        let commentsForImage = []
        let commentsReThisImage = await getCommentsPerImage(pool, image_rows[i].image_id)
        if (commentsReThisImage !== undefined) {
            for (let c = 0; c < commentsReThisImage.length; ++c) {
                commentsForImage.push(comments[commentsReThisImage[c]]);
            }
        }
        let image = {
            imgURL: url + image_rows[i].image_object_id,
            image_id: image_rows[i].image_id,
            title: image_rows[i].image_title,
            username: image_rows[i].username,
            likes: image_rows[i].likes,
            dislikes: image_rows[i].dislikes,
            tags: theTags,
            userLikes: userLikes.find( (it) => {
                return it.image_id === image_rows[i].image_id
            }),
            comments: commentsForImage
        }
        imageList.push(image);
    }
    pool.end()
    res.header("Access-Control-Allow-Origin", "*");
    res.send(imageList)
})

app.post('/addimage', async (req, res) => {
    console.log(req.body);
    console.log(req.headers);

    if (req.body === undefined || req.body === {}) {
        res.header("Access-Control-Allow-Origin", "*");
        res.send("failure")
        return;
    }

    if (!await verifyToken2(req.body.jwt)) {
        res.header("Access-Control-Allow-Origin", "*");
        res.status(400).send("failure")
        return;
    }


    const objectId = req.body.objectId;
    const username = req.body.username;
    const caption = req.body.caption;
    const tags = req.body.tags;

    // break up the tags
    let tagList = []
    if (tags !== null && tags !== undefined) {
        let wordList = tags.split(' ')
        console.log("wordList: " + wordList)
        for (let word of wordList) {
            word = word.trim().toLowerCase();
            if (word[0] === '#') {
                word = word.substring(1);
            }
            if (word.length > 0)
                tagList.push(word)
        }
    }
    console.log("tags:" + tags + " --> tagList: " + tagList)

    const pool = new Pool(poolConfig)
    const queryText = `
        INSERT INTO images (image_title, image_object_id, username, image_date) 
        VALUES ('${caption}', '${objectId}', '${username}', '${new Date().toDateString()}')
        RETURNING image_id`
    console.log(queryText);
    const answer = await pool.query(queryText);
    console.log(answer.rowCount);

    // push the tags
    for (let key = 0; key < tagList.length; ++key) {
        console.log(`SELECT * from tags WHERE tag_name = '${tagList[key]}'`);
        let result = await pool.query(`SELECT * from tags WHERE tag_name = '${tagList[key]}'`);

        let tag_id;
        if (result.rowCount !== 1) {
            result = await pool.query(`INSERT INTO tags (tag_name) VALUES ('${tagList[key]}') RETURNING tag_id`);
            tag_id = result.rows[0].tag_id;
        } else {
            tag_id = result.rows[0].tag_id
        }
        console.log("result (insert) = " + tag_id)

        let finalResult = await pool.query(`INSERT INTO image_tags (image_id, tag_id) VALUES ('${answer.rows[0].image_id}', '${tag_id}') RETURNING tag_id`);
        console.log("finalResult = " + finalResult.rows[0].tag_id)
    }

    pool.end()
    res.header("Access-Control-Allow-Origin", "*");
    res.send("success")
})

app.post('/like', async (req, res) => {
    console.log(req.body);
    console.log(req.headers);

    if (req.body === undefined || req.body === {}) {
        res.header("Access-Control-Allow-Origin", "*");
        res.status(402).send("failure")
    }

    if (!await verifyToken2(req.body.jwt)) {
        res.header("Access-Control-Allow-Origin", "*");
        res.status(400).send("failure")
        return;
    }

    const image_id = req.body.image_id;
    const username = req.body.username;
    const like = req.body.like;
    const dislike = req.body.dislike;

    const pool = new Pool(poolConfig)

    // push the tags
    let result = await pool.query(`SELECT * from likes WHERE image_id = '${image_id}' AND username = '${username}'`);
    console.log("query1")
    if (result.rowCount !== 1) {
        console.log("query new row")
        result = await pool.query('INSERT INTO likes (image_id, username, liked, disliked) VALUES' + `('${image_id}','${username}','${like}','${dislike}')`);
        console.log("query row inserted")
    } else {
        result = await pool.query(`UPDATE likes SET liked = ${like}, disliked = ${dislike} WHERE image_id = '${image_id}' AND username = '${username}'`);
        console.log("query row edited")
    }
    
    pool.end()
    res.header("Access-Control-Allow-Origin", "*");
    res.send("success")
})

app.post('/comment', async (req, res) => {
    console.log(req.body);
    console.log(req.headers);

    if (req.body === undefined || req.body === {}) {
        res.header("Access-Control-Allow-Origin", "*");
        res.send("failure")
    }

    const image_id = req.body.image_id;
    const username = req.body.username;
    const commentText = req.body.comment;

    const pool = new Pool(poolConfig)

    let result = await pool.query('INSERT INTO comments (username, comment_date, comment_contents) VALUES' + `('${username}','${new Date().toDateString()}','${commentText}')`);

    let result2 = await pool.query('INSERT INTO image_comments (image_id, comment_id) VALUES' + `('${image_id}','${result.rows[0].comment_id}')`);

    pool.end()
    res.header("Access-Control-Allow-Origin", "*");
    res.send("success")
})

const AWS = require('aws-sdk');
const {S3Client, ListObjectsV2Command} = require("@aws-sdk/client-s3"); // CommonJS import

const params = {
    Bucket: 'dev-imgur-clone-bucket',
    //Delimiter: '',
    //Prefix: '*'
};

// pages: https://stackoverflow.com/questions/9437581/node-js-amazon-s3-how-to-iterate-through-all-files-in-a-bucket
const configTwo = {
    credentials: {
            accessKeyId: process.env.accessKeyId,
            secretAccessKey: process.env.secretAccessKey
    },
    region: process.env.region
}

async function list() {
    const client = new S3Client(configTwo);
    const command = new ListObjectsV2Command(params);
    const response = await client.send(command);
    console.log(response);
    return response;
}

function requestUploadURL(event, context, callback) {
    var s3 = new AWS.S3();

    var params = JSON.parse(event.body);

    var s3Params = {
        Bucket: params.Bucket,
        Key: params.name,
        ContentType: params.type,
        Expires: 3600,
        ACL: 'public-read'
    };

    var uploadURL = s3.getSignedUrl('putObject', s3Params);

    callback(null, {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({uploadURL: uploadURL}),
    })
}

const poolConfig = {
    user: process.env.user,
    host: process.env.host,
    database: process.env.database,
    password: process.env.password,
    port: process.env.port,
};

const verifyConfig = {
    region: process.env.region,
    userPoolId: process.env.IdentityPoolId,
    appClientId: process.env.ClientId,
    tokenType: 'id', // either "access" or "id"
}

const {Pool, Client} = require('pg')

async function db() {
    console.log(poolConfig + " " + configTwo);
    const pool = new Pool(poolConfig)
    const answer = await pool.query('SELECT * from images');
    console.log(answer.rows);
    pool.end()
    return answer.rows;
}

/**
 * The main multi-functional search DB query
 * @param text
 * @param sortBy
 * @param user
 * @returns {Promise<*>}
 */

async function search(pool, text, sortBy, user, image_id) {
    console.log("text=" + text + " sortBy=" + sortBy + " user=" + user + " selected image=" + image_id);

    let query = `SELECT images.*, 
        (SELECT COUNT(*) from likes
            WHERE likes."liked" = true
            AND likes.image_id = images.image_id) as likes,
        (SELECT COUNT(*) from likes
            WHERE likes.disliked = true
            AND likes.image_id = images.image_id) as dislikes,
        (SELECT COUNT(*) from likes
            WHERE (likes."liked" = true OR likes.disliked = true)
            AND likes.image_id = images.image_id) as controversy
    from images`

    if (image_id !== undefined && image_id !== null) {
        query += ` WHERE image_id = ${image_id}`
    } else {
        if (sortBy === "newest") {
            query += ' ORDER BY image_date DESC';
        } else if (sortBy === "viral") {
            query += ' ORDER BY likes DESC';
        } else if (sortBy === "controversial") {
            query += ' ORDER BY controversy DESC';
        }
    }
    const answer = await pool.query(query);

    const tags = await pool.query('SELECT image_tags.image_id, tags.tag_name from image_tags, tags where image_tags.tag_id = tags.tag_id')
    return { image_rows: answer.rows, tags: tags.rows };
}

async function imagesWithComments() {
    const pool = new Pool(poolConfig)
    const answer = await pool.query('SELECT * from images ORDER BY image_date DESC');
    console.log(answer.rows);
    pool.end()
    return answer.rows;
}

const {
    verifierFactory,
    errors: { JwtVerificationError, JwksNoMatchingKeyError },
} = require('@southlane/cognito-jwt-verifier')


// get a verifier instance. Put your config values here.
const verifier = verifierFactory(verifyConfig)

async function verifyToken2(token) {
    try {
        const tokenPayload = await verifier.verify(token)
        console.log(tokenPayload)
        return true
    } catch (e) {
        if (
            e instanceof JwtVerificationError ||
            e instanceof JwksNoMatchingKeyError
        ) {
            // token is malformed, invalid, expired or cannot be validated with known keys
            // act accordingly, e.g. return HTTP 401 error
        }

        return false
    }
}
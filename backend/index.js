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
    res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
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

// search?
//    text=   search text
//    sortby= newest, controversial, viral
//    user=   username

app.get('/search', async (req, res) => {
    const theList = await search(req.query.text, req.query.sortby, req.query.user);
    const imageList = [];
    for (let i = 0; i < theList.length; ++i) {
        let image = {
            imgURL: url + theList[i].image_object_id,
            title: theList[i].image_title,
            username: theList[i].username,
            likes: theList[i].likes,
            dislikes: theList[i].dislikes
        }
        imageList.push(image);
    }
    res.header("Access-Control-Allow-Origin", "*");
    res.send(imageList)
})

app.post('/addimage', async (req, res) => {
    console.log(req.body);
    console.log(req.headers);

    if (req.body === undefined || req.body === {}) {
        res.header("Access-Control-Allow-Origin", "*");
        res.send("failure")
    }

    const objectId = req.body.objectId;
    const username = req.body.username;
    const caption = req.body.caption;

    const pool = new Pool(poolConfig)
    const queryText = `
        INSERT INTO images (image_title, image_object_id, username, image_date) 
        VALUES ('${caption}', '${objectId}', '${username}', '${new Date().toDateString()}')`
    console.log(queryText);
    const answer = await pool.query(queryText);
    console.log(answer.rows);
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

async function search(text, sortBy, user) {
    //console.log(poolConfig + " " + configTwo);
    console.log("text=" + text + " sortBy=" + sortBy + " user=" + user);
    const pool = new Pool(poolConfig);
    //let query = 'SELECT * from images';
    let query = `SELECT images.*, (
        SELECT COUNT(*) from likes
    WHERE likes."like" = true
    AND likes.image_id = images.image_id) as likes,
        (SELECT COUNT(*) from likes
    WHERE likes.dislike = true
    AND likes.image_id = images.image_id) as dislikes,
        (SELECT COUNT(*) from likes
    WHERE (likes."like" = true OR likes.dislike = true)
    AND likes.image_id = images.image_id) as controversy
    from images`
    if (sortBy === "newest") {
        query += ' ORDER BY image_date DESC';
    } else if (sortBy === "viral") {
        query += ' ORDER BY likes DESC';
    } else if (sortBy === "controversial") {
        query += ' ORDER BY controversy DESC';
    }
    const answer = await pool.query(query);
    pool.end()
    return answer.rows;
}

async function imagesWithComments() {
    const pool = new Pool(poolConfig)
    const answer = await pool.query('SELECT * from images ORDER BY image_date DESC');
    console.log(answer.rows);
    pool.end()
    return answer.rows;
}

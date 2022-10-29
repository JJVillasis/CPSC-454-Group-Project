const express = require('express')
const { configTwo } = import('./config.js')
const app = express()
const port = 3000

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

const AWS = require('aws-sdk');
const {S3Client, ListObjectsV2Command} = require("@aws-sdk/client-s3"); // CommonJS import
//AWS.config.update(config);
//var s3 = new AWS.S3();

const params = {
    Bucket: 'dev-imgur-clone-bucket',
    //Delimiter: '',
    //Prefix: '*'
};

// pages: https://stackoverflow.com/questions/9437581/node-js-amazon-s3-how-to-iterate-through-all-files-in-a-bucket


async function list() {
    const config = {
        credentials: {
            accessKeyId: 'AKIAUVCVY3VWPA6TKYT3',
            secretAccessKey: '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'
        },
        region: 'us-east-1',
    };

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

const {Pool, Client} = require('pg')

async function db() {
    const pool = new Pool({
        user: 'postgres',
        host: 'image-database.c6jtkyis6qkp.us-east-1.rds.amazonaws.com',
        database: 'images',
        password: 'KTrMpsNIhmD8o3UwY150',
        port: 5432,
    })
    const answer = await pool.query('SELECT * from images');
    console.log(answer.rows);
    pool.end()
    return answer.rows;
}

/*const client = new Client({
  user: 'postgres',
  host: 'image-database.c6jtkyis6qkp.us-east-1.rds.amazonaws.com',
  database: 'image-database',
  password: 'KTrMpsNIhmD8o3UwY150',
  port: 5432,
})
client.connect()
client.query('SELECT NOW()', (err, res) => {
  console.log(err, res)
  client.end()
})
*/

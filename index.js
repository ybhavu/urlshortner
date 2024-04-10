const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { connectToMongoDB } = require('./connect');
const { checkForAuthentication, restrictTo} = require('./middlewares/auth');
const URL = require('./models/url');
const multer = require('multer');
const AWS = require('aws-sdk');
const OpenAI = require('openai');
require('dotenv').config();


const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET,
  region: 'ap-south-1'
});

const urlRoute = require('./routes/url');
const staticRouter = require('./routes/staticRouter');
const userRoute = require('./routes/user');

const app = express();
const PORT  = 8001;
connectToMongoDB(process.env.MONGO_URI).then(()=> console.log("MongoDB connected"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());


app.use(checkForAuthentication);




const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const fileName = req.body.filename;
    const fileContent = req.file.buffer;

    const params = {
      Bucket: 'dboxtraining',
      Key: fileName,
      Body: fileContent,
      ACL: 'public-read'
    };

    const data = await s3.upload(params).promise();
    console.log("File uploaded successfully to S3:", data.Location);

    res.redirect('/list');
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    res.status(500).send('Error uploading file to S3');
  }
});

app.delete('/delete/:fileName', async (req, res) => {
  try {
    const fileName = req.params.fileName;

    const params = {
      Bucket: 'dboxtraining',
      Key: fileName
    };

    await s3.deleteObject(params).promise();
    console.log("File deleted successfully from S3");

    res.redirect('/list');
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    res.status(500).send('Error deleting file from S3');
  }
});

app.get('/list', async (req, res) => {
  try {
    const params = {
      Bucket: 'dboxtraining'
    };

    const data = await s3.listObjects(params).promise();
    const fileList = data.Contents.map(obj => obj.Key);
    console.log("Files listed successfully from S3:", fileList);

    res.render('fileList', { files: fileList });
  } catch (error) {
    console.error("Error listing files from S3:", error);
    res.status(500).send('Error listing files from S3');
  }
});




app.use("/url",restrictTo(["NORMAL", "ADMIN"]), urlRoute);
app.use("/user", userRoute);
app.use("/", staticRouter);

app.use('/url/:shortId', async(req,res) => {
    const shortId = req.params.shortId;
    const entry= await URL.findOneAndUpdate({
        shortId
    },
    {
        $push: {
            visitHistory: {
                timestamp: Date.now(),
            },
        },
    });
    res.redirect(entry.redirectURL);
})

app.listen(PORT, () => console.log(`Sever started at PORT: ${PORT}`));



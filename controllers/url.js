const shortid = require("shortid");
const URL = require("../models/url");


const nodemailer = require("nodemailer");

 
const sendMail = async (req, res, shortId) => {
    console.log(req.body);
    try {
   
      let config = {
        service: "gmail",
        auth: {
          user: "ybhavwork1@gmail.com",
          pass: "bwvkpyknzpmxncmw",
        },
      };
   
      const transporter = nodemailer.createTransport(config);
   
      const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>URL SHORTNER</title>
      </head>
      <body>
        <h3>Here is your shortned url for ${req.body.url}:  </h3>
        <a href= "http://localhost:8001/url/${shortId}"> ${shortId}</a>
        
      </body>
      </html>
    `;
   
      let message = {
        from: "ybhavwork1@gmail.com",
  
        to: req.user.email,
        html: htmlContent
      };
   
      const info = await transporter.sendMail(message);
      console.log("Mail sent:", info);
   
      res.send("Mail sent successfully");
   
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).send("Error sending email");
    }
  };





async function handleGenerateNewShortURL (req, res) {
    const body = req.body;
    console.log(req);
    if(!body.url) return res.status(400).json({ error: "URL is required" })
    
    const shortId = shortid();
    console.log(shortId);
    await URL.create({ 
        shortId: shortId,
        redirectURL: body.url,
        visitHistory: [],
        createdBy: req.user._id,
        });
    await sendMail(req,res,shortId);

    return res.render('home', {
        id: shortId,
    });
}

async function handleGetAnalytics(req,res){
    const shortId = req.params.shortId;
    const result = await URL.findOne({ shortId });
    console.log(result);
    return res.json({ totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,})
}

module.exports = {
    handleGenerateNewShortURL,
    handleGetAnalytics,
};
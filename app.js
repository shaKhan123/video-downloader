const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const fs = require('fs')
const youtubedl = require('youtube-dl')

const { check, validationResult } = require('express-validator')

app.set('view engine', 'ejs');
const urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/download', (req, res) => {
  res.render('index', {
    name: 'User'
  });
});

app.post('/download', urlencodedParser, [
  check('url', 'This url must exist')
    .exists()
    .isLength({ min: 3 })
], (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const alert = errors.array()
    res.render('index', {
      alert
    })
  } else {
    let fileName = '';
    const video = youtubedl(req.body.url,
      // Optional arguments passed to youtube-dl.
      ['--format=18'],
      // Additional options can be given for calling `child_process.execFile()`.
      { cwd: __dirname })

    // Will be called when the download starts.
    video.on('info', function (info) {
      console.log('Download started')
      console.log('filename: ' + info._filename)
      console.log('size: ' + info.size)

      fileName =  info._filename;

      res.render('index', {
        message: `${fileName} Downloaded successfuly!!`
      })
    })

   

    youtubedl.getInfo(req.body.url, function(err, info) {
      if (err) throw err
      video.pipe(fs.createWriteStream('video.mp4'))
      fs.rename('video.mp4', `${info._filename}.mp4`, () => { 
        console.log("\nFile Renamed!\n"); 
         
      }); 
    })


  }

});

const server = app.listen(process.env.PORT || 7000, () => {
  console.log(`Express running → PORT ${server.address().port}`);
});



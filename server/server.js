const express = require('express');
const exphbs = require('express-handlebars');
const path = require("path")
const port = process.env.PORT || 3000;
const app = express();

app
    .use(express.static(path.resolve(__dirname, "./public")))
    .set('views', __dirname + "/views")
    .engine('.hbs', exphbs({
        extname: '.hbs'
    }))
    .set('view engine', '.hbs')
    .get("/", (req, res) => {
        res.render("index");
    })
    .get("/secont", (req, res) => {
        res.render("secont");
    })
    .use((req, res, next) => {
        res.sendStatus(404)
    })
    .listen(port, _ => {
        console.log(`Web sitemize ${port} portu üzerinden ulaşabilirsiniz...`);
    });
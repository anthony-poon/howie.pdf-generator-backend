const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors");
const indexRouter = require('./routes');

const app = express();

if (process.env.CORS_ORIGIN) {
    app.use(cors({
        origin: process.env.CORS_ORIGIN
    }))
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const pathPrefix = process.env.PATH_PREFIX ? process.env.PATH_PREFIX : "/";
app.use(pathPrefix, indexRouter);

module.exports = app;

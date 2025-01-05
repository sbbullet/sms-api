const http = require("http");
const express = require("express");
const cors = require("cors");
const { rateLimit } = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    limit: 240, // Limit each IP to 240 requests per minute.
    standardHeaders: "draft-8",
    legacyHeaders: false,
    // store: ... , // We can also use this to store the rate limit data in Redis, Memcached, etc.
});

const app = express();

module.exports = class UserServer {
    constructor({ config, managers }) {
        this.config = config;
        this.userApi = managers.userApi;
    }

    /** for injecting middlewares */
    use(args) {
        app.use(args);
    }

    /** server configs */
    run() {
        // Disabling the X-Powered-By header does not prevent a sophisticated attacker
        // from determining that an app is running Express. It may discourage a casual
        // exploit, but there are other ways to determine an app is running Express.
        app.disable("x-powered-by");
        // Help secure Express apps by setting HTTP response headers.
        app.use(helmet());
        // compress all responses
        app.use(compression());
        // Rate limit the API
        app.use(apiLimiter);

        // Enable CORS for all origins
        // **NOTE**:  Allow only trusted domains in production.
        // We can leverage the options.
        app.use(cors({ origin: "*" }));
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        // Middleware which sanitizes user-supplied data to prevent
        // MongoDB Operator Injection.
        app.use(mongoSanitize());

        // Serve public folder under /static
        app.use("/static", express.static("public"));

        /** an error handler */
        app.use((err, req, res, next) => {
            console.error(err.stack);

            if (
                err instanceof SyntaxError &&
                err.status === 400 &&
                "body" in err &&
                err.type === "entity.parse.failed"
            ) {
                return res.status(400).send("Invalid JSON payload passed");
            }

            res.status(500).send("Something broke!");
        });

        /** a single middleware to handle all */
        app.all("/api/:moduleName/:fnName", this.userApi.mw);
        app.all("/api/:moduleName/:fnName/:context", this.userApi.mw);

        let server = http.createServer(app);
        server.listen(this.config.dotEnv.USER_PORT, () => {
            console.log(
                `${this.config.dotEnv.SERVICE_NAME.toUpperCase()} is running on port: ${this.config.dotEnv.USER_PORT}`,
            );
        });
    }
};

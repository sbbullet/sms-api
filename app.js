const config = require("./config/index.config.js");
// const Cortex = require("ion-cortex");
const ManagersLoader = require("./loaders/ManagersLoader.js");

process.on("uncaughtException", (err) => {
    console.log(`Uncaught Exception:`);
    console.log(err, err.stack);

    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    console.log("Unhandled rejection at ", promise, `reason:`, reason);
    process.exit(1);
});

const mongoDB = config.dotEnv.MONGO_URI
    ? require("./connect/mongo")({
          uri: config.dotEnv.MONGO_URI,
      })
    : null;

// These modules are not utilized in this project so commented out

// const cache = require("./cache/cache.dbh")({
//     prefix: config.dotEnv.CACHE_PREFIX,
//     url: config.dotEnv.CACHE_REDIS,
// });

// const cortex = new Cortex({
//     prefix: config.dotEnv.CORTEX_PREFIX,
//     url: config.dotEnv.CORTEX_REDIS,
//     type: config.dotEnv.CORTEX_TYPE,
//     state: () => {
//         return {};
//     },
//     activeDelay: "50ms",
//     idlDelay: "200ms",
// });

const managersLoader = new ManagersLoader({ config });
const managers = managersLoader.load();

managers.userServer.run();

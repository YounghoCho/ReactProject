/**
 * configuration file for pm2
 */
module.exports = {
  apps: [
    {
      name: "icks_web_server",
      script: "./web/app.js",
      watch: ["./web", "../client/src"],
      ignore_watch: ["./web/node_modules"],
      //node_args: ["--inspect-brk"],
      watch_options: {
        followSymlinks: false
      },
      env: {
        PORT: 3001,
        NODE_ENV: "development"
      },
      env_production: {
        PORT: 8000,
        NODE_ENV: "production"
      }
    },
    {
      name: "icks_api_server",
      script: "./api/app.js",
      watch: ["./api"],
      ignore_watch: ["./api/node_modules"],
      node_args: ["--inspect=3101"],
      watch_options: {
        followSymlinks: false
      },
      env: {
        PORT: 3100,
        NODE_ENV: "development"
      },
      env_production: {
        PORT: 8100,
        NODE_ENV: "production"
      }
    }
  ]
};

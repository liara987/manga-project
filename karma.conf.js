const path = require("path");

if (!process.env.CHROME_BIN) {
  try {
    process.env.CHROME_BIN = require("puppeteer").executablePath();
  } catch {}
}

module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "@angular-devkit/build-angular"],

    plugins: [
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-coverage"),
      require("@angular-devkit/build-angular/plugins/karma"),
    ],

    client: {
      jasmine: {},
      clearContext: false,
    },

    coverageReporter: {
      dir: path.join(__dirname, "./coverage/manga-project"),
      subdir: ".",
      reporters: [{ type: "html" }, { type: "text-summary" }],
    },

    reporters: ["progress"],

    browsers: ["ChromeHeadlessNoSandbox"],

    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: "ChromeHeadless",
        flags: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
      },
    },

    singleRun: true,
    restartOnFileChange: false,
  });
};

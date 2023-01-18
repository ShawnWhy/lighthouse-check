// const lighthouse = require('lighthouse');
// const chromeLauncher = require('chrome-launcher');
// var fs = require('fs'); 
// var urllist = require('./url_medstar')

// // import {urllist} from './url_medstar.js';



// function launchChromeAndRunLighthouse(urls, opts, config = null) {
//   return chromeLauncher.launch({chromeFlags: opts.chromeFlags}).then(chrome => {
//     opts.port = chrome.port;
//     for(let i=0; i<3; i++){
//     return lighthouse(urls[i], opts, config).then(results => {
//       // use results.lhr for the JS-consumable output
//       // https://github.com/GoogleChrome/lighthouse/blob/master/types/lhr.d.ts
//       // use results.report for the HTML/JSON/CSV output as a string
//       // use results.artifacts for the trace/screenshots/other specific case you need (rarer)
//       return chrome.kill().then(() => results.lhr)
//     });
// }
//   });
// }

// const opts = {
//   chromeFlags: ['--show-paint-rects']
// };

// // Usage:

// launchChromeAndRunLighthouse(urllist, opts).then(results => {



// fs.writeFile('mynewfile3.JSON', JSON.stringify(results), 'utf8', function (err) {

    
//   if (err) throw err;
// }); 
//   // Use results!
// });



// Import the required npm packages

// stuff from web
const stringify = require('csv-stringify')
const fs = require("fs");
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");

let columns = {
url : "URL",
Mobile_Performance: 'Mobile_Performance', 
Mobile_Accessibility: 'Mobile_Accessibility',
Mobile_Best_Practices:'Mobile_Accessibility', 
Mobile_SEO:'Mobile_SEO', 
Desktop_Performance: 'desktop_performance', 
Desktop_Accessibility: 'desktop_Accessibility',
 Desktop_Best_Practices: 'Desktop_best_practice', 
 Desktop_SEO:'Desktop_SEO'
}
// Read the csv file and store the
// urls in an array
// var array = fs.readFileSync("URLs.csv")
//                 .toString().split("\n");
var array = require('./url_medstar')

// Declare a resultant array to store 
// the generated scores and initialize
// it with headings
let result = [];
fs.appendFileSync("rowstuff.csv", " URL, Mobile_Performance, Mobile_Accessibility, Mobile_Best_Practices, Mobile_SEO, Desktop_Performance, Desktop_Accessibility, Desktop_Best_Practices, Desktop_SEO"
);
  
// The async await is used to ensure 
// non-blocking code execution 
(async () => {
  const chrome = await chromeLauncher
    .launch({ chromeFlags: ["--headless"] })
  
  // Declaring an object to specify score 
  // for what audits, categories and type
  // of output that needs to be generated 
  const options = {
    logLevel: "info",
    output: "csv",
    onlyCategories: ["performance", 
      "accessibility", "best-practices", "seo"],
    audits: [
      "first-meaningful-paint",
      "first-cpu-idle",
      "byte-efficiency/uses-optimized-images",
    ],
    port: chrome.port,
  };
  
  // Traversing through each URL 
  for (i in array) {

    let row ;
  
    // Separate strategy for Mobile
    // and Desktop view
    for (let x = 0; x < 2; x++) {
      let configuration = "";
  
      if (x == 0) options.strategy = "mobile";
      else options.strategy = "desktop";
  
      const runnerResult = 
        await lighthouse(array[i], options);
  
      // Current report
      const reportCsv = runnerResult.report;
  
      // URL to be put only for first iteration 
      // (mobile and not separately for desktop)
      if (x == 0) {
        row += "\n";
        row += runnerResult.lhr.finalUrl + ',';
      }
  
      // If score can't be determined, NA is 
      // put in the corresponding field.   
      if (runnerResult.lhr.categories.performance.score) {
        row += runnerResult.lhr
              .categories.performance.score * 100 + ','
      } else {
        row += "NA ," 
      }
  
      if (runnerResult.lhr.categories.accessibility.score) {
        row += runnerResult.lhr
              .categories.accessibility.score * 100+ ','
      } else {
        row += "NA ," ;
      }
  
      if (runnerResult.lhr.categories["best-practices"].score) {
        row += runnerResult.lhr
            .categories["best-practices"].score * 100+ ','
      } else {
        row += "NA";
      }
  
      if (runnerResult.lhr.categories.seo.score) {
        row += runnerResult.lhr
              .categories.seo.score * 100+ ','
      } else {
        row += "NA" ;
      }
      if(x==1){fs.appendFileSync("rowstuff.csv", row);
     } 
    }
  }
  
  // Append the result in a report.csv 
  // file and end the program
  
  await chrome.kill();
})();
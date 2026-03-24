const fs = require("fs");
const csv = require("csv-parser");

const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    const stream = fs.createReadStream(filePath);

    stream
      .pipe(csv())
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};

module.exports = parseCSV;

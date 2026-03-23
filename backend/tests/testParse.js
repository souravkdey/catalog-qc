const path = require("path");
const parseCSV = require("../utils/parseCSV");

(async () => {
  try {
    const filePath = path.join(__dirname, "sample.csv");
    const data = await parseCSV(filePath);
    console.log(data);
  } catch (err) {
    console.error(err);
  }
})();

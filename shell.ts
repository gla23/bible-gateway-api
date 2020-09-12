import BibleGatewayAPI from "./src/index";

// Run with: npx ts-node shell.ts "mat 5:4"
new BibleGatewayAPI()
  .search(process.argv[2], "ESV")
  .then((data) => console.log(data));

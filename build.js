const fs = require("fs-extra");
const path = require("path");
const pretty = require("pretty");

// https://www.notion.so/Notion-to-Static-HTML-Demo-07c2507058234b17a534fbd07c52bf1b

const files = fs.readdirSync(__dirname);
const exportDirName = files.find((file) => file.startsWith("Export"));
const exportDir = path.join(__dirname, exportDirName);

const exportFiles = fs.readdirSync(exportDir);
const [assetsDir, htmlFile] = exportFiles;

let htmlContents = fs.readFileSync(path.join(exportDir, htmlFile), "utf8");
htmlContents = pretty(htmlContents);

// Remove indentation.
htmlContents = flatten(htmlContents);

htmlContents = htmlContents.replace(
  "<head><meta",
  `<head><meta name="viewport" content="width=device-width, initial-scale=1"><meta`
);

// Remove CSS.
htmlContents =
  htmlContents.substring(0, htmlContents.indexOf("<style>")) +
  `<link rel="stylesheet" href="style.css">` +
  htmlContents.substring(htmlContents.indexOf("</style>") + 8);

htmlContents = htmlContents
  .split("<nav ")
  .join(`<div `)
  .split("</nav>")
  .join("</div>");

// Open links in a new tab, but not the table of contents (which is <a class=)
htmlContents = htmlContents.split("<a href=").join(`<a target="_blank" href=`);

// Page width.
htmlContents = htmlContents.split("max-width: 900px;").join(`max-width: 46em;`);

// Toggles default closed
htmlContents = htmlContents.split(' open=""').join("");

// Rename assets directory.
htmlContents = htmlContents.split(encodeURIComponent(assetsDir)).join("assets");

fs.writeFileSync(
  path.join(__dirname, "index.html"),
  pretty(htmlContents),
  "utf8"
);

fs.copySync(path.join(exportDir, assetsDir), path.join(__dirname, "assets"), {
  overwrite: true,
});

function flatten(str) {
  return str
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

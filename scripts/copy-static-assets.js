const { cp, mkdir, rm } = require("node:fs/promises");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const outputRoot = path.join(projectRoot, "dist");

async function copyDirectory(directory) {
    const source = path.join(projectRoot, directory);
    const destination = path.join(outputRoot, directory);

    await rm(destination, { recursive: true, force: true });
    await mkdir(outputRoot, { recursive: true });
    await cp(source, destination, { recursive: true });
}

Promise.all([copyDirectory("data"), copyDirectory("pages")]).catch((error) => {
    console.error("Unable to copy runtime assets:", error);
    process.exitCode = 1;
});

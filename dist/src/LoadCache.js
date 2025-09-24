"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DootFileSystem = void 0;
exports.fetchFiles = fetchFiles;
const cacheFiles = [
    { name: "step-vk-doot-getprices", type: "string" },
    { name: "step-vk-doot-initbase", type: "string" },
    { name: "step-vk-doot-settle", type: "string" },
    { name: "step-vk-doot-update", type: "string" },
    { name: "step-vk-doot-verify", type: "string" },
    { name: "wrap-vk-doot", type: "string" },
];
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function getHeaderData(filename) {
    const filePath = path_1.default.join(process.cwd(), "src", "constants", "cache", `${filename}.header`);
    return fs_1.default.readFileSync(filePath, "utf8");
}
function getFileData(filename) {
    const filePath = path_1.default.join(process.cwd(), "src", "constants", "cache", filename);
    return fs_1.default.readFileSync(filePath, "utf8");
}
async function fetchFiles() {
    return Promise.all(cacheFiles.map(async (file) => {
        const header = getHeaderData(file.name);
        const data = getFileData(file.name);
        return { file, header, data };
    })).then((cacheList) => cacheList.reduce((acc, { file, header, data }) => {
        acc[file.name] = { file, header, data };
        return acc;
    }, {}));
}
const DootFileSystem = (files) => ({
    read({ persistentId, uniqueId, dataType }) {
        // read current uniqueId, return data if it matches
        if (!files[persistentId]) {
            return undefined;
        }
        const currentId = files[persistentId].header;
        if (currentId !== uniqueId) {
            return undefined;
        }
        if (dataType === "string") {
            return new TextEncoder().encode(files[persistentId].data);
        }
        return undefined;
    },
    write({ persistentId, uniqueId, dataType }, data) { },
    canWrite: true,
});
exports.DootFileSystem = DootFileSystem;

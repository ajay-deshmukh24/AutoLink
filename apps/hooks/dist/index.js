"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("@repo/db");
const client = new db_1.PrismaClient();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post("/hooks/catch/:userId/:zapId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = req.params.userId;
    const zapId = req.params.zapId;
    const body = req.body;
    // Extract and parse GitHub comment if it exists
    let parsedMetadata = body;
    const commentBody = (_a = body === null || body === void 0 ? void 0 : body.comment) === null || _a === void 0 ? void 0 : _a.body;
    if (commentBody) {
        const lines = commentBody.split("\n");
        const commentMetadata = {};
        lines.forEach((line) => {
            const [key, ...rest] = line.split(":");
            if (key && rest.length > 0) {
                commentMetadata[key.trim()] = rest.join(":").trim();
            }
        });
        parsedMetadata = {
            comment: commentMetadata,
        };
    }
    // Store parsed metadata to DB
    yield client.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const run = yield tx.zapRun.create({
            data: {
                zapId: zapId,
                metadata: parsedMetadata,
            },
        });
        yield tx.zapRunOutbox.create({
            data: {
                zapRunId: run.id,
            },
        });
    }));
    res.json({
        message: "Webhook received and parsed",
    });
}));
app.listen(3002);

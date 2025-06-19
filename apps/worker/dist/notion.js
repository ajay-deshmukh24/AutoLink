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
exports.handleNotionAction = handleNotionAction;
const client_1 = require("@notionhq/client");
const db_1 = require("@repo/db");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prismaClient = new db_1.PrismaClient();
const notion = new client_1.Client({ auth: process.env.NOTION_SECRET });
function handleNotionAction(zapRunDetails, runInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const zapId = zapRunDetails.zap.id;
        const zapName = zapRunDetails.zap.name || `Zap-${zapId}`;
        const dbKey = `notionDbId_${zapId}`;
        let dbId = (_a = zapRunDetails.metadata) === null || _a === void 0 ? void 0 : _a[dbKey];
        // Create database if not exists
        if (!dbId) {
            const db = yield notion.databases.create({
                parent: {
                    type: "page_id",
                    page_id: process.env.NOTION_PARENT_PAGE_ID,
                },
                title: [{ type: "text", text: { content: zapName } }],
                properties: {
                    Name: {
                        title: {},
                    },
                    Timestamp: { type: "date", date: {} },
                    "Email Status": {
                        type: "select",
                        select: {
                            options: [
                                { name: "Sent", color: "green" },
                                { name: "Not Sent", color: "red" },
                            ],
                        },
                    },
                    "SOL Status": {
                        type: "select",
                        select: {
                            options: [
                                { name: "Transferred", color: "green" },
                                { name: "Not Transferred", color: "red" },
                            ],
                        },
                    },
                    "Overall Status": {
                        type: "select",
                        select: {
                            options: [
                                { name: "Success", color: "green" },
                                { name: "Partial", color: "yellow" },
                                { name: "Failed", color: "red" },
                            ],
                        },
                    },
                },
            });
            dbId = db.id;
            yield prismaClient.zapRun.update({
                where: { id: runInfo.zapRunId },
                data: {
                    metadata: Object.assign(Object.assign({}, ((_b = zapRunDetails.metadata) !== null && _b !== void 0 ? _b : {})), { [dbKey]: dbId }),
                },
            });
        }
        // Prepare the row values based on runInfo
        const emailStatus = runInfo.emailSent ? "Sent" : "Not Sent";
        const solStatus = runInfo.solSent ? "Transferred" : "Not Transferred";
        let overall;
        if (runInfo.emailSent && runInfo.solSent) {
            overall = "Success";
        }
        else if (runInfo.emailSent || runInfo.solSent) {
            overall = "Partial";
        }
        else {
            overall = "Failed";
        }
        // Add log row
        yield notion.pages.create({
            parent: { database_id: dbId },
            properties: {
                Name: {
                    title: [
                        {
                            type: "text",
                            text: {
                                content: `ZapRun ${runInfo.zapRunId.substring(0, 6)}...`,
                            },
                        },
                    ],
                },
                Timestamp: {
                    date: { start: new Date().toISOString() },
                },
                "Email Status": {
                    select: { name: emailStatus },
                },
                "SOL Status": {
                    select: { name: solStatus },
                },
                "Overall Status": {
                    select: { name: overall },
                },
            },
        });
    });
}

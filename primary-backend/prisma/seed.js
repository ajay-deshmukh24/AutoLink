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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prismaClient = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield prismaClient.availableTriggers.create({
            data: {
                id: "webhook",
                name: "Webhook",
                image: "https://cdn.iconscout.com/icon/free/png-256/free-webhooks-icon-download-in-svg-png-gif-file-formats--brand-company-logo-world-logos-vol-3-pack-icons-282425.png",
            },
        });
        yield prismaClient.availableAction.create({
            data: {
                id: "send-sol",
                name: "Send Solana",
                image: "https://s3.coinmarketcap.com/static-gravity/image/5cc0b99a8dd84fbfa4e150d84b5531f2.png",
            },
        });
        yield prismaClient.availableAction.create({
            data: {
                id: "email",
                name: "Send Email",
                image: "https://cdn.pixabay.com/photo/2016/01/26/17/15/gmail-1162901_1280.png",
            },
        });
    });
}
main();

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.prismaClient = void 0;
const client_1 = require("@prisma/client");
exports.prismaClient = new client_1.PrismaClient();
exports.prisma = client_1.Prisma;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.prismaClient = void 0;
const db_1 = require("@repo/db");
exports.prismaClient = new db_1.PrismaClient();
exports.prisma = db_1.Prisma;

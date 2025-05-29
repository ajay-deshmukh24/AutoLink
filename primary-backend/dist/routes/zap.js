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
exports.zapRouter = void 0;
const express_1 = require("express");
const middleware_1 = require("../middleware");
const types_1 = require("../types");
const db_1 = require("../db");
const router = (0, express_1.Router)();
router.post("/", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("create a zap");
    // @ts-ignore
    const id = req.id;
    const body = req.body;
    const parsedData = types_1.ZapCreateSchema.safeParse(body);
    if (!parsedData.success) {
        res.status(411).json({
            message: "Incorrect inputs",
        });
    }
    const zapId = yield db_1.prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const zap = yield tx.zap.create({
            data: {
                userId: id,
                triggerId: "",
                actions: {
                    create: (_a = parsedData.data) === null || _a === void 0 ? void 0 : _a.actions.map((x, index) => ({
                        actionId: x.availableActionId,
                        sortingOrder: index,
                        metadata: x.actionMetadata,
                    })),
                },
            },
        });
        const trigger = yield tx.trigger.create({
            // @ts-ignore
            data: {
                triggerId: (_b = parsedData.data) === null || _b === void 0 ? void 0 : _b.availableTriggerId,
                zapId: zap.id,
            },
        });
        yield tx.zap.update({
            where: {
                id: zap.id,
            },
            data: {
                triggerId: trigger.id,
            },
        });
        return zap.id;
    }));
    res.json({
        zapId,
    });
}));
router.get("/", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("get user zaps");
    // @ts-ignore
    const id = req.id;
    const zaps = yield db_1.prismaClient.zap.findMany({
        where: {
            userId: id,
        },
        include: {
            actions: {
                include: {
                    type: true,
                },
            },
            trigger: {
                include: {
                    type: true,
                },
            },
        },
    });
    res.json({
        zaps,
    });
}));
router.get("/:zapId", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("get user specific zap");
    // @ts-ignore
    const id = req.id;
    const zapId = req.params.zapId;
    const zap = yield db_1.prismaClient.zap.findFirst({
        where: {
            id: zapId,
            userId: id,
        },
        include: {
            actions: {
                include: {
                    type: true,
                },
            },
            trigger: {
                include: {
                    type: true,
                },
            },
        },
    });
    res.json({
        zap,
    });
}));
router.delete("/:zapId", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("reached in delete route s-1");
    // console.log(req.body);
    // @ts-ignore
    const userId = req.id;
    const zapId = req.params.zapId;
    try {
        // Make sure the zap belongs to the logged-in user
        const zap = yield db_1.prismaClient.zap.findFirst({
            where: {
                id: zapId,
                userId,
            },
        });
        console.log("zap deleted successfully\n", zap);
        if (!zap) {
            res.status(404).json({ message: "Zap not found" });
        }
        // Delete the zap (cascades will handle trigger, actions, zapRuns, zapRunOutbox)
        yield db_1.prismaClient.zap.delete({
            where: {
                id: zapId,
            },
        });
        res.json({ message: "Zap deleted successfully" });
    }
    catch (error) {
        console.error("Delete zap error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
}));
exports.zapRouter = router;

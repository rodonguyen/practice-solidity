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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ethers_1 = require("ethers");
var fs = require("fs-extra");
require("dotenv/config");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var url, provider, encryptedJson, password, wallet, abi, binary, contractFactory, overrides, contract, deploymentReceipt, currentFavNumber, transactionResponse, transactionReceipt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = process.env.RPC_URL;
                    provider = new ethers_1.ethers.providers.JsonRpcProvider(url);
                    encryptedJson = fs.readFileSync('.encryptedKey.json', 'utf8');
                    password = process.env.PRIVATE_KEY_PASSWORD || '';
                    wallet = ethers_1.ethers.Wallet.fromEncryptedJsonSync(encryptedJson, password);
                    return [4 /*yield*/, wallet.connect(provider)];
                case 1:
                    wallet = _a.sent();
                    abi = fs.readFileSync('./SimpleStorage_sol_SimpleStorage.abi', 'utf8');
                    binary = fs.readFileSync('./SimpleStorage_sol_SimpleStorage.bin', 'utf8');
                    contractFactory = new ethers_1.ethers.ContractFactory(abi, binary, wallet);
                    overrides = {
                        gasPrice: 10000000000,
                        gasLimit: 6721975, // Use the same gasLimit as read from Ganache
                    };
                    console.log('Deploying.....');
                    return [4 /*yield*/, contractFactory.deploy(overrides)];
                case 2:
                    contract = _a.sent();
                    return [4 /*yield*/, contract.deployTransaction.wait(1)];
                case 3:
                    deploymentReceipt = _a.sent();
                    // console.log(`\nAll contract info:`);
                    // console.log(contract);
                    console.log("Contract deployed to ".concat(contract.address));
                    return [4 /*yield*/, contract.retrieve()];
                case 4:
                    currentFavNumber = _a.sent();
                    console.log("currentFavNumber: ".concat(currentFavNumber.toString()));
                    return [4 /*yield*/, contract.store('7')];
                case 5:
                    transactionResponse = _a.sent();
                    return [4 /*yield*/, transactionResponse.wait(1)];
                case 6:
                    transactionReceipt = _a.sent();
                    return [4 /*yield*/, contract.retrieve()];
                case 7:
                    currentFavNumber = _a.sent();
                    console.log("currentFavNumber: ".concat(currentFavNumber.toString()));
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .then(function () { return process.exit(0); })
    .catch(function (error) {
    console.error(error);
    process.exit(1);
});

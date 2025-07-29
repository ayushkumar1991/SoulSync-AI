"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.functions = exports.inngest = void 0;
const inngest_1 = require("inngest");
// Initialize the Inngest client
exports.inngest = new inngest_1.Inngest({
    id: "ai-therapy-agent",
    // You can add your Inngest signing key here if you have one
    eventKey: "Smzg-08plP_p4P1T9R6UA00_gbW4eDi8B-Ay_F6DCB5OYIWqHcAMbGLNRVgLCCJDS3YFth0D3_P3FzPO4vpl0w",
});
// Export the functions array (this will be populated by the functions.ts file)
exports.functions = [];

const { queue_blockchain } = require("../queue");

// src/services/userService.js
const users = []; // This is just an in-memory array for demo purposes

const getAllUsers = async () => {
    // Simulate DB call
    return users;
};

const createUser = async (userData) => {
    // Simulate DB insertion
    await queue_blockchain.add(
        "createCrimeJob",
        { recordIdHash: cRecordIdHash, recordMetaHash: cRecordMetaHash },
        { priority: 0 },
      );
};

module.exports = {
    getAllUsers,
    createUser,
};

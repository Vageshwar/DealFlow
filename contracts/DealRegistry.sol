// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DealRegistry {
    struct LogEntry {
        string docId;
        string user;
        string action;
        string docHash;
        uint256 timestamp;
    }

    LogEntry[] public logs;

    event LogAppended(string indexed docId, uint256 indexed index, string user, string docHash);

    function appendLog(string memory _docId, string memory _user, string memory _action, string memory _docHash) public {
        logs.push(LogEntry({
            docId: _docId,
            user: _user,
            action: _action,
            docHash: _docHash,
            timestamp: block.timestamp
        }));

        emit LogAppended(_docId, logs.length - 1, _user, _docHash);
    }

    function getLogsCount() public view returns (uint256) {
        return logs.length;
    }
}

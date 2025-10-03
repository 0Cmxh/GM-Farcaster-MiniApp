// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GM Celo Contract
 * @dev A contract for unlimited "Good Morning" messages on Celo with streak tracking - NO TIME RESTRICTIONS
 * @author GM MiniApp Team
 */
contract GMCelo {
    // Events
    event GMSent(address indexed user, uint256 timestamp, uint256 streak);
    event StreakBroken(address indexed user, uint256 previousStreak);
    event NewUser(address indexed user);

    // Structs
    struct UserData {
        uint256 currentStreak;      // Current consecutive days
        uint256 longestStreak;      // Best streak ever
        uint256 totalGMs;           // Total GMs sent
        uint256 lastGMTimestamp;    // When last GM was sent
        uint256 lastGMDay;          // Day number of last GM
        bool isRegistered;          // Has user ever sent GM
    }

    // State variables
    mapping(address => UserData) public users;
    mapping(uint256 => uint256) public dailyGMCount; // day => count of GMs
    address[] public allUsers;

    uint256 public totalUsers;
    uint256 public totalGMs;
    uint256 public constant SECONDS_PER_DAY = 86400;

    /**
     * @dev Main function to send GM - NO TIME RESTRICTIONS
     * Can be called unlimited times without waiting
     */
    function sendGM() external {
        UserData storage user = users[msg.sender];
        uint256 currentDay = getCurrentDay();

        // Register new user
        if (!user.isRegistered) {
            user.isRegistered = true;
            allUsers.push(msg.sender);
            totalUsers++;
            emit NewUser(msg.sender);
        }

        // Calculate streak (same logic as Base contract)
        uint256 yesterday = currentDay > 0 ? currentDay - 1 : 0;

        if (user.totalGMs == 0) {
            // First GM ever
            user.currentStreak = 1;
        } else if (user.lastGMDay == yesterday) {
            // Continuing streak from yesterday
            user.currentStreak++;
        } else if (user.lastGMDay < yesterday) {
            // Streak broken - reset to 1
            if (user.currentStreak > 0) {
                emit StreakBroken(msg.sender, user.currentStreak);
            }
            user.currentStreak = 1;
        }
        // If lastGMDay == currentDay, streak stays the same (multiple GMs same day)

        // Update longest streak
        if (user.currentStreak > user.longestStreak) {
            user.longestStreak = user.currentStreak;
        }

        // Update user data
        user.totalGMs++;
        user.lastGMTimestamp = block.timestamp;
        user.lastGMDay = currentDay;

        // Update global stats
        totalGMs++;
        dailyGMCount[currentDay]++;

        emit GMSent(msg.sender, block.timestamp, user.currentStreak);
    }

    /**
     * @dev Get complete user data
     */
    function getUserData(address _user) external view returns (
        uint256 currentStreak,
        uint256 longestStreak,
        uint256 userTotalGMs,
        uint256 lastGMTimestamp,
        bool canGMToday,
        bool isRegistered
    ) {
        UserData memory user = users[_user];

        return (
            user.currentStreak,
            user.longestStreak,
            user.totalGMs,
            user.lastGMTimestamp,
            true, // Always can GM on Celo
            user.isRegistered
        );
    }

    /**
     * @dev Check if user has sent GM today
     */
    function hasGMdToday(address _user) external view returns (bool) {
        return users[_user].lastGMDay == getCurrentDay();
    }

    /**
     * @dev Check if user can send GM with reason (always true for Celo)
     */
    function canUserGM(address) external pure returns (bool canGM, string memory reason) {
        return (true, "Ready to GM on Celo!");
    }

    /**
     * @dev Get leaderboard data - FIXED VERSION
     * Returns users sorted by current streak (descending), then by total GMs
     */
    function getTopUsers(uint256 limit) external view returns (
        address[] memory addresses,
        uint256[] memory streaks,
        uint256[] memory totalGMCounts
    ) {
        require(limit > 0 && limit <= 50, "Limit must be 1-50");

        // Create arrays to hold all valid users
        address[] memory tempAddresses = new address[](totalUsers);
        uint256[] memory tempStreaks = new uint256[](totalUsers);
        uint256[] memory tempTotalGMs = new uint256[](totalUsers);

        uint256 validCount = 0;

        // Collect all registered users with valid data
        for (uint256 i = 0; i < allUsers.length; i++) {
            address userAddr = allUsers[i];

            if (userAddr != address(0) && users[userAddr].isRegistered) {
                UserData memory userData = users[userAddr];

                tempAddresses[validCount] = userAddr;
                tempStreaks[validCount] = userData.currentStreak;
                tempTotalGMs[validCount] = userData.totalGMs;
                validCount++;
            }
        }

        // Sort by streak (descending), then by total GMs (descending)
        for (uint256 i = 0; i < validCount - 1; i++) {
            for (uint256 j = i + 1; j < validCount; j++) {
                bool shouldSwap = false;

                if (tempStreaks[i] < tempStreaks[j]) {
                    shouldSwap = true;
                } else if (tempStreaks[i] == tempStreaks[j] && tempTotalGMs[i] < tempTotalGMs[j]) {
                    shouldSwap = true;
                }

                if (shouldSwap) {
                    // Swap addresses
                    address tempAddr = tempAddresses[i];
                    tempAddresses[i] = tempAddresses[j];
                    tempAddresses[j] = tempAddr;

                    // Swap streaks
                    uint256 tempStreak = tempStreaks[i];
                    tempStreaks[i] = tempStreaks[j];
                    tempStreaks[j] = tempStreak;

                    // Swap total GMs
                    uint256 tempTotal = tempTotalGMs[i];
                    tempTotalGMs[i] = tempTotalGMs[j];
                    tempTotalGMs[j] = tempTotal;
                }
            }
        }

        // Return only the requested number of users
        uint256 returnCount = limit > validCount ? validCount : limit;

        addresses = new address[](returnCount);
        streaks = new uint256[](returnCount);
        totalGMCounts = new uint256[](returnCount);

        for (uint256 i = 0; i < returnCount; i++) {
            addresses[i] = tempAddresses[i];
            streaks[i] = tempStreaks[i];
            totalGMCounts[i] = tempTotalGMs[i];
        }

        return (addresses, streaks, totalGMCounts);
    }

    /**
     * @dev Get global statistics
     */
    function getGlobalStats() external view returns (
        uint256 _totalUsers,
        uint256 _totalGMs,
        uint256 _todaysGMs,
        uint256 _currentDay
    ) {
        uint256 currentDay = getCurrentDay();

        return (
            totalUsers,
            totalGMs,
            dailyGMCount[currentDay],
            currentDay
        );
    }

    /**
     * @dev Get current day number (days since Unix epoch)
     */
    function getCurrentDay() public view returns (uint256) {
        return block.timestamp / SECONDS_PER_DAY;
    }

    /**
     * @dev Get today's GM count
     */
    function getTodaysGMCount() external view returns (uint256) {
        return dailyGMCount[getCurrentDay()];
    }

    /**
     * @dev Get GM count for specific day
     */
    function getDailyGMCount(uint256 day) external view returns (uint256) {
        return dailyGMCount[day];
    }

    /**
     * @dev Get total number of registered users
     */
    function getTotalUsers() external view returns (uint256) {
        return totalUsers;
    }

    /**
     * @dev Get user by index (for iterating)
     */
    function getUserByIndex(uint256 index) external view returns (address) {
        require(index < allUsers.length, "Index out of bounds");
        return allUsers[index];
    }

    /**
     * @dev Get GM message for display
     */
    function getGMMessage() external pure returns (string memory) {
        return "Good Morning Celo! Have an amazing day!";
    }

    /**
     * @dev Check if address is a registered user
     */
    function isRegisteredUser(address _user) external view returns (bool) {
        return users[_user].isRegistered;
    }

    /**
     * @dev Get user's rank (simplified - position in array)
     * In production, implement proper ranking
     */
    function getUserRank(address _user) external view returns (uint256) {
        if (!users[_user].isRegistered) {
            return 0; // Unregistered
        }

        for (uint256 i = 0; i < allUsers.length; i++) {
            if (allUsers[i] == _user) {
                return i + 1; // 1-based ranking
            }
        }

        return 0;
    }

    /**
     * @dev Emergency function to get contract info
     */
    function getContractInfo() external pure returns (
        string memory name,
        string memory version,
        string memory description
    ) {
        return (
            "GM Celo Contract",
            "1.0.0",
            "Unlimited Good Morning messages on Celo - No time restrictions"
        );
    }
}
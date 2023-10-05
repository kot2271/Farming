//SPDX-License-Identifier: Unlicense
pragma solidity =0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Farming {

    using SafeERC20 for IERC20Metadata;
    using SafeMath for uint256;

    /**
     * number of users
     */
    uint256 public numUsers;

    enum FarmingState {NotInitialized, Active, Expired}

    // uint256 public constant HUNDRED_PERCENT = 10_000; // 100.00%

    address public owner;

    /**
     * LP token
     */
    IERC20Metadata public stakingToken;

    /**
     * token A or erc20
     */
    IERC20Metadata public rewardToken;

    uint256 public totalRewardAmount;

    uint256 public rewardPercentage;

    uint256 public startTime;

    uint256 public epochLengthInSeconds;

    uint256 public numberOfEpochs;

    // bool public initialized;

    mapping (address => UserInfo) public users;
    mapping (address => uint256) public userIndexes;

    FarmingState public state;

    event Deposited(address addr, uint256 amount);
    event Withdraw(address addr, uint256 amount);
    event RewardClaimed(address addr, uint256 amount);

    struct UserInfo {
        uint256 stakedAmount;
        uint256 rewardEarned;
        uint256 lastInteraction;
    }

    constructor(address _stakingToken, address _rewardToken) {
        owner = msg.sender;
        stakingToken = IERC20Metadata(_stakingToken);
        rewardToken = IERC20Metadata(_rewardToken);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not an owner");
        _;
    }

    /**
     * sets state to Active
     */
    function initializeFarming() external onlyOwner {
        require(state == FarmingState.NotInitialized, "Already initialized");
        state = FarmingState.Active;
    }

    /**
     * transmits and stores the reward token
     */
    function setRewardToken(uint256 amount) external onlyOwner {
    rewardToken.safeTransferFrom(msg.sender, address(this), amount);
    }

    /**
     * sets parameters such as percentages, epoch information, etc.
     * Input parameter validation:
     * _totalRewardAmount - 1000 LP tokens, so 1000 * 10^18 (since an LP token has 18 decimal places)
     * _rewardPercentage - 10% per month, so 10% * 100 (since the contract uses 10000 for 100%) = 1000
     * _epochLengthInSeconds -  is 1 month, i.e. 30 days. In Solidity, 30 days is 30 * 24 * 60 * 60 = 2592000 seconds. This is the value that is passed in.
     * _numberOfEpochs - the number of epochs is equal to the term of farming in months, i.e. 3 months.
     * _startTime - farming start time, i.e. the current time of the blockchain block.timestamp
     */
    function configureFarmingParameters(
        uint256 _totalRewardAmount,
        uint256 _rewardPercentage,
        uint256 _epochLengthInSeconds,
        uint256 _numberOfEpochs,
        uint256 _startTime
    ) external onlyOwner {
        require(_totalRewardAmount == 1000, "Invalid reward amount");
        require(_rewardPercentage == 1000, "Invalid reward percentage");
        require(_epochLengthInSeconds == 2592000, "Invalid epoch length");
        require(_numberOfEpochs == 3, "Invalid number of epochs");
        require(_startTime > block.timestamp, "Start time must be in future");

        totalRewardAmount = _totalRewardAmount;
        rewardPercentage = _rewardPercentage;
        epochLengthInSeconds = _epochLengthInSeconds;
        numberOfEpochs = _numberOfEpochs;
        startTime = _startTime;
    }

    function deposit(uint256 amount) external {
        require(state == FarmingState.Active, "Not active");
        require(amount > 0, "Invalid amount");

        users[msg.sender].stakedAmount = users[msg.sender].stakedAmount.add(amount);
        users[msg.sender].lastInteraction = block.timestamp;

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Deposited(msg.sender, amount);

        _updateReward(msg.sender);
    }

    function withdraw(uint256 amount) external {
        require(state == FarmingState.Active, "Not active");
        require(amount > 0, "Invalid amount");

        users[msg.sender].stakedAmount = users[msg.sender].stakedAmount.sub(amount);
        users[msg.sender].lastInteraction = block.timestamp;

        stakingToken.safeTransfer(msg.sender, amount);

        emit Withdraw(msg.sender, amount);

        _updateReward(msg.sender);
    }

    function claimReward() external {
    require(state == FarmingState.Active, "Not active");
    
    uint256 reward = users[msg.sender].rewardEarned;
    users[msg.sender].rewardEarned = 0;

    rewardToken.safeTransfer(msg.sender, reward);

    emit RewardClaimed(msg.sender, reward);
    }

    /**
     * uses a private internal function to calculate and update user rewards for each interaction
     */
    function _updateReward(address user) internal {
        if(block.timestamp > startTime) {
            uint256 epochsPassed = (block.timestamp - startTime) / epochLengthInSeconds;

            if (epochsPassed > users[user].lastInteraction) {
                uint256 reward = calculateRewardForUser(user);
                users[user].rewardEarned += reward;
            }
        }
    }

    function calculateRewardForUser(address user) public view returns (uint256) {
        uint256 epochsSinceLast = (block.timestamp - users[user].lastInteraction) / epochLengthInSeconds;
        uint256 rewardPerEpoch = totalRewardAmount * rewardPercentage / 10000 / numberOfEpochs;
        return users[user].stakedAmount * epochsSinceLast * rewardPerEpoch / totalStaked();
    }

    function totalStaked() public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < numUsers; i++) {
        address user = getUserAddress(i);
        total += users[user].stakedAmount;
        }
        return total;
    }

    function addUser(address newUser) public {
    require(userIndexes[newUser] == 0, "User already exists");
    users[newUser] = UserInfo({
    stakedAmount: 0,
    rewardEarned: 0,
    lastInteraction: 0
    });
    userIndexes[newUser] = numUsers;
    numUsers++;
    }

    function getUserAddress(uint256 index) pure public returns (address) {
    return address(uint160(index)); 
    }
}

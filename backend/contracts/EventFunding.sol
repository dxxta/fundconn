// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract EventFunding {
    event ProjectCreated(address indexed from, uint256 projectId);
    event NewFunder(address indexed from, address to);

    struct Fund {
        address owner;
        uint256 amount;
        string message;
        uint256 date;
    }

    struct Project {
        uint256 id;
        address owner;
        string title;
        string description;
        string content;
        uint256 goals;
        uint256 date;
        uint256 deadline;
        uint256 amount;
        string image;
        Fund[] funds;
        bool is_over_goals;
        bool is_zero_allowed;
    }

    mapping(uint256 => Project) private projects_data;
    uint256[] private projects;

    mapping(address => bool) private status_accounts;
    address[] private accounts;

    function generateId() private view returns (uint256) {
        uint256 randomHash = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        );
        return uint256(randomHash % (10 ** 20));
    }

    function checkUser(address sender) private {
        if (!status_accounts[sender]) {
            status_accounts[sender] = true;
            accounts.push(sender);
        }
    }

    function newProject(
        string memory title,
        string memory description,
        uint256 goals,
        uint256 deadline,
        uint256 date,
        string memory image,
        string memory content,
        bool is_over_goals,
        bool is_zero_allowed
    ) public returns (uint256) {
        uint256 id = generateId();
        Project storage project = projects_data[id];

        require(
            project.deadline < block.timestamp,
            "Deadline should be in the future."
        );

        project.id = id;
        project.owner = msg.sender;
        project.title = title;
        project.description = description;
        project.content = content;
        project.goals = goals;
        project.date = date;
        project.deadline = deadline;
        project.amount = 0;
        project.image = image;
        project.is_over_goals = is_over_goals;
        project.is_zero_allowed = is_zero_allowed;

        emit ProjectCreated(project.owner, project.id);
        checkUser(project.owner);

        projects.push(id);
        return projects.length;
    }

    function createProject(
        string memory title,
        string memory description,
        uint256 goals,
        uint256 deadline,
        uint256 date,
        string memory image,
        string memory content,
        bool is_over_goals,
        bool is_zero_allowed
    ) public returns (uint256) {
        return
            newProject(
                title,
                description,
                goals,
                deadline,
                date,
                image,
                content,
                is_over_goals,
                is_zero_allowed
            );
    }

    function createProject(
        string memory title,
        string memory description,
        uint256 goals,
        uint256 deadline,
        uint256 date,
        string memory image,
        string memory content
    ) public returns (uint256) {
        return
            newProject(
                title,
                description,
                goals,
                deadline,
                date,
                image,
                content,
                false,
                false
            );
    }

    function fundToProject(
        uint256 id,
        string memory message,
        uint256 date
    ) public payable {
        uint256 amount = msg.value;

        Project storage project = projects_data[id];
        Fund memory fund = Fund(msg.sender, amount, message, date);
        project.funds.push(fund);

        (bool sent, ) = payable(project.owner).call{value: amount}("");

        if (sent) {
            project.amount = project.amount + amount;
        }

        checkUser(msg.sender);
        emit NewFunder(msg.sender, project.owner);
    }

    function getFunders(uint256 id) public view returns (Fund[] memory) {
        return projects_data[id].funds;
    }

    function getProject(uint256 id) public view returns (Project memory) {
        return projects_data[id];
    }

    function getProjects() public view returns (Project[] memory) {
        Project[] memory list_of_projects = new Project[](projects.length);

        for (uint i = 0; i < projects.length; i++) {
            Project storage item = projects_data[projects[i]];
            list_of_projects[i] = item;
        }

        return list_of_projects;
    }

    function getTotalProjects() public view returns (uint256) {
        return projects.length;
    }

    function getAccounts() public view returns (address[] memory) {
        return accounts;
    }

    function getTotalAccounts() public view returns (uint256) {
        return accounts.length;
    }
}

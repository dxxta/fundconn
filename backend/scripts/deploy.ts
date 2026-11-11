import { ethers, network } from "hardhat";

const main = async () => {
  // ethers is avaialble in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress(),
    "\n"
  );

  const EventFunding = await ethers.getContractFactory("EventFunding");
  const contract = await EventFunding.deploy();
  await contract.waitForDeployment();
  console.log(
    "Contract deployed to:",
    await contract.getAddress(),
    network.name,
    await network.provider.send("eth_chainId")
  );

  return { contract, deployer };
};

const seed = async ({
  contract,
  deployer,
}: Awaited<ReturnType<typeof main>>) => {
  // deadlines are relative to the deploy time; negative offsets are already expired
  const DAY_MS = 24 * 60 * 60 * 1000;
  const daysFromNow = (days: number) => Date.now() + days * DAY_MS;
  const project_list = [
    {
      title: "Build Responsive Web App",
      description:
        "Create a progressive web application with a mobile-first approach.",
      deadline: daysFromNow(14),
      date: new Date().getTime(),
      image: "https://picsum.photos/1920/1080",
      goals: "0.5",
      content:
        "<p>With the growing demand for mobile-friendly web experiences, creating a responsive web application has become a necessity. This project emphasizes designing a platform that seamlessly adapts to various screen sizes, ensuring accessibility and usability for all users. The core focus will be on implementing modern frameworks such as <strong>React</strong> or <strong>Vue.js</strong> to deliver a dynamic user experience.</p><img class='project-image-content' src='https://picsum.photos/600/400' alt='Responsive Web App' /><p>The project includes features like adaptive navigation menus, touch-friendly interactions, and offline capabilities using Progressive Web App (PWA) standards. Furthermore, it will prioritize accessibility for individuals with disabilities, adhering to <a href='https://www.w3.org/WAI/'>WCAG guidelines</a>.</p><p>By leveraging responsive design techniques such as fluid grids, flexible images, and media queries, the web app will deliver consistent performance across all devices, enhancing user satisfaction and engagement.</p>",
    },
    {
      title: "Integrate AI Chatbot",
      description:
        "Develop and integrate an AI-powered chatbot into the existing customer support system.",
      deadline: daysFromNow(30),
      date: new Date().getTime(),
      image: "https://picsum.photos/1920/1080?random=1",
      goals: "1.5",
      content:
        "<p>Artificial intelligence is revolutionizing customer service, and this project aims to implement a state-of-the-art chatbot to streamline support operations. By leveraging natural language processing (NLP) models, the chatbot will provide accurate and personalized responses to user queries.</p><img class='project-image-content' src='https://picsum.photos/600/400?random=1' alt='AI Chatbot' /><p>The chatbot will handle tasks such as answering frequently asked questions, guiding users through troubleshooting processes, and providing instant solutions 24/7. This not only improves user satisfaction but also reduces workload on the human support team, allowing them to focus on complex issues.</p><p>Additional features include sentiment analysis for better user understanding, integration with CRM systems for seamless data flow, and support for multiple languages to cater to a global audience.</p>",
    },
    {
      title: "Server Infrastructure",
      description:
        "Improve server performance and scalability by implementing cloud-native solutions.",
      deadline: daysFromNow(45),
      date: new Date().getTime(),
      image: "https://picsum.photos/1920/1080?random=2",
      goals: "2",
      content:
        "<p>To meet the demands of an ever-growing user base, upgrading server infrastructure is paramount. This project involves migrating to cloud-native solutions, which offer unmatched scalability and reliability. By utilizing platforms like AWS or Google Cloud, the infrastructure will support dynamic scaling and high availability.</p><img class='project-image-content' src='https://picsum.photos/600/400?random=2' alt='Server Infrastructure' /><p>The upgrade will include implementing containerized services using <strong>Docker</strong> and orchestration tools like <strong>Kubernetes</strong>. This approach ensures efficient resource allocation, faster deployment, and fault tolerance.</p><p>Security enhancements such as automated backups, encryption, and intrusion detection systems will also be integrated, ensuring the safety of sensitive data. Ultimately, the upgraded infrastructure will support high-performance workloads, reduce downtime, and enable future innovations.</p>",
    },
    {
      title: "Launch Marketing Campaign",
      description:
        "Plan and execute a comprehensive marketing campaign for a new product release.",
      deadline: daysFromNow(60),
      date: new Date().getTime(),
      image: "https://picsum.photos/1920/1080?random=3",
      goals: "0.3",
      content:
        "<p>A successful product launch requires a well-executed marketing campaign. This project focuses on creating a comprehensive strategy that combines digital and traditional media to maximize visibility. Social media platforms like Instagram, TikTok, and LinkedIn will play a pivotal role in reaching target audiences.</p><img class='project-image-content' src='https://picsum.photos/600/400?random=3' alt='Marketing Campaign' /><p>The campaign will include influencer collaborations, targeted ad campaigns, and engaging content such as videos, blog posts, and user testimonials. To further engage potential customers, interactive events like webinars, giveaways, and Q&A sessions will be organized.</p><p>Metrics such as click-through rates, social media impressions, and lead conversions will be monitored to measure success and adjust strategies in real time. This campaign will not only boost product visibility but also establish a strong brand presence in the market.</p>",
    },
    {
      title: "Develop Mobile App",
      description:
        "Create a minimum viable product for a cross-platform mobile application.",
      deadline: daysFromNow(90),
      date: new Date().getTime(),
      image: "https://picsum.photos/1920/1080?random=4",
      goals: "0.7",
      content:
        "<p>The goal of this project is to develop a minimum viable product (MVP) for a cross-platform mobile application. The MVP will focus on core functionalities, ensuring a quick release to test the market and gather user feedback.</p><img class='project-image-content' src='https://picsum.photos/600/400?random=4' alt='Mobile App MVP' /><p>Technologies such as <strong>Flutter</strong> or <strong>React Native</strong> will be utilized to ensure compatibility across Android and iOS platforms. Features like user authentication, push notifications, and a streamlined user interface will be prioritized.</p><p>Post-launch, the app will be iteratively improved based on user feedback, adding advanced features and addressing any pain points. This agile development approach minimizes risks and accelerates time-to-market while ensuring a user-centric product.</p>",
    },
    {
      title: "Community Hackathon",
      description: "Host a weekend hackathon for local developers and students.",
      deadline: daysFromNow(120),
      date: new Date().getTime(),
      image: "https://picsum.photos/1920/1080?random=5",
      goals: "1",
      content: "<p>Host a weekend hackathon for local developers and students. This project is part of the default seed data.</p>",
    },
    {
      title: "Open Source Library",
      description: "Maintain and document a widely used open source UI library.",
      deadline: daysFromNow(180),
      date: new Date().getTime(),
      image: "https://picsum.photos/1920/1080?random=6",
      goals: "0.8",
      content: "<p>Maintain and document a widely used open source UI library. This project is part of the default seed data.</p>",
    },
    {
      title: "Charity Run Event",
      description: "Organize a city charity run to support local education.",
      deadline: daysFromNow(-5),
      date: new Date().getTime(),
      image: "https://picsum.photos/1920/1080?random=7",
      goals: "1.2",
      content: "<p>Organize a city charity run to support local education. This project is part of the default seed data.</p>",
    },
    {
      title: "Podcast Studio Setup",
      description: "Build a small recording studio for a community podcast.",
      deadline: daysFromNow(-30),
      date: new Date().getTime(),
      image: "https://picsum.photos/1920/1080?random=8",
      goals: "0.4",
      content: "<p>Build a small recording studio for a community podcast. This project is part of the default seed data.</p>",
    },
    {
      title: "Tech Conference",
      description: "Run a one-day conference with talks on web3 and AI.",
      deadline: daysFromNow(-90),
      date: new Date().getTime(),
      image: "https://picsum.photos/1920/1080?random=9",
      goals: "2.5",
      content: "<p>Run a one-day conference with talks on web3 and AI. This project is part of the default seed data.</p>",
    },
  ];
  for (const project of project_list) {
    const result = await contract
      .connect(deployer)
      ["createProject(string,string,uint256,uint256,uint256,string,string)"](
        project.title,
        project.description,
        ethers.parseUnits(project.goals, "ether"),
        project.deadline,
        project.date,
        project.image,
        project.content
      );
    result.wait(1);
    console.log("project added", result);
  }
};

main()
  .then(seed)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

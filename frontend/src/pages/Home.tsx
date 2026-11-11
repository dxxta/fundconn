import {
  Image,
  Title,
  Container,
  Flex,
  Group,
  Text,
  Button,
  rem,
  Paper,
  Divider,
  Space,
  Skeleton,
  Card,
  Stack,
  Stepper,
  ScrollArea,
  useMatches,
  Grid,
  useMantineColorScheme,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { projectType, useContractContext } from "../context/Contract";
import { useDocumentTitle, useHover } from "@mantine/hooks";
import teamImage from "../assets/team.svg";
import { useNavigate } from "react-router";
import { ExploreCard } from "../components/ExploreCard";

const heroTitle = `Ethereum Based Platform - Connecting Ideas and Empowering Events`;
const subHeroCaption = `Join a thriving community where ideas meet support. Turn your event plans into reality with FundConn – the ultimate blockchain platform for event funding and collaboration.`;

export const Home = () => {
  const { colorScheme } = useMantineColorScheme();
  const { hovered: hoveredHeroBtn, ref: refHeroBtn }: any = useHover();
  const { hovered: hoveredHeroBtn2, ref: refHeroBtn2 }: any = useHover();
  const { fetchProjects, account, contract, loading, connectMetamask } =
    useContractContext();

  const navigation = useNavigate();
  const [projects, setProjects] = useState<projectType[] | null>(null);

  useDocumentTitle("Homepage - Fundconn");

  const updatedProjects = async () => {
    try {
      const response = await fetchProjects();
      setProjects(response ?? []);
    } catch (error) {
      console.error(error);
      setProjects([]);
      notifications.show({
        title: "Projects",
        color: "red",
        message:
          "Could not load projects. Check that your wallet is on the same network as the contract and VITE_CONTRACT_ADDRESS is correct.",
      });
    }
  };

  const goesToProjectCreationPage = () => {
    const goToCreateProjectPage = () => navigation("/projects/create");
    if (account?.address) {
      goToCreateProjectPage();
    } else {
      connectMetamask()?.then(() => {
        goToCreateProjectPage();
      });
    }
  };

  useEffect(() => {
    if (!contract) return;
    const projectCreatedHandler = () => {
      void updatedProjects();
    };
    void updatedProjects();
    contract.on("ProjectCreated", projectCreatedHandler);
    return () => {
      contract.off("ProjectCreated", projectCreatedHandler);
    };
  }, [contract]);

  return (
    <Container fluid>
      <Paper bg="primary" h="500px">
        <Flex
          justify="center"
          align="center"
          direction="column"
          h="100%"
          gap="xl"
        >
          <Title
            order={1}
            fw={800}
            fz={{
              base: rem(45),
              md: rem(50),
            }}
            ta="center"
            c="black"
          >
            {/* <q> */}
            {heroTitle}
            {/* </q> */}
          </Title>
          <Container visibleFrom="md" size="lg">
            <Text c="black" size="xl" ta="center">
              {subHeroCaption}
            </Text>
          </Container>
          <Flex
            gap="md"
            direction={{
              base: "column",
              lg: "row",
            }}
          >
            <Button
              ref={refHeroBtn}
              variant="filled"
              color={hoveredHeroBtn ? "primary.3" : "black"}
              size={useMatches({
                base: "sm",
                md: "lg",
              })}
              styles={{
                root: {
                  boxShadow: hoveredHeroBtn ? "6px 6px 2px 1px black" : "none",
                  transition: "all 500ms ease-out",
                  boxSizing: "content-box",
                },
              }}
              onClick={goesToProjectCreationPage}
            >
              Get Started
            </Button>
            <Button
              ref={refHeroBtn2}
              variant="filled"
              color={hoveredHeroBtn2 ? "primary.3" : "black"}
              rightSection={<IconArrowRight />}
              onClick={() => navigation("/projects")}
              size={useMatches({
                base: "sm",
                md: "lg",
              })}
              styles={{
                root: {
                  boxShadow: hoveredHeroBtn2 ? "6px 6px 2px 1px black" : "none",
                  transition: "all 500ms ease-out",
                  boxSizing: "content-box",
                },
              }}
            >
              Explore Projects
            </Button>
          </Flex>
        </Flex>
      </Paper>
      <Container hiddenFrom="md" fluid px={0}>
        <br />
        <Text size="lg">{subHeroCaption}</Text>
      </Container>
      <br />
      <Space my="xl">
        <Title order={2} ta="center" size="h1">
          How it works?
        </Title>
        <br />
        <Container>
          <Stepper active={0} my="xl" orientation="vertical">
            <Stepper.Step
              label="Create Your Campaign"
              description="Share your event idea, funding goals, and timeline with the FundConn community."
            />
            <Stepper.Step
              label="Engage the Community"
              description="Receive feedback, votes, and support to refine and promote your event."
            />
            <Stepper.Step
              label="Track Your Progress"
              description="Monitor funding milestones and stay connected with your supporters"
            />
            <Stepper.Step
              label="Bring Your Event to Life"
              description="Use the funds to execute your event and share the results with the community."
            />
          </Stepper>
        </Container>
      </Space>
      <Container
        fluid={useMatches({
          base: true,
          xl: false,
        })}
        px={0}
      >
        <Space>
          <Title order={2} ta="center" size="h1">
            Explore Projects
          </Title>
          <Divider my="sm" />
          <Group>
            <ScrollArea w="100vw" h="auto" scrollbars="x">
              <Skeleton visible={!projects ? true : loading}>
                <Flex gap="md">
                  {projects?.slice(0, 4)?.map((project, projectIdx) => (
                    <ExploreCard
                      project={project}
                      key={projectIdx}
                      width="350px"
                    />
                  ))}
                  {projects && projects?.length > 4 && (
                    <Card
                      w="350px"
                      h="625px"
                      bg="primary"
                      c="black"
                      shadow="sm"
                      padding="xl"
                      component="a"
                      href={`projects`}
                      target="_blank"
                    >
                      <Stack justify="center" align="center" h="100%">
                        <Text fw={800}>View More</Text>
                      </Stack>
                    </Card>
                  )}
                </Flex>
                <br />
              </Skeleton>
            </ScrollArea>
          </Group>
        </Space>
      </Container>

      <Container
        fluid={useMatches({
          base: true,
          xl: false,
        })}
        px={0}
        my="xl"
      >
        <Card bg={colorScheme == "dark" ? "dark.6" : "black"} c="white" p="xl">
          <Grid>
            <Grid.Col
              span={{
                base: 12,
                lg: 6,
              }}
            >
              <Flex
                justify="center"
                align="start"
                direction="column"
                h="100%"
                gap="xl"
              >
                <Title size="h1">Let’s Make Things Happen</Title>
                <Text size="h3">
                  Turn your vision into reality by creating a project that
                  inspires. Share your idea, gather passionate backers, and
                  watch your dreams come to life. Don’t wait—every big event
                  starts with one bold move. Start your project today and let
                  the power of collaboration fuel your success!
                </Text>
                <Button size="lg" onClick={goesToProjectCreationPage}>
                  Create Project
                </Button>
              </Flex>
            </Grid.Col>
            <Grid.Col
              hidden={useMatches({
                base: true,
                lg: false,
              })}
              span={6}
            >
              <Flex justify="center" align="center" direction="column">
                <Image loading="lazy" h="150px" src={teamImage} />
              </Flex>
            </Grid.Col>
          </Grid>
        </Card>
      </Container>
    </Container>
  );
};

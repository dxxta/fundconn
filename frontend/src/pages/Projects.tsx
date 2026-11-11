import {
  Title,
  Text,
  Container,
  Flex,
  Group,
  Divider,
  Space,
  Skeleton,
  ScrollArea,
  useMatches,
  Grid,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { projectType, useContractContext } from "../context/Contract";
import { useDocumentTitle } from "@mantine/hooks";
import { ExploreCard } from "../components/ExploreCard";

export const Projects = () => {
  const { fetchProjects, contract, loading, account } = useContractContext();

  const [projects, setProjects] = useState<projectType[] | null>(null);

  useDocumentTitle("Projects - Fundconn");

  const getMyProjects = (projects: projectType[]) => {
    return projects?.filter((item) => item.owner == account?.address);
  };

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
      {projects && getMyProjects(projects)?.length > 0 && (
        <>
          <Container fluid={true} px={0}>
            <Space>
              <Title order={2} size="h1">
                Your Projects
              </Title>
              <Text>Projects created by you</Text>
              <Divider my="sm" />
              <Group>
                <ScrollArea w="100vw" h="auto" scrollbars="x">
                  <Skeleton visible={!projects ? true : loading}>
                    <Flex gap="md">
                      {getMyProjects(projects)?.map((project, projectIdx) => (
                        <ExploreCard
                          project={project}
                          key={projectIdx}
                          width="350px"
                        />
                      ))}
                    </Flex>
                    <br />
                  </Skeleton>
                </ScrollArea>
              </Group>
            </Space>
          </Container>
          <br />
        </>
      )}
      <Container
        fluid={useMatches({
          base: true,
          xl: false,
        })}
        px={0}
      >
        <Space>
          <Title order={1} size="h1">
            Projects
          </Title>
          <Text>All projects available</Text>
          <Divider my="sm" />
          <Group>
            <Skeleton visible={!projects ? true : loading}>
              <Grid>
                {projects?.map((project, projectIdx) => (
                  <Grid.Col
                    key={projectIdx}
                    span={{
                      base: 12,
                      lg: 3,
                    }}
                  >
                    <ExploreCard project={project} />
                  </Grid.Col>
                ))}
              </Grid>
              {/* <Flex gap="md">
                  {projects?.map((project, projectIdx) => (
                    <ExploreCard project={project} key={projectIdx} />
                  ))}
                </Flex> */}
              <br />
            </Skeleton>
          </Group>
        </Space>
      </Container>
    </Container>
  );
};

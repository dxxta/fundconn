import { useNavigate, useParams } from "react-router";
import { fundType, projectType, useContractContext } from "../context/Contract";
import { useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ActionIcon,
  Badge,
  Container,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
  Image,
  rem,
  useMatches,
  MantineProvider,
  Paper,
  Blockquote,
  Flex,
  Grid,
  Button,
  useMantineColorScheme,
  Breadcrumbs,
  Anchor,
  Divider,
  Modal,
  NumberInput,
  CloseButton,
  TextInput,
  Box,
} from "@mantine/core";
import { IconLocationDollar, IconUserEdit } from "@tabler/icons-react";
import {
  useDisclosure,
  useDocumentTitle,
  useHover,
  useWindowEvent,
} from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useStorageContext } from "../context/Storage";

const DetailContent = ({ content }: { content: string }) => {
  const [text, setText] = useState<string | null>(null);
  // todo: replace default image
  const onMounted = () => {
    try {
      let newContent = content?.replace(/(<? *script)/gi, "illegalscript");
      const totalImages = newContent?.match(/<img(.*?)\/>/g)?.length ?? 0;
      for (let idx = 0; idx < totalImages; idx++) {
        if (!newContent) continue;
        const indexOfImage = newContent?.indexOf("<img");
        const imageString = newContent
          ?.substring(indexOfImage)
          ?.split("/>")?.[0]
          ?.replace("<img", "")
          ?.trim();
        const imageSrc =
          imageString?.substring(imageString.indexOf("src"))?.split(`'`)?.[1] ??
          imageString?.substring(imageString.indexOf("src"))?.split(`"`)?.[1];

        newContent = newContent?.replace(
          /<img(.*?)\/>/,
          renderToStaticMarkup(
            <MantineProvider>
              <Image
                loading="lazy"
                src={imageSrc}
                fallbackSrc="https://placehold.co/600x400?text=..."
              />
            </MantineProvider>
          )
            ?.replace(`/>`, imageString.concat(`/>`))
            ?.replace(`class='project-image-content'`, ``)
            ?.replace(`src='${imageSrc}'`, ``)
        );

        // newContent = newContent
        //     ?.replace(`/>`, imageString.concat(`/>`))
        //     ?.replace(`class='project-image-content'`, ``)
        //     ?.replace(`class="project-image-content"`, ``)
        //     ?.replace(`src='${imageSrc}'`, ``)
        //     ?.replace(`src="${imageSrc}"`, ``)
        // );
      }
      setText(newContent);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    onMounted();
  }, [window]);
  return (
    text && (
      <div
        dangerouslySetInnerHTML={{
          __html: text,
        }}
      />
    )
  );
};

export const Detail = () => {
  const params = useParams();
  const fundSectionRef = useRef<any>(null);
  const navigate = useNavigate();

  const { colorScheme } = useMantineColorScheme();
  const { hovered, ref }: { ref: any; hovered: boolean } = useHover();
  const { getFile } = useStorageContext();
  const {
    loading,
    contract,
    account,
    donateProject,
    fetchProject,
    fetchFunders,
  } = useContractContext();

  const [donateField, setDonateField] = useState<number | string>(0);
  const [commentField, setCommentField] = useState<string>("");
  const [project, setProject] = useState<projectType | null>(null);
  const [funds, setFunds] = useState<fundType[] | null>(null);
  const [fundsPaginate, setFundsPaginate] = useState<number>(5);
  const [fundSectionActive, setFundSectionActive] = useState<boolean>(false);
  const [docTitle, setDocTitle] = useState<string>("Loading - Fundconn");
  const [stateDonateModal, { open: openDonateModal, close: closeDonateModal }] =
    useDisclosure(false);

  const loadProject = () => {
    fetchProject(params.id as string)
      ?.then(async (response) => {
        if (!response) return navigate("/not-found");
        fetchFunders(params.id as string)
          ?.then((response) => {
            setFunds(response);
          })
          .catch(() => navigate("/not-found"));

        const fetchContect = await (await getFile(response.content))?.text();
        if (fetchContect) {
          response.content = fetchContect?.split("$START$")[1] as string;
        }

        setProject(response);
      })
      .catch(() => navigate("/not-found"));
  };

  useDocumentTitle(docTitle);

  useWindowEvent("scroll", () => {
    if ((fundSectionRef.current?.offsetTop ?? 0) - window.scrollY < 100) {
      setFundSectionActive(true);
    } else {
      setFundSectionActive(false);
    }
  });

  useEffect(() => {
    if (!contract) return;
    const newFunderHandler = () => loadProject();
    loadProject();
    contract.on("NewFunder", newFunderHandler);
    return () => {
      contract.off("NewFunder", newFunderHandler);
    };
  }, [contract]);

  useEffect(() => {
    if (project) {
      setDocTitle(`${project.title} - Fundconn`);
    }
  }, [project]);

  return (
    <>
      <Modal
        opened={stateDonateModal}
        onClose={() => {
          setDonateField(0);
          setCommentField("");
          closeDonateModal();
        }}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        title="Donate"
        centered
      >
        <Stack>
          <TextInput
            label="Comment"
            placeholder="Input comment"
            value={commentField}
            description="(optional) Add some comment"
            onChange={(event) => setCommentField(event.currentTarget.value)}
            rightSectionPointerEvents="all"
            rightSection={
              <CloseButton
                aria-label="Clear"
                onClick={() => setCommentField("")}
                style={{ display: commentField ? undefined : "none" }}
              />
            }
          />
          <NumberInput
            label="Fund Amount"
            description="You can put decimal here, ex: 0.15"
            placeholder="Dollars"
            min={0}
            suffix=" ETH"
            value={donateField}
            onChange={setDonateField}
            mb="lg"
          />
          <Button
            fullWidth
            onClick={() => {
              if (
                project?.is_zero_allowed &&
                (!donateField || !(+donateField > 0))
              ) {
                notifications.show({
                  title: "Donate Status",
                  color: "orange",
                  message: "The author did not allow zero amount of funds",
                });
                return;
              }
              donateProject(
                project!.id,
                donateField?.toString(),
                commentField
              )?.then(() => {
                notifications.show({
                  title: "Transaction Status",
                  message:
                    "Your funds is on the way, this page will automatically refreshed when completed",
                });
              });
              setCommentField("");
              setDonateField(0);
              closeDonateModal();
            }}
          >
            Send
          </Button>
        </Stack>
      </Modal>
      <Container>
        <Skeleton visible={!project || loading}>
          <Stack>
            <Breadcrumbs separator=">">
              <Anchor
                underline="always"
                c={colorScheme == "dark" ? "primary" : "black"}
                href="/"
              >
                Homepage
              </Anchor>
              <Anchor
                underline="always"
                c={colorScheme == "dark" ? "primary" : "black"}
                href={`/project/${params.id}`}
              >
                {project?.title}
              </Anchor>
            </Breadcrumbs>
            <Title order={1} fz={rem(50)}>
              {project?.title}
            </Title>
            <Flex gap="xs" wrap="wrap" align="center">
              <ActionIcon size="md" aria-label="Toggle Theme Auto">
                <IconUserEdit
                  style={{ width: "70%", height: "70%" }}
                  stroke={1.5}
                />
              </ActionIcon>
              <Text size="sm">Proposed by</Text>
              <Text size="sm">{project?.owner}</Text>
            </Flex>
            <Group>
              <Badge c="dark.6" radius={0} size="lg">
                Published at
              </Badge>
              <Text size="sm">
                {new Intl.DateTimeFormat("en-EN", {
                  dateStyle: "long",
                }).format(project?.date ?? new Date())}
              </Text>
            </Group>
          </Stack>
        </Skeleton>
      </Container>
      <br />
      <Skeleton visible={!project || loading}>
        <Paper bg="primary">
          <Container>
            <Image
              loading="lazy"
              src={project?.image}
              h="500px"
              fit={useMatches({
                base: "cover",
              })}
              fallbackSrc="https://placehold.co/600x400?text=..."
            />
          </Container>
        </Paper>
      </Skeleton>
      <br />
      <Container
        ref={fundSectionRef}
        fluid={fundSectionActive ? true : false}
        bg={fundSectionActive ? "primary" : undefined}
        c={fundSectionActive ? "black" : undefined}
        style={{ position: "sticky", top: "50px", zIndex: "1" }}
        styles={{
          root: {
            transition: "all 500ms ease",
          },
        }}
      >
        <Skeleton visible={!project || loading}>
          <Grid justify="center" align="center">
            <Grid.Col
              span={useMatches({
                base: 6,
                md: 3,
              })}
            >
              <Text>Raised </Text>
              <Text>{project?.amount} ETH</Text>
            </Grid.Col>
            <Grid.Col
              span={useMatches({
                base: 6,
                md: 3,
              })}
            >
              <Text>Goals </Text>
              <Text>{project?.goals} ETH</Text>
            </Grid.Col>
            <Grid.Col
              span={useMatches({
                base: 12,
                md: 3,
              })}
            >
              <Text>Remaining </Text>
              <Flex wrap="wrap">
                <Text>
                  {new Intl.DateTimeFormat("en-EN", {
                    dateStyle: "long",
                  }).format(project?.deadline)}
                </Text>
                <Divider mx="md" orientation="vertical" />
                <Text c={project?.isExpired ? "red" : undefined}>
                  {project?.isExpired ? "Expired" : `${project?.remainingDays} Days`}
                </Text>
              </Flex>
            </Grid.Col>
            <Grid.Col
              span={useMatches({
                base: "auto",
                md: 3,
              })}
            >
              <Button
                fullWidth
                ref={ref}
                disabled={
                  !account ||
                  Boolean(project?.isExpired) ||
                  Boolean(
                    !project?.is_over_goals &&
                      +(project?.amount ?? 0) >= +(project?.goals ?? 0)
                  )
                }
                bg={fundSectionActive && account ? "black" : undefined}
                c={fundSectionActive && account ? "white" : undefined}
                rightSection={<IconLocationDollar style={{ width: "70%" }} />}
                styles={{
                  root: {
                    boxShadow:
                      hovered && account ? "6px 6px 2px 1px black" : "none",
                    transition: "all 500ms ease-out",
                  },
                }}
                onClick={openDonateModal}
              >
                Donate
              </Button>
            </Grid.Col>
          </Grid>
        </Skeleton>
      </Container>
      <br />
      <Container>
        <Skeleton visible={!project || loading}>
          <Blockquote color="primary">
            <Text>{project?.description}</Text>
          </Blockquote>
        </Skeleton>
      </Container>
      <Container>
        <Skeleton visible={!project || loading}>
          {project?.content && <DetailContent content={project.content} />}
        </Skeleton>
      </Container>
      <br />
      <Container>
        <Skeleton visible={!project || loading}>
          <Flex
            justify={useMatches({
              base: "flex-start",
              md: "space-between",
            })}
            align="center"
            wrap="wrap"
            columnGap={50}
            rowGap="md"
          >
            <Box>
              <Text c="dimmed">Total Funders</Text>
              <Text> {funds?.length ?? 0}</Text>
            </Box>
            <Box>
              <Text c="dimmed">Funds Collected </Text>
              <Text>
                {project?.amount}/{project?.goals} ETH
              </Text>
            </Box>
            <Box>
              <Text c="dimmed">Status</Text>
              <Text> {project?.status}</Text>
            </Box>
          </Flex>
        </Skeleton>
      </Container>
      <br />
      <Container>
        <Title order={2}>Funders</Title>
        <Divider my="md" />
        <Stack>
          {funds?.slice(0, fundsPaginate)?.map((fund, fundIdx) => (
            <Box
              key={fundIdx}
              bg={colorScheme == "dark" ? "dark.6" : "light.1"}
              p="md"
            >
              <Stack>
                <Flex
                  gap="sm"
                  align="center"
                  justify="space-between"
                  wrap="wrap"
                >
                  <Box>
                    <Text c="dimmed">Funder</Text>
                    <Text>{fund.owner}</Text>
                  </Box>
                  <Box>
                    <Text c="dimmed">Amount</Text>
                    <Text>{fund.amount} ETH</Text>
                  </Box>
                  <Box>
                    <Text c="dimmed">Date</Text>
                    <Text>
                      {new Intl.DateTimeFormat("en-EN", {
                        dateStyle: "long",
                      }).format(fund.date)}
                    </Text>
                  </Box>
                </Flex>
                <Blockquote
                  color="primary"
                  bg={colorScheme == "dark" ? undefined : "dark.1"}
                  p="sm"
                >
                  <Text>
                    {fund?.message?.length > 0
                      ? fund?.message
                      : "No message from funder"}
                  </Text>
                </Blockquote>
              </Stack>
            </Box>
          )) ?? (
            <Stack
              h="250px"
              justify="center"
              bg={colorScheme == "dark" ? "dark.6" : "light.1"}
            >
              <Text ta="center">There is no funders currently</Text>
            </Stack>
          )}
          <Button
            onClick={() => setFundsPaginate(fundsPaginate + 5)}
            disabled={Boolean(fundsPaginate >= (funds?.length ?? 0))}
          >
            Load More
          </Button>
          <Button
            disabled={Boolean(fundsPaginate == 5)}
            onClick={() => setFundsPaginate(5)}
          >
            Hide
          </Button>
        </Stack>
      </Container>
    </>
  );
};

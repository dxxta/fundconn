import {
  AppShell,
  Image,
  Title,
  Container,
  Flex,
  Group,
  ActionIcon,
  Text,
  Anchor,
  Button,
  Highlight,
  Divider,
  Drawer,
  useMantineColorScheme,
  Burger,
  NavLink,
  Skeleton,
  Stack,
  Loader,
} from "@mantine/core";
import {
  IconBoxModel2,
  IconCurrencyEthereum,
  IconHome2,
  IconMoon,
  IconPencilPlus,
  IconSun,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { Navigate, Route, Routes, useNavigate } from "react-router";
import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { useContractContext } from "./context/Contract";
import { nprogress } from "@mantine/nprogress";
import { DemoBanner, isDemo } from "./components/DemoBanner";
const Home = lazy(() =>
  import("./pages/Home").then((module) => ({ default: module.Home }))
);
const Detail = lazy(() =>
  import("./pages/Detail").then((module) => ({ default: module.Detail }))
);
const Projects = lazy(() =>
  import("./pages/Projects").then((module) => ({ default: module.Projects }))
);
const CreateProject = lazy(() =>
  import("./pages/CreateProject").then((module) => ({
    default: module.CreateProject,
  }))
);
const NotFound = lazy(() =>
  import("./pages/NotFound").then((module) => ({ default: module.NotFound }))
);
import { useDisclosure } from "@mantine/hooks";
import { JsonRpcSigner } from "ethers";
import logo from "./assets/logo.png";

const GuardAuthentication = ({
  loading,
  account,
  children,
}: {
  loading: boolean;
  account: JsonRpcSigner | null;
  children: ReactNode;
}) => {
  return (
    <>
      {loading ? (
        <Stack h="80vh" justify="center" align="center">
          <Loader color="primary" size="xl" type="dots" />
          <Text ta="center">We're preparing your page...</Text>
        </Stack>
      ) : account?.address ? (
        <>{children}</>
      ) : (
        <Navigate to="/" replace />
      )}
    </>
  );
};

const App = () => {
  const navigate = useNavigate();

  const { setColorScheme, colorScheme } = useMantineColorScheme();
  const { connectMetamask, account, loading, contract } = useContractContext();

  const [openedMenu, { open, close }] = useDisclosure(false);

  useEffect(() => {
    if (loading) {
      nprogress.start();
    } else {
      nprogress.complete();
    }
  }, [loading]);

  useEffect(() => {
    const newFunderHandler = (args: string) => {
      if (args != account?.address) {
        notifications.show({
          title: "Funds status",
          position: "top-center",
          color: "rgba(255, 255, 255, 0)",
          withCloseButton: false,
          message: `${args} give some funds`,
        });
      }
      console.log("new funder", args);
    };
    contract?.on("NewFunder", newFunderHandler);
    return () => {
      contract?.off("NewFunder", newFunderHandler);
    };
  }, [contract, account?.address]);
  return (
    <>
      <Drawer opened={openedMenu} onClose={close} title="Navigation">
        {[
          {
            icon: IconHome2,
            label: "Homepage",
            description: "Back to main page",
            href: "/",
          },
          {
            icon: IconBoxModel2,
            label: "Projects",
            href: "/projects",
          },
          {
            icon: IconPencilPlus,
            label: "Add Project",
            href: "/projects/create",
            hidden: !account?.address,
          },
          // { icon: IconActivity, label: 'Activity' },
        ]
          .filter((item) => !item.hidden)
          .map((item) => (
            <NavLink
              key={item.label}
              label={item.label}
              description={item.description}
              leftSection={<item.icon size="1rem" stroke={1.5} />}
              onClick={() => {
                navigate(item.href);
                close();
              }}
            />
          ))}
      </Drawer>

      {isDemo && <DemoBanner />}
      <AppShell
        style={isDemo ? { paddingTop: "var(--demo-banner-height, 0px)" } : undefined}
        header={{
          height: "50",
        }}
        padding="md"
      >
        <AppShell.Header
          style={isDemo ? { top: "var(--demo-banner-height, 0px)" } : undefined}
        >
          <Container fluid h={"100%"} size="xl">
            <Group h={"100%"} justify="space-between" align="center">
              <Anchor onClick={() => navigate("/")}>
                <Flex gap="xs" align="center">
                  <Image src={logo} h={35} fit="contain" />
                  <Title
                    // hidden={useMatches({
                    //   base: true,
                    //   lg: false,
                    // })}
                    order={4}
                    c={colorScheme == "dark" ? "white" : "black"}
                  >
                    Fundconn.
                  </Title>
                </Flex>
              </Anchor>
              <Flex gap="xs">
                <Skeleton visible={loading}>
                  <Button
                    bg={account?.address ? "red" : "primary"}
                    onClick={connectMetamask}
                    rightSection={
                      <IconCurrencyEthereum
                        style={{ width: "70%", height: "70%" }}
                      />
                    }
                  >
                    {account?.address
                      ? `${account?.address?.slice(
                          0,
                          7
                        )}..${account?.address?.slice(40)}`
                      : "Connect"}
                  </Button>
                </Skeleton>
                <ActionIcon aria-label="Toggle Theme" size="lg">
                  {colorScheme == "dark" ? (
                    <IconSun
                      onClick={() => setColorScheme("light")}
                      style={{ width: "70%", height: "70%" }}
                      stroke={1.5}
                    />
                  ) : (
                    <IconMoon
                      onClick={() => setColorScheme("dark")}
                      style={{ width: "70%", height: "70%" }}
                      stroke={1.5}
                    />
                  )}
                </ActionIcon>

                <Burger
                  opened={openedMenu}
                  onClick={open}
                  aria-label="Toggle navigation"
                  color={colorScheme == "dark" ? "white" : "black"}
                />
              </Flex>
              {/* </Group> */}
            </Group>
          </Container>
        </AppShell.Header>
        <AppShell.Main px={0} mx={0}>
          <Container fluid mih="80vh" px={0}>
            <Suspense
              fallback={
                <Stack h="80vh" justify="center" align="center">
                  <Loader color="primary" size="xl" type="dots" />
                </Stack>
              }
            >
              <Routes>
                <Route index path="/" element={<Home />} />
                <Route path="/projects/:id" element={<Detail />} />
                <Route path="/projects" element={<Projects />} />
                <Route
                  path="/projects/create"
                  element={
                    <GuardAuthentication
                      account={account ?? null}
                      loading={loading}
                    >
                      <CreateProject />
                    </GuardAuthentication>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Container>
          <Divider my="lg" />
          <Container ta="center">
            <Text my="xl" span>
              Created and managed by
              <Highlight color="primary" highlight="akarun dev">
                akarun dev
              </Highlight>
            </Text>
          </Container>
        </AppShell.Main>
      </AppShell>
    </>
  );
};

export default App;

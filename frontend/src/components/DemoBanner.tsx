import { Badge, Box, Button, CopyButton, Group, Text } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { useEffect } from "react";

// Hardhat's public default account #0 test key. It holds no real value.
const DEMO_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

export const isDemo = import.meta.env.VITE_DEMO === "true";
export const DEMO_BANNER_HEIGHT_VAR = "--demo-banner-height";

export const DemoBanner = () => {
  const { ref, height } = useElementSize();

  useEffect(() => {
    document.documentElement.style.setProperty(
      DEMO_BANNER_HEIGHT_VAR,
      `${height}px`
    );
    return () => {
      document.documentElement.style.removeProperty(DEMO_BANNER_HEIGHT_VAR);
    };
  }, [height]);

  return (
    <Box
      ref={ref}
      bg="black"
      c="white"
      px="md"
      py={8}
      style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000 }}
    >
      <Group justify="center" gap="xs" wrap="wrap">
        <Badge color="primary" c="black" radius={0}>
          DEMO
        </Badge>
        <Text size="xs" ta="center">
          Test network only (Hardhat, chain ID 31337, RPC{" "}
          <b>{import.meta.env.VITE_NETWORK}</b>). To donate or create a project,
          add that network in your wallet and import this public test account
          private key:{" "}
          <code style={{ wordBreak: "break-all" }}>{DEMO_PRIVATE_KEY}</code>.
          It has no real value, never use it on a real network.
        </Text>
        <CopyButton value={DEMO_PRIVATE_KEY}>
          {({ copied, copy }) => (
            <Button size="compact-xs" color="primary" c="black" onClick={copy}>
              {copied ? "Copied" : "Copy key"}
            </Button>
          )}
        </CopyButton>
      </Group>
    </Box>
  );
};

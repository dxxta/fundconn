import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type {
  AbstractProvider,
  Contract as ContractType,
  JsonRpcSigner,
} from "ethers";
import { Contract, BrowserProvider, JsonRpcProvider } from "ethers";
import { notifications } from "@mantine/notifications";
import { formatEther, toNumber, parseEther, parseUnits } from "ethers/utils";
import { useLocalStorage } from "@mantine/hooks";
import contractJsonAbi from "../constant/EventFundingAbi.json";

export type projectType = {
  id: string;
  owner: string;
  title: string;
  description: string;
  content: string;
  image: string;
  goals: string;
  deadline: number;
  date: number;
  amount: string;
  status: string;
  remainingDays: number;
  isExpired?: boolean;
  is_over_goals: boolean;
  is_zero_allowed: boolean;
};

export type projectCreationType = {
  title: string;
  description: string;
  content: string;
  goals: string;
  // date: number;
  deadline: number;
  image: string;
  is_over_goals: boolean;
  is_zero_allowed: boolean;
};

export type fundType = {
  owner: string;
  amount: string;
  message: string;
  date: number;
};

interface State {
  loading: boolean;
  contract: ContractType | null;
  account: JsonRpcSigner | null;
  provider: AbstractProvider | null;
  fetchProject: (id: string) => Promise<projectType | null>;
  fetchProjects: () => Promise<projectType[] | null>;
  fetchFunders: (id: string) => Promise<fundType[] | null>;
  donateProject: (id: string, amount: string, message: string) => Promise<void>;
  createProject: (opts: projectCreationType) => Promise<void>;
  connectMetamask: () => Promise<void | null>;
  setLoading: (value: boolean) => void;
  // setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const initialState: State = {
  loading: false,
  contract: null,
  account: null,
  provider: null,
  connectMetamask: () => Promise.resolve(null),
  fetchProject: () => Promise.resolve(null),
  fetchProjects: () => Promise.resolve(null),
  fetchFunders: () => Promise.resolve(null),
  donateProject: () => Promise.resolve(),
  createProject: () => Promise.resolve(),
  setLoading: () => null,
};

export const ContractContext = createContext<State>(initialState);
export const useContractContext = () => useContext(ContractContext);
export const ContractProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setNativeLoading] = useState<boolean>(true);
  const [contract, setContract] = useState<ContractType | null>(null);
  const [account, setAccount] = useState<JsonRpcSigner | null>(null);
  const [provider, setProvider] = useState<AbstractProvider | null>(null);
  const [localAccount, setLocalAccount] = useLocalStorage<JsonRpcSigner | null>(
    {
      key: "account",
      defaultValue: null,
    }
  );

  const setLoading = useCallback((value: boolean) => {
    setTimeout(
      () => {
        setNativeLoading(value);
      },
      value ? 0 : 1000
    );
  }, []);

  const updateProvider = useCallback(async (
    provider: AbstractProvider,
    signer?: JsonRpcSigner
  ) => {
    const contract = new Contract(
      import.meta.env.VITE_CONTRACT_ADDRESS as string,
      contractJsonAbi,
      signer ?? provider
    );

    if (signer) {
      setLocalAccount(signer);
      setAccount(signer);
    }

    setProvider(provider);
    setContract(contract);
  }, [setLocalAccount]);

  const mappingProject = useCallback((project: projectType) => {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const firstDate = new Date();
    const secondDate = new Date(toNumber(project.deadline));
    const goals = formatEther(project.goals.toString());
    const amount = formatEther(project.amount.toString());
    return {
      id: project.id,
      owner: project.owner,
      title: project.title,
      description: project.description,
      content: project.content?.toString(),
      goals,
      deadline: toNumber(project.deadline),
      date: toNumber(project.date),
      amount,
      image: project.image,
      status:
        parseFloat(amount) > parseFloat(goals)
          ? "Surpasses"
          : parseFloat(goals) == parseFloat(amount)
          ? "Reached"
          : "Ongoing",
      remainingDays: Math.max(
        0,
        Math.ceil((+secondDate - +firstDate) / oneDay)
      ),
      isExpired: +secondDate < +firstDate,
      is_over_goals: project.is_over_goals,
      is_zero_allowed: project.is_zero_allowed,
    };
  }, []);

  const fetchFunders = useCallback(async (id: string): Promise<fundType[] | null> => {
    setLoading(true);
    try {
      if (!contract) return null;

      const funders: fundType[] = await contract.getFunders(id?.split("-")[0]);
      if (!(funders?.length > 0)) return null;

      return funders?.map((fund) => ({
        owner: fund.owner,
        amount: formatEther(fund.amount.toString()),
        message: fund.message,
        date: toNumber(fund.date),
      }));
    } catch (error) {
      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  }, [contract, setLoading]);

  const fetchProjects = useCallback(async (): Promise<projectType[] | null> => {
    setLoading(true);
    try {
      if (!contract) return null;

      const projects: projectType[] = await contract.getProjects();
      const mapped: projectType[] = projects.map((project: projectType) =>
        mappingProject(project)
      );

      if (!(mapped?.length > 0)) return null;
      return mapped;
    } catch (error) {
      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  }, [contract, mappingProject, setLoading]);

  const fetchProject = useCallback(async (id: string): Promise<projectType | null> => {
    setLoading(true);
    try {
      if (!id) throw new Error("ID not provided");
      if (!contract) return null;

      const project: projectType = await contract.getProject(id?.split("-")[0]);
      if (!project) return null;
      return mappingProject(project);
    } catch (error) {
      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  }, [contract, mappingProject, setLoading]);

  const donateProject = useCallback(async (
    id: string,
    amount: string,
    message: string
  ): Promise<void> => {
    setLoading(true);
    try {
      console.log(id, amount, message);
      await contract?.fundToProject(id, message, new Date().getTime(), {
        value: parseEther(amount),
      });
    } catch (error) {
      notifications.show({
        title: "Funds status",
        color: "orange",
        autoClose: false,
        message:
          "Your provider refused the transaction. Try reset your provider (metamask/etc), reload network and send funds again",
      });
      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  }, [contract, setLoading]);

  const createProject = useCallback(async (payload: projectCreationType): Promise<void> => {
    setLoading(true);
    try {
      await contract?.createProject(
        payload.title,
        payload.description,
        parseUnits(String(payload.goals), "ether"),
        payload.deadline,
        new Date().getTime(),
        payload.image,
        payload.content,
        payload.is_over_goals,
        payload.is_zero_allowed
      );
      notifications.show({
        title: "Project status",
        message: "Your project has successfully created",
      });
    } catch (error) {
      notifications.show({
        title: "Project status",
        color: "orange",
        autoClose: false,
        message:
          "Your provider refused the transaction. Try reset your provider (metamask/etc), reload network and send funds again",
      });
      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  }, [contract, setLoading]);

  const loadBlockchain = useCallback(async (resetAccount: boolean = false) => {
    setLoading(true);
    try {
      if (resetAccount) {
        setAccount(null);
        setLocalAccount(null);
      }

      setProvider(null);
      setContract(null);

      let provider = window.ethereum
        ? new BrowserProvider(window?.ethereum)
        : new JsonRpcProvider(import.meta.env.VITE_NETWORK);

      const rpcProvider = new JsonRpcProvider(import.meta.env.VITE_NETWORK);
      let useRpc = !((await provider.listAccounts())?.length > 0);
      if (!useRpc) {
        // Fall back to the configured RPC when the wallet is on another chain
        try {
          const [walletChain, rpcChain] = await Promise.all([
            provider.getNetwork(),
            rpcProvider.getNetwork(),
          ]);
          useRpc = walletChain.chainId !== rpcChain.chainId;
        } catch {
          useRpc = true;
        }
      }
      if (useRpc) provider = rpcProvider;

      await updateProvider(provider);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setLocalAccount, updateProvider]);

  // Connect to a browser wallet
  const connectMetamask = useCallback(async () => {
    try {
      setLoading(true);
      if (!window.ethereum) {
        notifications.show({
          title: "Account request",
          color: "orange",
          message: "You have to install a browser wallet (MetaMask, Coinbase Wallet, etc.)",
        });
        return;
      }

      if (account?.address) {
        notifications.show({
          title: "Account status",
          message: `Successfully disconnected as ${account.address}`,
        });
        await loadBlockchain(true);
        return;
      }

      const walletProvider = new BrowserProvider(window.ethereum);
      await walletProvider.send("eth_requestAccounts", []);
      const accounts = await walletProvider.listAccounts();
      if (accounts[0]) {
        await updateProvider(walletProvider, accounts[0]);
        notifications.show({
          title: "Account status",
          message: `Successfully connected as ${accounts[0].address}`,
        });
      }
      window.ethereum.on("accountsChanged", async () => {
        const changedAccounts = await walletProvider.listAccounts();
        await updateProvider(walletProvider, changedAccounts[0]);
      });
    } catch (error: any) {
      if (error.code === 4001) {
        notifications.show({
          title: "Account status",
          color: "orange",
          message: "You refused to connect your account to our website",
        });
      } else {
        notifications.show({
          title: "Account request",
          color: "orange",
          message: "Please open/unlock your wallet and reload the page to continue",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [account?.address, loadBlockchain, setLoading, updateProvider]);

  // Run once on mount (loadBlockchain's identity can change between renders)
  useEffect(() => {
    loadBlockchain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (localAccount && !account) {
      void connectMetamask();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localAccount]);

  const contextValue = useMemo(
    () => ({
      loading,
      contract,
      provider,
      account,
      fetchProject,
      fetchProjects,
      fetchFunders,
      donateProject,
      createProject,
      connectMetamask,
      setLoading,
    }),
    [
      loading,
      contract,
      provider,
      account,
      fetchProject,
      fetchProjects,
      fetchFunders,
      donateProject,
      createProject,
      connectMetamask,
      setLoading,
    ]
  );

  return (
    <ContractContext.Provider value={contextValue}>
      {children}
    </ContractContext.Provider>
  );
};

//   const sendTransaction = async (address: string, amount: number) => {
//     // Web3 Provider
//     try {
//       if (!window.ethereum) alert("You have to connect your account!");
//       if (!account) console.error("Something went wrong. Try again later...");

//       // console.log(account.);
//       const tx = await account?.sendTransaction({
//         from: account.address,
//         to: address,
//         value: parseUnits(amount.toString(), "ether"),
//       });
//       tx?.wait(1);

//       console.log("tx", tx);
//       alert("Transaction success");
//     } catch (error) {
//       console.log(error);
//     }
//   };

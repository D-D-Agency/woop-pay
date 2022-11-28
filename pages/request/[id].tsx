import * as React from "react";
import Image from "next/image";
import Head from "next/head";

import logo from "../../public/web3-pay-logo.png";
import emoji from "../../public/emoji_thumbs_up.png";
import { useRouter } from "next/router";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";

import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  usePrepareSendTransaction,
  useSendTransaction,
} from "wagmi";

import { setEtherscanBase } from "../../utils/constants";

import ERC20 from "../../abi/ERC20.abi.json";
import Wallet from "../../components/Wallet";
import Footer from "../../components/Footer";
import { utils } from "ethers";

interface Request {
  version: string;
  from: string;
  value: string;
  network: string;
  tokenName: string;
  tokenAddress: string;
}

const Request = () => {
  const [request, setRequest] = React.useState<Request>();
  const [amount, setAmount] = React.useState<string>("0.1");
  const [recipient, setRecipient] = React.useState<string>("");
  const [network, setNetwork] = React.useState<string>("");
  const [badRequest, setBadRequest] = React.useState<boolean>(false);
  const [isNativeTx, setIsNativeTx] = React.useState<boolean>(false);
  const router = useRouter();
  const { id } = router.query;

  // querying ipfs
  const callIpfs = async () => {
    try {
      const response = await fetch(
        `https://web3-pay.infura-ipfs.io/ipfs/${id}`
      );
      if (!response.ok) throw new Error(response.statusText);

      const json = await response.json();
      setRequest(json);
      setAmount(json.value);
      setRecipient(json.from);
      setNetwork(setEtherscanBase(json.network));

      if (json.tokenName == "ETH") {
        setIsNativeTx(true);
      }
    } catch (error) {
      console.error(error);
      setBadRequest(true);
    }
  };

  React.useEffect(() => {
    if (id) {
      callIpfs();
    }
  }, [id]);

  // wagmi erc20 transaction
  const {
    config,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareContractWrite({
    address: request?.tokenAddress,
    abi: ERC20,
    functionName: "transfer",
    args: [request?.from, utils.parseEther(amount)],
  });

  const { data, error, isError, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  //wagmi native transaction
  const {
    config: configNative,
    error: prepareErrorNative,
    isError: isPrepareErrorNative,
  } = usePrepareSendTransaction({
    request: {
      to: recipient,
      value: amount ? utils.parseEther(amount) : undefined,
    },
  });
  const {
    data: dataNative,
    error: errorNative,
    isError: isErrorNative,
    sendTransaction,
  } = useSendTransaction(configNative);

  const { isLoading: isLoadingNative, isSuccess: isSuccessNative } =
    useWaitForTransaction({
      hash: dataNative?.hash,
    });

  return (
    <div>
      <Head>
        <title>web3-pay</title>
        <meta name="description" content="web3 payment requests made simple" />
        <link rel="icon" href="../icon.svg" />
      </Head>

      {isNativeTx
        ? (isPrepareErrorNative || isErrorNative) && (
            <Alert variant="filled" severity="error">
              Error: Payment not possible due to insufficient funds or contract
              error
            </Alert>
          )
        : (isPrepareError || isError) && (
            <Alert variant="filled" severity="error">
              Error: Payment not possible due to insufficient funds or contract
              error
            </Alert>
          )}

      {badRequest && (
        <Alert variant="filled" severity="error">
          Error: Payment not found
        </Alert>
      )}

      {isSuccess && (
        <Alert variant="filled" severity="success">
          Payment successful! Track your tx on{" "}
          <a
            className="underline underline-offset-4"
            href={`${network}${data?.hash}`}
          >
            Etherscan
          </a>
        </Alert>
      )}

      {isSuccessNative && (
        <Alert variant="filled" severity="success">
          Payment successful! Track your tx on{" "}
          <a
            className="underline underline-offset-4"
            href={`${network}${dataNative?.hash}`}
          >
            Etherscan
          </a>
        </Alert>
      )}

      <div className="flex items-center justify-between m-7">
        <div>
          <Image alt="web3-pay" src={logo} width={120} height={120} />
        </div>

        <Wallet />
      </div>

      <Container maxWidth="md">
        <Box
          component="form"
          className="mt-20"
          sx={{
            p: 2,
            border: "2px solid grey",
            borderRadius: 10,
          }}
        >
          <div className="grid justify-items-center">
            {badRequest ? (
              <p className="mt-3 text-xl">Is the request url correct? 🤔</p>
            ) : (
              <>
                <p className="m-3 text-xl">
                  From{" "}
                  <strong>
                    {request?.from.slice(0, 4)}...{request?.from.slice(-4)}
                  </strong>
                </p>
                <p className="mt-3 text-xl">
                  Hey 😇, can you please pay me{" "}
                  <strong>
                    {request?.value} {request?.tokenName}
                  </strong>
                </p>
              </>
            )}
            <div className="mt-10 mb-3">
              <Button
                variant="outlined"
                disabled={
                  isNativeTx
                    ? !sendTransaction || isLoadingNative
                    : !write || isLoading
                }
                onClick={
                  isNativeTx ? () => sendTransaction?.() : () => write?.()
                }
              >
                {isNativeTx ? (
                  isLoadingNative ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-3 bg-sky-500"
                        viewBox="0 0 24 24"
                      ></svg>
                      <p>Processing...</p>
                    </>
                  ) : (
                    "Pay"
                  )
                ) : isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-3 bg-sky-500"
                      viewBox="0 0 24 24"
                    ></svg>
                    <p>Processing...</p>
                  </>
                ) : (
                  "Pay"
                )}
              </Button>
            </div>
          </div>
        </Box>
      </Container>

      {isSuccess && (
        <div className="flex justify-center m-7">
          <Image alt="web3-pay-success" src={emoji} width={350} height={350} />
        </div>
      )}

      {isSuccessNative && (
        <div className="flex justify-center m-7">
          <Image alt="web3-pay-success" src={emoji} width={350} height={350} />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Request;
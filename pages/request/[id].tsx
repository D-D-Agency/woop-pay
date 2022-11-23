import * as React from "react";
import Image from "next/image";
import logo from "../../public/web3-pay-logo.png";
import { useRouter } from "next/router";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip";

import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import ERC20 from "../../abi/ERC20.abi.json";
import Wallet from "../../components/Wallet";
import Footer from "../../components/Footer";
import { utils } from "ethers";

interface Request {
  version: string;
  from: string;
  value: string;
  tokenName: string;
  tokenAddress: string;
}

const Request = () => {
  const [request, setRequest] = React.useState<Request>();
  const [amount, setAmount] = React.useState<string>("0.1");
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
      //console.log(json);
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    if (id) {
      callIpfs();
    }
  }, [id]);

  // wagmi transaction
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

  return (
    <div>
      {(isPrepareError || isError) && (
        <Alert variant="filled" severity="error">
          Error: {(prepareError || error)?.message}
        </Alert>
      )}

      {isSuccess && (
        <Alert variant="filled" severity="success">
          Payment successful!{" "}
          <a href={`https://etherscan.io/tx/${data?.hash}`}>
            Track your tx on Etherscan
          </a>
        </Alert>
      )}

      <div className="flex items-center justify-between m-7">
        <Image alt="web3-pay" src={logo} width={150} height={150} />
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
            <div className="mt-10 mb-3">
              <Button
                variant="outlined"
                disabled={!write || isLoading}
                onClick={() => write?.()}
              >
                {isLoading ? (
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

      <Footer />
    </div>
  );
};

export default Request;

import * as React from "react";
import { Share } from "../Share";

import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Button from "@mui/material/Button";
import OutlinedInput from "@mui/material/OutlinedInput";

import { useAccount, useConnect } from "wagmi";
import { uploadIpfs } from "../../utils/ipfs";
import { selectToken } from "../../utils/constants";

import Image from "next/image";
import wethLogo from "../../public/weth.png";
import daiLogo from "../../public/dai.png";
import usdcLogo from "../../public/usdc.png";

import styles from "./payment.module.scss";
import cx from "classnames";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export default function Payment(props: any) {
  const { setBadRequest, setAmountZeroRequest, setNoTokenRequest } = props;
  const [selectedToken, setSelectedToken] = React.useState<{
    tokenId: string;
    logo: any;
  }>({
    tokenId: "DAI",
    logo: daiLogo,
  });
  const [amount, setAmount] = React.useState<string>("0");
  const [path, setPath] = React.useState<string>("");
  const [ipfsLoading, setIpfsLoading] = React.useState<boolean>(false);
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();

  const { isConnected } = useAccount();
  useConnect();

  const handleAmountChange = (event: any) => {
    setAmount(event.target.value as string);
  };

  //main functions
  const createRequest = async () => {
    if (selectedToken !== undefined) {
      return;
    }

    setAmountZeroRequest(false);
    setNoTokenRequest(false);
    setBadRequest(false);

    if (amount == "0") {
      setAmountZeroRequest(true);
    } else if (selectedToken?.tokenId == "") {
      setNoTokenRequest(true);
    } else {
      try {
        setIpfsLoading(true);
        const { path } = await uploadIpfs({
          version: "1.0.0",
          // metadata_id: uuid(), can be used in the future to have a proper payment id
          from: address,
          value: amount,
          tokenName: selectedToken.tokenId,
          tokenAddress: selectToken(selectedToken.tokenId)?.contractAddress,
        }).finally(() => {
          setIpfsLoading(false);
        });
        setPath(path);
      } catch (error) {
        console.error(error);
        setBadRequest(true);
        setIpfsLoading(false);
      }
    }
  };

  const coins = [
    {
      tokenId: "DAI",
      logo: daiLogo,
    },
    {
      tokenId: "USDC",
      logo: usdcLogo,
    },
    {
      tokenId: "WETH",
      logo: wethLogo,
    },
  ];

  React.useEffect(() => {
    setSelectedToken(coins[0]);
    return () => {};
  }, []);

  // to refactor the menu item part by using .map
  return (
    <>
      <section className="fixed p-4 bg-white">
        {/* <InputLabel>{selectedToken.tokenId ? "ERC20" : "Select"}</InputLabel> */}

        {coins.map((coin) => {
          return (
            <MenuItem
              key={coin.tokenId}
              onClick={() => setSelectedToken(coin.tokenId)}
              value={coin.tokenId}>
              <div className="flex items-center">
                <Image
                  alt={coin.tokenId}
                  src={coin.logo}
                  width={20}
                  height={20}
                />
                <span className="ml-3">DAI</span>
              </div>
            </MenuItem>
          );
        })}
      </section>
      <div className="p-2 flex flex-col w-full">
        <p className="font-medium font-base text-sm text-white mb-2 pl-2">
          <span className="md:block hidden">Select the amount to receive:</span>
          <span className="md:hidden">Receiving:</span>
        </p>

        <div className="relative">
          <input
            autoFocus={isConnected}
            className={cx(
              styles.mainInput,
              "border-white rounded-xl border font-medium text-3xl focus:outline-0 focus:white w-full h-16 mb-3 font-sans text-white bg-transparent pl-4"
            )}
            type="number"
            step="0.000000"
            placeholder="0.00"
            onChange={handleAmountChange}></input>
          <Button
            sx={{
              width: 120,
              position: "absolute",
              top: -23,
              right: 25,
            }}>
            {selectedToken.tokenId}
          </Button>
        </div>
        <button
          className={cx(
            "border-white border font-base text-lg focus:outline-0 focus:text-slate-700 w-full h-16 rounded-xl transition-all font-bold text-white capitalize hover:border-white hover:bg-white hover:text-slate-700"
          )}
          onClick={isConnected ? createRequest : openConnectModal}>
          {ipfsLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-3 bg-sky-500"
                viewBox="0 0 24 24"></svg>
              <p>Processing...</p>
            </>
          ) : isConnected ? (
            "Create a Woop"
          ) : (
            "Connect Wallet"
          )}
        </button>
      </div>
      <div className="flex justify-center">
        <Share
          path={path}
          amount={amount}
          tokenLabel={selectedToken?.tokenId}
        />
      </div>
    </>
  );
}

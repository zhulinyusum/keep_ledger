"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../solana/solana-provider";
import { AppHero, ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { useJournalProgram } from "./journal-data-access";
import { JournalCreate, JournalList,JournalCreate1 } from "./journal-ui";

export default function JournalFeature() {
  const { publicKey } = useWallet();
  const { programId } = useJournalProgram();

  return publicKey ? (
    <div>
      <AppHero title="" subtitle={""}>
        <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
          <JournalCreate1 />
      <p className="mb-6"/>
        <JournalCreate />

      </AppHero>
      <JournalList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
